// src/pages/AdminStudyTracksPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

type TrackStatus = "active" | "inactive";

type StudyTrack = {
  docId: string;
  code: string;
  name: string;
  description: string;
  status: TrackStatus;
  notes?: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
};

type FormState = {
  code: string;
  name: string;
  description: string;
  status: string;
  notes: string;
};

const emptyForm: FormState = {
  code: "",
  name: "",
  description: "",
  status: "",
  notes: "",
};

const formatDateTimeIL = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
};

const normalize = (value: string) => value.trim().toLowerCase();

const isValidCode = (value: string) => /^[A-Za-z0-9_]+$/.test(value);

const statusChip = (status: TrackStatus) =>
  status === "active" ? (
    <Chip label="פעיל" color="success" size="small" />
  ) : (
    <Chip label="לא פעיל" color="default" size="small" />
  );

const AdminStudyTracksPage = () => {
  const [tab, setTab] = useState(0);
  const [tracks, setTracks] = useState<StudyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [editTouched, setEditTouched] = useState<Record<string, boolean>>({});

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ docId: string; code: string } | null>(
    null
  );

  const currentUser = localStorage.getItem("authUser") || "admin";

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "study_tracks"),
      (snap) => {
        const items: StudyTrack[] = snap.docs.map((d) => {
          const data = d.data() as Partial<StudyTrack>;
          return {
            docId: d.id,
            code: String(data.code ?? ""),
            name: String(data.name ?? ""),
            description: String(data.description ?? ""),
            status: (data.status === "active" || data.status === "inactive"
              ? data.status
              : "inactive") as TrackStatus,
            notes: String(data.notes ?? ""),
            updatedAt: data.updatedAt as Timestamp | undefined,
            updatedBy: String(data.updatedBy ?? ""),
          };
        });

        items.sort((a, b) => {
          const at = a.updatedAt?.toMillis?.() ?? 0;
          const bt = b.updatedAt?.toMillis?.() ?? 0;
          return bt - at;
        });

        setTracks(items);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );

    return () => unsub();
  }, []);

  const onChangeForm =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      setFormTouched((t) => ({ ...t, [field]: true }));
    };

  const onChangeEdit =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditForm((p) => ({ ...p, [field]: e.target.value }));
      setEditTouched((t) => ({ ...t, [field]: true }));
    };

  const formErrors = useMemo(() => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    const code = form.code.trim();
    const name = form.name.trim();
    const description = form.description.trim();
    const notes = form.notes.trim();

    if (!code) errors.code = "שדה חובה";
    else if (!isValidCode(code)) errors.code = "מותר אותיות, מספרים וקו תחתון בלבד";
    else if (tracks.some((t) => normalize(t.code) === normalize(code)))
      errors.code = "קוד מסלול חייב להיות ייחודי";

    if (!name) errors.name = "שדה חובה";
    else if (tracks.some((t) => normalize(t.name) === normalize(name)))
      errors.name = "שם מסלול חייב להיות ייחודי";

    if (!description) errors.description = "שדה חובה";
    else if (description.length > 500) errors.description = "מקסימום 500 תווים";

    if (!form.status) errors.status = "שדה חובה";

    if (notes && notes.length > 300) errors.notes = "מקסימום 300 תווים";

    return errors;
  }, [form, tracks]);

  const editErrors = useMemo(() => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    const code = editForm.code.trim();
    const name = editForm.name.trim();
    const description = editForm.description.trim();
    const notes = editForm.notes.trim();

    if (!code) errors.code = "שדה חובה";
    else if (!isValidCode(code)) errors.code = "מותר אותיות, מספרים וקו תחתון בלבד";
    else if (
      tracks.some((t) => normalize(t.code) === normalize(code) && t.docId !== editDocId)
    )
      errors.code = "קוד מסלול חייב להיות ייחודי";

    if (!name) errors.name = "שדה חובה";
    else if (
      tracks.some((t) => normalize(t.name) === normalize(name) && t.docId !== editDocId)
    )
      errors.name = "שם מסלול חייב להיות ייחודי";

    if (!description) errors.description = "שדה חובה";
    else if (description.length > 500) errors.description = "מקסימום 500 תווים";

    if (!editForm.status) errors.status = "שדה חובה";

    if (notes && notes.length > 300) errors.notes = "מקסימום 300 תווים";

    return errors;
  }, [editForm, editDocId, tracks]);

  const canSave = Object.keys(formErrors).length === 0;
  const canSaveEdit = Object.keys(editErrors).length === 0;

  const handleAddTrack = async () => {
    setFormTouched({
      code: true,
      name: true,
      description: true,
      status: true,
      notes: true,
    });

    if (!canSave) return;

    try {
      await addDoc(collection(db, "study_tracks"), {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status as TrackStatus,
        notes: form.notes.trim(),
        updatedAt: serverTimestamp(),
        updatedBy: currentUser,
      });

      setForm(emptyForm);
      setFormTouched({});
      setSnack({ open: true, msg: "מסלול נשמר בהצלחה" });
      setTab(0);
    } catch {
      setSnack({ open: true, msg: "שגיאה בשמירה. נסי שוב." });
    }
  };

  const openEdit = (t: StudyTrack) => {
    setEditDocId(t.docId);
    setEditForm({
      code: t.code,
      name: t.name,
      description: t.description,
      status: t.status,
      notes: t.notes ?? "",
    });
    setEditTouched({});
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editDocId) return;

    setEditTouched({
      code: true,
      name: true,
      description: true,
      status: true,
      notes: true,
    });

    if (!canSaveEdit) return;

    try {
      await updateDoc(doc(db, "study_tracks", editDocId), {
        code: editForm.code.trim(),
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        status: editForm.status as TrackStatus,
        notes: editForm.notes.trim(),
        updatedAt: serverTimestamp(),
        updatedBy: currentUser,
      });
      setEditOpen(false);
      setSnack({ open: true, msg: "העדכון נשמר בהצלחה" });
    } catch {
      setSnack({ open: true, msg: "שגיאה בעדכון. נסי שוב." });
    }
  };

  const openDelete = (t: StudyTrack) => {
    setDeleteTarget({ docId: t.docId, code: t.code });
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, "study_tracks", deleteTarget.docId));
      setDeleteOpen(false);
      setSnack({ open: true, msg: "נמחק בהצלחה" });
    } catch {
      setSnack({ open: true, msg: "שגיאה במחיקה. נסי שוב." });
    }
  };

  return (
    <Box dir="rtl">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" align="center" fontWeight={700} color="success.main">
          המחלקה למדעי המחשב
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          מערכת ניהול – מסלולי לימוד
        </Typography>

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, bgcolor: "background.paper" }}>
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            centered
            sx={{ mb: 3, "& .MuiTab-root": { fontWeight: 600 } }}
          >
            <Tab label="רשימת מסלולים" />
            <Tab label="הוספת מסלול חדש" />
          </Tabs>

          {tab === 0 && (
            <Box>
              <Box
                mb={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
              >
                <Typography variant="h5" fontWeight={600}>
                  רשימת מסלולים
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: 999, px: 3 }}
                  onClick={() => setTab(1)}
                >
                  הוספת מסלול חדש
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                מספר המסלולים במערכת: {tracks.length}
              </Typography>

              <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "background.paper" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>פעולות</TableCell>
                      <TableCell>סטטוס</TableCell>
                      <TableCell>עודכן</TableCell>
                      <TableCell>שם מסלול</TableCell>
                      <TableCell>קוד מסלול</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tracks.map((t) => (
                      <TableRow key={t.docId} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<EditIcon fontSize="small" />}
                              onClick={() => openEdit(t)}
                            >
                              עריכה
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineIcon fontSize="small" />}
                              onClick={() => openDelete(t)}
                            >
                              מחיקה
                            </Button>
                          </Stack>
                        </TableCell>
                        <TableCell>{statusChip(t.status)}</TableCell>
                        <TableCell>
                          {t.updatedAt?.toDate
                            ? formatDateTimeIL(t.updatedAt.toDate())
                            : "—"}
                        </TableCell>
                        <TableCell>{t.name}</TableCell>
                        <TableCell>{t.code}</TableCell>
                      </TableRow>
                    ))}
                    {tracks.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography align="center" color="text.secondary">
                            אין מסלולים להצגה.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={2}>
                הוספת מסלול חדש
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                שדות חובה: קוד מסלול, שם מסלול, תיאור, סטטוס. תאריך עדכון נוצר אוטומטית.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="קוד מסלול (לדוגמה: TRK_MORNING)"
                    value={form.code}
                    onChange={onChangeForm("code")}
                    error={!!formErrors.code && !!formTouched.code}
                    helperText={formTouched.code ? formErrors.code : "אותיות/מספרים וקו תחתון בלבד"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="שם מסלול (בוקר/ערב או ייחודי)"
                    value={form.name}
                    onChange={onChangeForm("name")}
                    error={!!formErrors.name && !!formTouched.name}
                    helperText={formTouched.name ? formErrors.name : "אפשר גם טקסט חופשי ייחודי"}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="תיאור מסלול"
                    value={form.description}
                    onChange={onChangeForm("description")}
                    error={!!formErrors.description && !!formTouched.description}
                    helperText={formTouched.description ? formErrors.description : "עד 500 תווים"}
                    multiline
                    minRows={3}
                    inputProps={{ maxLength: 500 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="סטטוס מסלול"
                    value={form.status}
                    onChange={onChangeForm("status")}
                    error={!!formErrors.status && !!formTouched.status}
                    helperText={formTouched.status ? formErrors.status : " "}
                  >
                    <MenuItem value="">בחרי</MenuItem>
                    <MenuItem value="active">פעיל</MenuItem>
                    <MenuItem value="inactive">לא פעיל</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="תאריך עדכון"
                    value="נוצר אוטומטית בעת שמירה"
                    disabled
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="תנאים/הערות מיוחדות (אופציונלי)"
                    value={form.notes}
                    onChange={onChangeForm("notes")}
                    error={!!formErrors.notes && !!formTouched.notes}
                    helperText={formTouched.notes ? formErrors.notes : "עד 300 תווים"}
                    multiline
                    minRows={2}
                    inputProps={{ maxLength: 300 }}
                  />
                </Grid>
              </Grid>

              {!canSave && (
                <Box mt={2}>
                  <Alert severity="info">יש למלא שדות חובה ולתקן שגיאות לפני שמירה.</Alert>
                </Box>
              )}

              <Box mt={4} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="success"
                  sx={{ borderRadius: 999, px: 4 }}
                  onClick={handleAddTrack}
                  disabled={!canSave}
                >
                  שמירה
                </Button>
                <Button
                  variant="outlined"
                  sx={{ borderRadius: 999, px: 4 }}
                  onClick={() => {
                    setForm(emptyForm);
                    setFormTouched({});
                  }}
                >
                  ניקוי שדות
                </Button>
                <Button variant="text" sx={{ borderRadius: 999 }} onClick={() => setTab(0)}>
                  חזרה לרשימה
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>עריכת מסלול</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="קוד מסלול"
                value={editForm.code}
                onChange={onChangeEdit("code")}
                error={!!editErrors.code && !!editTouched.code}
                helperText={editTouched.code ? editErrors.code : " "}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="שם מסלול"
                value={editForm.name}
                onChange={onChangeEdit("name")}
                error={!!editErrors.name && !!editTouched.name}
                helperText={editTouched.name ? editErrors.name : " "}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="תיאור מסלול"
                value={editForm.description}
                onChange={onChangeEdit("description")}
                error={!!editErrors.description && !!editTouched.description}
                helperText={editTouched.description ? editErrors.description : " "}
                multiline
                minRows={3}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                required
                label="סטטוס מסלול"
                value={editForm.status}
                onChange={onChangeEdit("status")}
                error={!!editErrors.status && !!editTouched.status}
                helperText={editTouched.status ? editErrors.status : " "}
              >
                <MenuItem value="">בחרי</MenuItem>
                <MenuItem value="active">פעיל</MenuItem>
                <MenuItem value="inactive">לא פעיל</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="תאריך עדכון"
                value="מתעדכן אוטומטית בעת שמירה"
                disabled
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תנאים/הערות מיוחדות (אופציונלי)"
                value={editForm.notes}
                onChange={onChangeEdit("notes")}
                error={!!editErrors.notes && !!editTouched.notes}
                helperText={editTouched.notes ? editErrors.notes : " "}
                multiline
                minRows={2}
                inputProps={{ maxLength: 300 }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)}>ביטול</Button>
          <Button variant="contained" color="success" onClick={saveEdit} disabled={!canSaveEdit}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>מחיקת מסלול</DialogTitle>
        <DialogContent>
          <Typography>
            למחוק את המסלול עם קוד: <b>{deleteTarget?.code}</b> ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>ביטול</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={2200}
        onClose={() => setSnack({ open: false, msg: "" })}
        message={snack.msg}
      />
    </Box>
  );
};

export default AdminStudyTracksPage;

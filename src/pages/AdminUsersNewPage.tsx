// src/pages/AdminCandidatesPage.tsx
import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type CandidateStatus = "accepted" | "pending" | "rejected";
type Track = "בוקר" | "ערב";

interface Candidate {
  id: string; // ת.ז
  fullName: string;
  psychometric: number; // 200-800
  bagrutAverage: number; // 55-120
  mathUnits: 3 | 4 | 5;
  englishUnits: 3 | 4 | 5;
  preferredTrack: Track;
  status: CandidateStatus;
}

type CandidateForm = {
  fullName: string;
  idNumber: string;
  psychometric: string;
  bagrutAverage: string;
  mathUnits: string;
  englishUnits: string;
  preferredTrack: string;
  status: string;
};

const initialForm: CandidateForm = {
  fullName: "",
  idNumber: "",
  psychometric: "",
  bagrutAverage: "",
  mathUnits: "",
  englishUnits: "",
  preferredTrack: "",
  status: "",
};

const seedCandidates: Candidate[] = [
  {
    id: "234567890",
    fullName: "נועה לוי",
    psychometric: 720,
    bagrutAverage: 102,
    mathUnits: 5,
    englishUnits: 5,
    preferredTrack: "בוקר",
    status: "accepted",
  },
  {
    id: "345678901",
    fullName: "יואב כהן",
    psychometric: 650,
    bagrutAverage: 95,
    mathUnits: 5,
    englishUnits: 4,
    preferredTrack: "ערב",
    status: "pending",
  },
  {
    id: "456789012",
    fullName: "אורית ישראלי",
    psychometric: 710,
    bagrutAverage: 108,
    mathUnits: 5,
    englishUnits: 5,
    preferredTrack: "בוקר",
    status: "accepted",
  },
  {
    id: "567890123",
    fullName: "רועי ברק",
    psychometric: 580,
    bagrutAverage: 78,
    mathUnits: 4,
    englishUnits: 4,
    preferredTrack: "ערב",
    status: "rejected",
  },
];

function statusChip(status: CandidateStatus) {
  switch (status) {
    case "accepted":
      return <Chip label="התקבל" color="success" size="small" />;
    case "pending":
      return <Chip label="בדיקה" color="warning" size="small" />;
    case "rejected":
      return <Chip label="נדחה" color="error" size="small" />;
  }
}

function isDigitsOnly(s: string) {
  return /^[0-9]+$/.test(s);
}

function isHebrewOrEnglishLettersAndSpaces(s: string) {
  // מאפשר עברית/אנגלית + רווחים + מקף/גרש (שמות אמיתיים)
  return /^[A-Za-z\u0590-\u05FF\s'’-]+$/.test(s.trim());
}

function validateForm(
  form: CandidateForm,
  existingIds: Set<string>,
  mode: "add" | "edit",
  editingId?: string
) {
  const errors: Partial<Record<keyof CandidateForm, string>> = {};

  const fullName = form.fullName.trim();
  if (!fullName) errors.fullName = "חובה להזין שם מלא";
  else if (!isHebrewOrEnglishLettersAndSpaces(fullName))
    errors.fullName = "שם מלא יכול להכיל אותיות ורווחים בלבד";
  else if (fullName.split(/\s+/).length < 2)
    errors.fullName = "יש להזין לפחות שם פרטי + שם משפחה";

  const id = form.idNumber.trim();
  if (!id) errors.idNumber = "חובה להזין תעודת זהות";
  else if (!isDigitsOnly(id)) errors.idNumber = "תעודת זהות חייבת להכיל ספרות בלבד";
  else if (id.length !== 9) errors.idNumber = "תעודת זהות חייבת להיות 9 ספרות";
  else {
    const isSameAsEditing = mode === "edit" && editingId && id === editingId;
    if (!isSameAsEditing && existingIds.has(id)) {
      errors.idNumber = "כבר קיים מועמד עם תעודת זהות זו";
    }
  }

  const psychoStr = form.psychometric.trim();
  if (!psychoStr) errors.psychometric = "חובה להזין ציון פסיכומטרי";
  else if (!isDigitsOnly(psychoStr)) errors.psychometric = "פסיכומטרי חייב להיות מספר";
  else {
    const v = Number(psychoStr);
    if (v < 200 || v > 800) errors.psychometric = "טווח תקין: 200–800";
  }

  const bagrutStr = form.bagrutAverage.trim();
  if (!bagrutStr) errors.bagrutAverage = "חובה להזין ממוצע בגרות";
  else if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(bagrutStr))
    errors.bagrutAverage = "ממוצע בגרות חייב להיות מספר (אפשר עשרוני)";
  else {
    const v = Number(bagrutStr);
    if (v < 55 || v > 120) errors.bagrutAverage = "טווח תקין: 55–120";
  }

  if (!form.mathUnits) errors.mathUnits = "חובה לבחור יחידות מתמטיקה";
  else if (!["3", "4", "5"].includes(form.mathUnits))
    errors.mathUnits = "בחירה לא תקינה";

  if (!form.englishUnits) errors.englishUnits = "חובה לבחור יחידות אנגלית";
  else if (!["3", "4", "5"].includes(form.englishUnits))
    errors.englishUnits = "בחירה לא תקינה";

  if (!form.preferredTrack) errors.preferredTrack = "חובה לבחור מסלול מועדף";
  else if (!["בוקר", "ערב"].includes(form.preferredTrack))
    errors.preferredTrack = "בחירה לא תקינה";

  if (!form.status) errors.status = "חובה לבחור סטטוס";
  else if (!["accepted", "pending", "rejected"].includes(form.status))
    errors.status = "בחירה לא תקינה";

  return errors;
}

const AdminCandidatesPage = () => {
  // 0 = רשימה, 1 = הוספה
  const [tab, setTab] = useState(0);

  // ✅ רשימה אמיתית ב-state כדי שמחיקה/עריכה יעבדו
  const [candidates, setCandidates] = useState<Candidate[]>(seedCandidates);

  const [form, setForm] = useState<CandidateForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CandidateForm, string>>>(
    {}
  );
  const [saved, setSaved] = useState(false);

  const [query, setQuery] = useState("");

  // עריכה
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CandidateForm>(initialForm);
  const [editErrors, setEditErrors] = useState<
    Partial<Record<keyof CandidateForm, string>>
  >({});

  // מחיקה
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const existingIds = useMemo(() => new Set(candidates.map((c) => c.id)), [candidates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;

    return candidates.filter((c) => {
      const statusText =
        c.status === "accepted" ? "התקבל" : c.status === "pending" ? "בדיקה" : "נדחה";
      return (
        c.id.includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.preferredTrack.toLowerCase().includes(q) ||
        statusText.includes(q)
      );
    });
  }, [candidates, query]);

  const handleChangeForm =
    (field: keyof CandidateForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setSaved(false);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSave = () => {
    const vErrors = validateForm(form, existingIds, "add");
    setErrors(vErrors);

    if (Object.keys(vErrors).length > 0) {
      setSaved(false);
      return;
    }

    const newCandidate: Candidate = {
      id: form.idNumber.trim(),
      fullName: form.fullName.trim(),
      psychometric: Number(form.psychometric),
      bagrutAverage: Number(form.bagrutAverage),
      mathUnits: Number(form.mathUnits) as 3 | 4 | 5,
      englishUnits: Number(form.englishUnits) as 3 | 4 | 5,
      preferredTrack: form.preferredTrack as Track,
      status: form.status as CandidateStatus,
    };

    setCandidates((prev) => [newCandidate, ...prev]);
    setSaved(true);
    setForm(initialForm);
    setErrors({});
    setTab(0); // אחרי שמירה חוזרים לרשימה
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSaved(false);
  };

  const openEdit = (c: Candidate) => {
    setEditingId(c.id);
    setEditForm({
      fullName: c.fullName,
      idNumber: c.id,
      psychometric: String(c.psychometric),
      bagrutAverage: String(c.bagrutAverage),
      mathUnits: String(c.mathUnits),
      englishUnits: String(c.englishUnits),
      preferredTrack: c.preferredTrack,
      status: c.status,
    });
    setEditErrors({});
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editingId) return;

    const vErrors = validateForm(editForm, existingIds, "edit", editingId);
    setEditErrors(vErrors);

    if (Object.keys(vErrors).length > 0) return;

    const updated: Candidate = {
      id: editForm.idNumber.trim(),
      fullName: editForm.fullName.trim(),
      psychometric: Number(editForm.psychometric),
      bagrutAverage: Number(editForm.bagrutAverage),
      mathUnits: Number(editForm.mathUnits) as 3 | 4 | 5,
      englishUnits: Number(editForm.englishUnits) as 3 | 4 | 5,
      preferredTrack: editForm.preferredTrack as Track,
      status: editForm.status as CandidateStatus,
    };

    setCandidates((prev) =>
      prev.map((c) => (c.id === editingId ? updated : c))
    );
    setEditOpen(false);
    setEditingId(null);
  };

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setCandidates((prev) => prev.filter((c) => c.id !== deleteId));
    setDeleteOpen(false);
    setDeleteId(null);
  };

  return (
    <Box dir="rtl">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" align="center" fontWeight={700} color="success.main">
          המחלקה למדעי המחשב
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          מערכת ניהול – מועמדים
        </Typography>

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, bgcolor: "#f7fbf7" }}>
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            centered
            sx={{ mb: 3, "& .MuiTab-root": { fontWeight: 600 } }}
          >
            <Tab label="רשימת מועמדים" />
            <Tab label="הוספת מועמד חדש" />
          </Tabs>

          {/* ================= טאב 1 – רשימת מועמדים ================= */}
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
                  רשימת מועמדים
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: 999, px: 3 }}
                    onClick={() => setTab(1)}
                  >
                    הוספת מועמד חדש
                  </Button>

                  <TextField
                    size="small"
                    placeholder="חיפוש לפי שם, ת.ז או סטטוס..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Stack>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                מספר המועמדים במערכת: {filtered.length}
              </Typography>

              <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "white" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>פעולות</TableCell>
                      <TableCell>סטטוס</TableCell>
                      <TableCell>מסלול מועדף</TableCell>
                      <TableCell>יח׳ אנגלית</TableCell>
                      <TableCell>יח׳ מתמטיקה</TableCell>
                      <TableCell>ממוצע בגרות</TableCell>
                      <TableCell>ציון פסיכומטרי</TableCell>
                      <TableCell>שם מלא</TableCell>
                      <TableCell>ת.ז</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<EditIcon fontSize="small" />}
                              onClick={() => openEdit(c)}
                            >
                              עריכה
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineIcon fontSize="small" />}
                              onClick={() => openDelete(c.id)}
                            >
                              מחיקה
                            </Button>
                          </Stack>
                        </TableCell>
                        <TableCell>{statusChip(c.status)}</TableCell>
                        <TableCell>{c.preferredTrack}</TableCell>
                        <TableCell>{c.englishUnits}</TableCell>
                        <TableCell>{c.mathUnits}</TableCell>
                        <TableCell>{c.bagrutAverage}</TableCell>
                        <TableCell>{c.psychometric}</TableCell>
                        <TableCell>{c.fullName}</TableCell>
                        <TableCell>{c.id}</TableCell>
                      </TableRow>
                    ))}

                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                            לא נמצאו תוצאות
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>

              {saved && (
                <Box mt={2}>
                  <Alert severity="success">המועמד נשמר בהצלחה.</Alert>
                </Box>
              )}
            </Box>
          )}

          {/* ================= טאב 2 – הוספת מועמד חדש ================= */}
          {tab === 1 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={2}>
                הוספת מועמד חדש
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                הזיני את פרטי המועמד. שדות חובה חייבים להיות תקינים כדי לשמור.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="שם מלא"
                    value={form.fullName}
                    onChange={handleChangeForm("fullName")}
                    error={!!errors.fullName}
                    helperText={errors.fullName || "לדוגמה: נועה לוי"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="תעודת זהות (9 ספרות)"
                    value={form.idNumber}
                    onChange={handleChangeForm("idNumber")}
                    inputProps={{ inputMode: "numeric" }}
                    error={!!errors.idNumber}
                    helperText={errors.idNumber || "ספרות בלבד"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="ציון פסיכומטרי"
                    value={form.psychometric}
                    onChange={handleChangeForm("psychometric")}
                    inputProps={{ inputMode: "numeric" }}
                    error={!!errors.psychometric}
                    helperText={errors.psychometric || "טווח: 200–800"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="ממוצע בגרות"
                    value={form.bagrutAverage}
                    onChange={handleChangeForm("bagrutAverage")}
                    error={!!errors.bagrutAverage}
                    helperText={errors.bagrutAverage || "טווח: 55–120 (אפשר עשרוני)"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="יחידות מתמטיקה"
                    value={form.mathUnits}
                    onChange={handleChangeForm("mathUnits")}
                    error={!!errors.mathUnits}
                    helperText={errors.mathUnits || "בחרי 3/4/5"}
                  >
                    <MenuItem value="3">3 יח״ל</MenuItem>
                    <MenuItem value="4">4 יח״ל</MenuItem>
                    <MenuItem value="5">5 יח״ל</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="יחידות אנגלית"
                    value={form.englishUnits}
                    onChange={handleChangeForm("englishUnits")}
                    error={!!errors.englishUnits}
                    helperText={errors.englishUnits || "בחרי 3/4/5"}
                  >
                    <MenuItem value="3">3 יח״ל</MenuItem>
                    <MenuItem value="4">4 יח״ל</MenuItem>
                    <MenuItem value="5">5 יח״ל</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="מסלול מועדף"
                    value={form.preferredTrack}
                    onChange={handleChangeForm("preferredTrack")}
                    error={!!errors.preferredTrack}
                    helperText={errors.preferredTrack || "בחרי בוקר/ערב"}
                  >
                    <MenuItem value="בוקר">בוקר</MenuItem>
                    <MenuItem value="ערב">ערב</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="סטטוס הרשמה"
                    value={form.status}
                    onChange={handleChangeForm("status")}
                    error={!!errors.status}
                    helperText={errors.status || "בחרי סטטוס"}
                  >
                    <MenuItem value="accepted">התקבל</MenuItem>
                    <MenuItem value="pending">בדיקה</MenuItem>
                    <MenuItem value="rejected">נדחה</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Box mt={4} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="success"
                  sx={{ borderRadius: 999, px: 4 }}
                  onClick={handleSave}
                >
                  שמירה
                </Button>
                <Button variant="outlined" sx={{ borderRadius: 999, px: 4 }} onClick={handleReset}>
                  ניקוי שדות
                </Button>
              </Box>

              {Object.keys(errors).length > 0 && (
                <Box mt={2}>
                  <Alert severity="error">
                    יש שדות לא תקינים. תקני את השדות המסומנים באדום.
                  </Alert>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Container>

      {/* ===== Dialog עריכה ===== */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>עריכת מועמד</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            {(
              [
                { key: "fullName", label: "שם מלא", required: true },
                { key: "idNumber", label: "תעודת זהות (9 ספרות)", required: true },
                { key: "psychometric", label: "ציון פסיכומטרי", required: true },
                { key: "bagrutAverage", label: "ממוצע בגרות", required: true },
              ] as const
            ).map((f) => (
              <Grid item xs={12} md={6} key={f.key}>
                <TextField
                  fullWidth
                  required={f.required}
                  label={f.label}
                  value={editForm[f.key]}
                  onChange={(e) => {
                    setEditForm((prev) => ({ ...prev, [f.key]: e.target.value }));
                    setEditErrors((prev) => ({ ...prev, [f.key]: undefined }));
                  }}
                  error={!!editErrors[f.key]}
                  helperText={editErrors[f.key]}
                />
              </Grid>
            ))}

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                required
                label="יחידות מתמטיקה"
                value={editForm.mathUnits}
                onChange={(e) => {
                  setEditForm((prev) => ({ ...prev, mathUnits: e.target.value }));
                  setEditErrors((prev) => ({ ...prev, mathUnits: undefined }));
                }}
                error={!!editErrors.mathUnits}
                helperText={editErrors.mathUnits}
              >
                <MenuItem value="3">3 יח״ל</MenuItem>
                <MenuItem value="4">4 יח״ל</MenuItem>
                <MenuItem value="5">5 יח״ל</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                required
                label="יחידות אנגלית"
                value={editForm.englishUnits}
                onChange={(e) => {
                  setEditForm((prev) => ({ ...prev, englishUnits: e.target.value }));
                  setEditErrors((prev) => ({ ...prev, englishUnits: undefined }));
                }}
                error={!!editErrors.englishUnits}
                helperText={editErrors.englishUnits}
              >
                <MenuItem value="3">3 יח״ל</MenuItem>
                <MenuItem value="4">4 יח״ל</MenuItem>
                <MenuItem value="5">5 יח״ל</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                required
                label="מסלול מועדף"
                value={editForm.preferredTrack}
                onChange={(e) => {
                  setEditForm((prev) => ({ ...prev, preferredTrack: e.target.value }));
                  setEditErrors((prev) => ({ ...prev, preferredTrack: undefined }));
                }}
                error={!!editErrors.preferredTrack}
                helperText={editErrors.preferredTrack}
              >
                <MenuItem value="בוקר">בוקר</MenuItem>
                <MenuItem value="ערב">ערב</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                required
                label="סטטוס"
                value={editForm.status}
                onChange={(e) => {
                  setEditForm((prev) => ({ ...prev, status: e.target.value }));
                  setEditErrors((prev) => ({ ...prev, status: undefined }));
                }}
                error={!!editErrors.status}
                helperText={editErrors.status}
              >
                <MenuItem value="accepted">התקבל</MenuItem>
                <MenuItem value="pending">בדיקה</MenuItem>
                <MenuItem value="rejected">נדחה</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {Object.keys(editErrors).length > 0 && (
            <Box mt={2}>
              <Alert severity="error">יש שדות לא תקינים בעריכה.</Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} variant="text">
            ביטול
          </Button>
          <Button onClick={saveEdit} variant="contained" color="success" sx={{ borderRadius: 999, px: 3 }}>
            שמירת שינויים
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Dialog מחיקה ===== */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>מחיקת מועמד</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            למחוק את המועמד עם ת.ז: <b>{deleteId}</b> ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="text">
            ביטול
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 999, px: 3 }}
          >
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCandidatesPage;


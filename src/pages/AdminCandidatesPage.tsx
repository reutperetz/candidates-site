// src/pages/AdminCandidatesPage.tsx
import { useEffect, useMemo, useState } from "react";
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
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";

import Grid from "@mui/material/GridLegacy";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// Firestore
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

type CandidateStatus = "accepted" | "pending" | "rejected";
type PreferredTrack = "בוקר" | "ערב";
type Units = 3 | 4 | 5;

interface Candidate {
  docId: string; // Firestore Document ID
  idNumber: string; // ת.ז (כשדה רגיל)
  fullName: string;
  psychometric: number; // 200-800
  bagrutAverage: number; // 60-120
  mathUnits: Units;
  englishUnits: Units;
  preferredTrack: PreferredTrack;
  status: CandidateStatus;
  createdAtText: string; // dd/mm/yyyy לתצוגה
  createdAt?: Timestamp; // לשמירה/מיון (אופציונלי)
}

const formatDateIL = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
};

const statusChip = (status: CandidateStatus) => {
  switch (status) {
    case "accepted":
      return <Chip label="התקבל" color="success" size="small" />;
    case "pending":
      return <Chip label="בדיקה" color="warning" size="small" />;
    case "rejected":
      return <Chip label="נדחה" color="error" size="small" />;
  }
};

type FormState = {
  fullName: string;
  idNumber: string;
  psychometric: string;
  bagrutAverage: string;
  mathUnits: string;
  englishUnits: string;
  preferredTrack: string;
  status: string;
};

const emptyForm: FormState = {
  fullName: "",
  idNumber: "",
  psychometric: "",
  bagrutAverage: "",
  mathUnits: "",
  englishUnits: "",
  preferredTrack: "",
  status: "",
};

function isHebrewNameLike(fullName: string) {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  if (!trimmed) return false;
  const parts = trimmed.split(" ");
  if (parts.length < 2) return false;
  return /^[A-Za-z\u0590-\u05FF ]+$/.test(trimmed);
}

function isIsraeliId9Digits(id: string) {
  return /^\d{9}$/.test(id);
}

function toIntSafe(v: string) {
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function inRange(n: number | null, min: number, max: number) {
  return n !== null && n >= min && n <= max;
}

function coerceUnits(v: unknown): Units {
  const n = Number(v);
  return (n === 3 || n === 4 || n === 5 ? n : 3) as Units;
}

function coerceStatus(v: unknown): CandidateStatus {
  return v === "accepted" || v === "pending" || v === "rejected" ? v : "pending";
}

function coerceTrack(v: unknown): PreferredTrack {
  return v === "בוקר" || v === "ערב" ? v : "בוקר";
}

const AdminCandidatesPage = () => {
  // 0 = רשימה, 1 = הוספה
  const [tab, setTab] = useState(0);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [query, setQuery] = useState("");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  // עריכה
  const [editOpen, setEditOpen] = useState(false);
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [editTouched, setEditTouched] = useState<Record<string, boolean>>({});

  // מחיקה
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ docId: string; idNumber: string } | null>(
    null
  );

  // ===== Firestore: טעינה בזמן אמת =====
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "candidates"), (snap) => {
      const items: Candidate[] = snap.docs.map((d) => {
        const data = d.data() as any;

        const createdAtTs: Timestamp | undefined = data.createdAt;
        const createdAtText: string =
          data.createdAtText ||
          (createdAtTs?.toDate ? formatDateIL(createdAtTs.toDate()) : "");

        return {
          docId: d.id,
          idNumber: String(data.idNumber ?? ""),
          fullName: String(data.fullName ?? ""),
          psychometric: Number(data.psychometric ?? 0),
          bagrutAverage: Number(data.bagrutAverage ?? 0),
          mathUnits: coerceUnits(data.mathUnits),
          englishUnits: coerceUnits(data.englishUnits),
          preferredTrack: coerceTrack(data.preferredTrack),
          status: coerceStatus(data.status),
          createdAtText,
          createdAt: createdAtTs,
        };
      });

      // מיון: חדשים למעלה (אם יש createdAt)
      items.sort((a, b) => {
        const at = a.createdAt?.toMillis?.() ?? 0;
        const bt = b.createdAt?.toMillis?.() ?? 0;
        return bt - at;
      });

      setCandidates(items);
    });

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;

    return candidates.filter((c) => {
      const statusText =
        c.status === "accepted" ? "התקבל" : c.status === "pending" ? "בדיקה" : "נדחה";
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.idNumber.includes(q) ||
        c.preferredTrack.includes(q) ||
        statusText.includes(q)
      );
    });
  }, [candidates, query]);

  const onChangeForm =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      setFormTouched((t) => ({ ...t, [field]: true }));
    };

  const formErrors = useMemo(() => {
    const errors: Partial<Record<keyof FormState, string>> = {};

    const psycho = toIntSafe(form.psychometric);
    const bagrut = toIntSafe(form.bagrutAverage);
    const mu = toIntSafe(form.mathUnits);
    const eu = toIntSafe(form.englishUnits);

    if (!form.fullName.trim()) errors.fullName = "שדה חובה";
    else if (!isHebrewNameLike(form.fullName))
      errors.fullName = "יש להזין שם מלא (לפחות 2 מילים) ובאותיות בלבד";

    if (!form.idNumber.trim()) errors.idNumber = "שדה חובה";
    else if (!isIsraeliId9Digits(form.idNumber))
      errors.idNumber = "תעודת זהות חייבת להיות 9 ספרות (ללא אותיות)";

    if (form.psychometric && !inRange(psycho, 200, 800))
      errors.psychometric = "פסיכומטרי חייב להיות בטווח 200–800";

    if (form.bagrutAverage && !inRange(bagrut, 60, 120))
      errors.bagrutAverage = "ממוצע בגרות חייב להיות בטווח 60–120";

    if (form.mathUnits && ![3, 4, 5].includes(mu ?? -1))
      errors.mathUnits = "יחידות מתמטיקה: 3/4/5 בלבד";

    if (form.englishUnits && ![3, 4, 5].includes(eu ?? -1))
      errors.englishUnits = "יחידות אנגלית: 3/4/5 בלבד";

    if (!form.preferredTrack) errors.preferredTrack = "שדה חובה";
    if (!form.status) errors.status = "שדה חובה";

    return errors;
  }, [form]);

  const canSave = useMemo(() => {
    const requiredOk =
      isHebrewNameLike(form.fullName) &&
      isIsraeliId9Digits(form.idNumber) &&
      !!form.preferredTrack &&
      !!form.status;

    const psycho = toIntSafe(form.psychometric);
    const bagrut = toIntSafe(form.bagrutAverage);
    const mu = toIntSafe(form.mathUnits);
    const eu = toIntSafe(form.englishUnits);

    const optionalOk =
      (!form.psychometric || inRange(psycho, 200, 800)) &&
      (!form.bagrutAverage || inRange(bagrut, 60, 120)) &&
      (!form.mathUnits || [3, 4, 5].includes(mu ?? -1)) &&
      (!form.englishUnits || [3, 4, 5].includes(eu ?? -1));

    return requiredOk && optionalOk;
  }, [form]);

  // ===== Add =====
  const handleAddCandidate = async () => {
    if (!canSave) {
      setFormTouched({
        fullName: true,
        idNumber: true,
        psychometric: true,
        bagrutAverage: true,
        mathUnits: true,
        englishUnits: true,
        preferredTrack: true,
        status: true,
      });
      return;
    }

    const idNumber = form.idNumber.trim();

    // מניעת כפילות לפי ת"ז
    const exists = candidates.some((c) => c.idNumber === idNumber);
    if (exists) {
      setSnack({ open: true, msg: "ת.ז כבר קיימת במערכת" });
      return;
    }

    try {
      const payload = {
        idNumber,
        fullName: form.fullName.trim().replace(/\s+/g, " "),
        psychometric: toIntSafe(form.psychometric) ?? 0,
        bagrutAverage: toIntSafe(form.bagrutAverage) ?? 0,
        mathUnits: coerceUnits(toIntSafe(form.mathUnits) ?? 3),
        englishUnits: coerceUnits(toIntSafe(form.englishUnits) ?? 3),
        preferredTrack: form.preferredTrack as PreferredTrack,
        status: form.status as CandidateStatus,
        createdAt: serverTimestamp(),
        createdAtText: formatDateIL(new Date()),
      };

      await addDoc(collection(db, "candidates"), payload);

      setForm(emptyForm);
      setFormTouched({});
      setSnack({ open: true, msg: "מועמד נוסף בהצלחה" });
      setTab(0);
    } catch {
      setSnack({ open: true, msg: "שגיאה בשמירה. נסי שוב." });
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setFormTouched({});
  };

  // ===== Edit =====
  const editErrors = useMemo(() => {
    const errors: Partial<Record<keyof FormState, string>> = {};

    const psycho = toIntSafe(editForm.psychometric);
    const bagrut = toIntSafe(editForm.bagrutAverage);
    const mu = toIntSafe(editForm.mathUnits);
    const eu = toIntSafe(editForm.englishUnits);

    if (!editForm.fullName.trim()) errors.fullName = "שדה חובה";
    else if (!isHebrewNameLike(editForm.fullName))
      errors.fullName = "שם מלא חייב להיות לפחות 2 מילים ובאותיות בלבד";

    if (!isIsraeliId9Digits(editForm.idNumber)) errors.idNumber = "ת.ז חייבת להיות 9 ספרות";

    if (editForm.psychometric && !inRange(psycho, 200, 800))
      errors.psychometric = "פסיכומטרי חייב להיות בטווח 200–800";

    if (editForm.bagrutAverage && !inRange(bagrut, 60, 120))
      errors.bagrutAverage = "ממוצע בגרות חייב להיות בטווח 60–120";

    if (editForm.mathUnits && ![3, 4, 5].includes(mu ?? -1))
      errors.mathUnits = "יחידות מתמטיקה: 3/4/5 בלבד";

    if (editForm.englishUnits && ![3, 4, 5].includes(eu ?? -1))
      errors.englishUnits = "יחידות אנגלית: 3/4/5 בלבד";

    if (!editForm.preferredTrack) errors.preferredTrack = "שדה חובה";
    if (!editForm.status) errors.status = "שדה חובה";

    return errors;
  }, [editForm]);

  const canSaveEdit = useMemo(() => {
    const requiredOk =
      isHebrewNameLike(editForm.fullName) &&
      isIsraeliId9Digits(editForm.idNumber) &&
      !!editForm.preferredTrack &&
      !!editForm.status;

    const psycho = toIntSafe(editForm.psychometric);
    const bagrut = toIntSafe(editForm.bagrutAverage);
    const mu = toIntSafe(editForm.mathUnits);
    const eu = toIntSafe(editForm.englishUnits);

    const optionalOk =
      (!editForm.psychometric || inRange(psycho, 200, 800)) &&
      (!editForm.bagrutAverage || inRange(bagrut, 60, 120)) &&
      (!editForm.mathUnits || [3, 4, 5].includes(mu ?? -1)) &&
      (!editForm.englishUnits || [3, 4, 5].includes(eu ?? -1));

    return requiredOk && optionalOk;
  }, [editForm]);

  const openEdit = (c: Candidate) => {
    setEditDocId(c.docId);
    setEditForm({
      fullName: c.fullName,
      idNumber: c.idNumber,
      psychometric: String(c.psychometric || ""),
      bagrutAverage: String(c.bagrutAverage || ""),
      mathUnits: String(c.mathUnits || ""),
      englishUnits: String(c.englishUnits || ""),
      preferredTrack: c.preferredTrack,
      status: c.status,
    });
    setEditTouched({});
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editDocId) return;

    if (!canSaveEdit) {
      setEditTouched({
        fullName: true,
        idNumber: true,
        psychometric: true,
        bagrutAverage: true,
        mathUnits: true,
        englishUnits: true,
        preferredTrack: true,
        status: true,
      });
      return;
    }

    try {
      await updateDoc(doc(db, "candidates", editDocId), {
        fullName: editForm.fullName.trim().replace(/\s+/g, " "),
        psychometric: toIntSafe(editForm.psychometric) ?? 0,
        bagrutAverage: toIntSafe(editForm.bagrutAverage) ?? 0,
        mathUnits: coerceUnits(toIntSafe(editForm.mathUnits) ?? 3),
        englishUnits: coerceUnits(toIntSafe(editForm.englishUnits) ?? 3),
        preferredTrack: editForm.preferredTrack as PreferredTrack,
        status: editForm.status as CandidateStatus,
      });

      setEditOpen(false);
      setSnack({ open: true, msg: "העדכון נשמר בהצלחה" });
    } catch {
      setSnack({ open: true, msg: "שגיאה בעדכון. נסי שוב." });
    }
  };

  // ===== Delete =====
  const openDelete = (c: Candidate) => {
    setDeleteTarget({ docId: c.docId, idNumber: c.idNumber });
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDoc(doc(db, "candidates", deleteTarget.docId));
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
          מערכת ניהול – מועמדים
        </Typography>

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, bgcolor: "background.paper" }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            centered
            sx={{ mb: 3, "& .MuiTab-root": { fontWeight: 600 } }}
          >
            <Tab label="רשימת מועמדים" />
            <Tab label="הוספת מועמד חדש" />
          </Tabs>

          {/* ===== TAB 0: LIST ===== */}
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
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="חיפוש לפי שם / ת.ז / סטטוס..."
                  />
                </Stack>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                מספר המועמדים במערכת: {candidates.length}
              </Typography>

              <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "background.paper" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>פעולות</TableCell>
                      <TableCell>סטטוס</TableCell>
                      <TableCell>מסלול מועדף</TableCell>
                      <TableCell>אנגלית (יח׳)</TableCell>
                      <TableCell>מתמטיקה (יח׳)</TableCell>
                      <TableCell>ממוצע בגרות</TableCell>
                      <TableCell>פסיכומטרי</TableCell>
                      <TableCell>שם מלא</TableCell>
                      <TableCell>ת.ז</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.docId} hover>
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
                              onClick={() => openDelete(c)}
                            >
                              מחיקה
                            </Button>
                          </Stack>
                        </TableCell>
                        <TableCell>{statusChip(c.status)}</TableCell>
                        <TableCell>{c.preferredTrack}</TableCell>
                        <TableCell>{c.englishUnits}</TableCell>
                        <TableCell>{c.mathUnits}</TableCell>
                        <TableCell>{c.bagrutAverage || "-"}</TableCell>
                        <TableCell>{c.psychometric || "-"}</TableCell>
                        <TableCell>{c.fullName}</TableCell>
                        <TableCell>{c.idNumber}</TableCell>
                      </TableRow>
                    ))}

                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9}>
                          <Typography align="center" color="text.secondary">
                            אין תוצאות להצגה.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {/* ===== TAB 1: ADD ===== */}
          {tab === 1 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={2}>
                הוספת מועמד חדש
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                שדות חובה: שם מלא, ת.ז, מסלול מועדף, סטטוס. שאר השדות אופציונליים אך חייבים להיות בטווח אם הוזנו.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="שם מלא"
                    value={form.fullName}
                    onChange={onChangeForm("fullName")}
                    error={!!formErrors.fullName && !!formTouched.fullName}
                    helperText={formTouched.fullName ? formErrors.fullName : " "}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="תעודת זהות (9 ספרות)"
                    value={form.idNumber}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/[^\d]/g, "");
                      setForm((p) => ({ ...p, idNumber: onlyDigits }));
                      setFormTouched((t) => ({ ...t, idNumber: true }));
                    }}
                    inputProps={{ inputMode: "numeric", maxLength: 9 }}
                    error={!!formErrors.idNumber && !!formTouched.idNumber}
                    helperText={formTouched.idNumber ? formErrors.idNumber : " "}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ציון פסיכומטרי (200–800)"
                    value={form.psychometric}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/[^\d]/g, "");
                      setForm((p) => ({ ...p, psychometric: onlyDigits }));
                      setFormTouched((t) => ({ ...t, psychometric: true }));
                    }}
                    inputProps={{ inputMode: "numeric" }}
                    error={!!formErrors.psychometric && !!formTouched.psychometric}
                    helperText={formTouched.psychometric ? formErrors.psychometric : " "}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ממוצע בגרות (60–120)"
                    value={form.bagrutAverage}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/[^\d]/g, "");
                      setForm((p) => ({ ...p, bagrutAverage: onlyDigits }));
                      setFormTouched((t) => ({ ...t, bagrutAverage: true }));
                    }}
                    inputProps={{ inputMode: "numeric" }}
                    error={!!formErrors.bagrutAverage && !!formTouched.bagrutAverage}
                    helperText={formTouched.bagrutAverage ? formErrors.bagrutAverage : " "}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="יחידות מתמטיקה"
                    value={form.mathUnits}
                    onChange={onChangeForm("mathUnits")}
                    error={!!formErrors.mathUnits && !!formTouched.mathUnits}
                    helperText={formTouched.mathUnits ? formErrors.mathUnits : " "}
                  >
                    <MenuItem value="">לא נבחר</MenuItem>
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="4">4</MenuItem>
                    <MenuItem value="5">5</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="יחידות אנגלית"
                    value={form.englishUnits}
                    onChange={onChangeForm("englishUnits")}
                    error={!!formErrors.englishUnits && !!formTouched.englishUnits}
                    helperText={formTouched.englishUnits ? formErrors.englishUnits : " "}
                  >
                    <MenuItem value="">לא נבחר</MenuItem>
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="4">4</MenuItem>
                    <MenuItem value="5">5</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="מסלול מועדף"
                    value={form.preferredTrack}
                    onChange={onChangeForm("preferredTrack")}
                    error={!!formErrors.preferredTrack && !!formTouched.preferredTrack}
                    helperText={formTouched.preferredTrack ? formErrors.preferredTrack : " "}
                  >
                    <MenuItem value="">בחרי</MenuItem>
                    <MenuItem value="בוקר">בוקר</MenuItem>
                    <MenuItem value="ערב">ערב</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="סטטוס הרשמה"
                    value={form.status}
                    onChange={onChangeForm("status")}
                    error={!!formErrors.status && !!formTouched.status}
                    helperText={formTouched.status ? formErrors.status : " "}
                  >
                    <MenuItem value="">בחרי</MenuItem>
                    <MenuItem value="accepted">התקבל</MenuItem>
                    <MenuItem value="pending">בדיקה</MenuItem>
                    <MenuItem value="rejected">נדחה</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {!canSave && (
                <Box mt={2}>
                  <Alert severity="info">
                    כדי לשמור: ודאי ששם מלא כולל לפחות 2 מילים, ת.ז 9 ספרות, ושדות חובה נבחרו.
                  </Alert>
                </Box>
              )}

              <Box mt={4} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="success"
                  sx={{ borderRadius: 999, px: 4 }}
                  onClick={handleAddCandidate}
                  disabled={!canSave}
                >
                  שמירה
                </Button>
                <Button variant="outlined" sx={{ borderRadius: 999, px: 4 }} onClick={handleReset}>
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

      {/* ========= Edit Dialog ========= */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>עריכת מועמד</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="שם מלא"
                value={editForm.fullName}
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, fullName: e.target.value }));
                  setEditTouched((t) => ({ ...t, fullName: true }));
                }}
                error={!!editErrors.fullName && !!editTouched.fullName}
                helperText={editTouched.fullName ? editErrors.fullName : " "}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="תעודת זהות"
                value={editForm.idNumber}
                disabled
                helperText="ת.ז אינה ניתנת לשינוי"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ציון פסיכומטרי (200–800)"
                value={editForm.psychometric}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/[^\d]/g, "");
                  setEditForm((p) => ({ ...p, psychometric: onlyDigits }));
                  setEditTouched((t) => ({ ...t, psychometric: true }));
                }}
                error={!!editErrors.psychometric && !!editTouched.psychometric}
                helperText={editTouched.psychometric ? editErrors.psychometric : " "}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ממוצע בגרות (60–120)"
                value={editForm.bagrutAverage}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/[^\d]/g, "");
                  setEditForm((p) => ({ ...p, bagrutAverage: onlyDigits }));
                  setEditTouched((t) => ({ ...t, bagrutAverage: true }));
                }}
                error={!!editErrors.bagrutAverage && !!editTouched.bagrutAverage}
                helperText={editTouched.bagrutAverage ? editErrors.bagrutAverage : " "}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="יחידות מתמטיקה"
                value={editForm.mathUnits}
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, mathUnits: e.target.value }));
                  setEditTouched((t) => ({ ...t, mathUnits: true }));
                }}
                error={!!editErrors.mathUnits && !!editTouched.mathUnits}
                helperText={editTouched.mathUnits ? editErrors.mathUnits : " "}
              >
                <MenuItem value="">לא נבחר</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
                <MenuItem value="5">5</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="יחידות אנגלית"
                value={editForm.englishUnits}
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, englishUnits: e.target.value }));
                  setEditTouched((t) => ({ ...t, englishUnits: true }));
                }}
                error={!!editErrors.englishUnits && !!editTouched.englishUnits}
                helperText={editTouched.englishUnits ? editErrors.englishUnits : " "}
              >
                <MenuItem value="">לא נבחר</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
                <MenuItem value="5">5</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                required
                label="מסלול מועדף"
                value={editForm.preferredTrack}
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, preferredTrack: e.target.value }));
                  setEditTouched((t) => ({ ...t, preferredTrack: true }));
                }}
                error={!!editErrors.preferredTrack && !!editTouched.preferredTrack}
                helperText={editTouched.preferredTrack ? editErrors.preferredTrack : " "}
              >
                <MenuItem value="">בחרי</MenuItem>
                <MenuItem value="בוקר">בוקר</MenuItem>
                <MenuItem value="ערב">ערב</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                required
                label="סטטוס"
                value={editForm.status}
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, status: e.target.value }));
                  setEditTouched((t) => ({ ...t, status: true }));
                }}
                error={!!editErrors.status && !!editTouched.status}
                helperText={editTouched.status ? editErrors.status : " "}
              >
                <MenuItem value="">בחרי</MenuItem>
                <MenuItem value="accepted">התקבל</MenuItem>
                <MenuItem value="pending">בדיקה</MenuItem>
                <MenuItem value="rejected">נדחה</MenuItem>
              </TextField>
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

      {/* ========= Delete Dialog ========= */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>מחיקת מועמד</DialogTitle>
        <DialogContent>
          <Typography>
            למחוק את המועמד עם ת.ז: <b>{deleteTarget?.idNumber}</b> ?
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

export default AdminCandidatesPage;

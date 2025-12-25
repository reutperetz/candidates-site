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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type CandidateStatus = "accepted" | "pending" | "rejected";
type PreferredTrack = "בוקר" | "ערב";

interface Candidate {
  id: string; // ת"ז
  fullName: string;
  psychometric: number | null;
  bagrutAverage: number | null;
  mathUnits: number | null;
  englishUnits: number | null;
  preferredTrack: PreferredTrack;
  status: CandidateStatus;
}

type FormState = {
  fullName: string;
  idNumber: string;
  psychometric: string;
  bagrutAverage: string;
  mathUnits: string;
  englishUnits: string;
  preferredTrack: "" | PreferredTrack;
  status: "" | CandidateStatus;
};

// נתוני דמה לרשימת מועמדים
const initialCandidates: Candidate[] = [
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

// ====== ולידציות ======
const isDigitsOnly = (s: string) => /^\d+$/.test(s);
const normalizeSpaces = (s: string) => s.trim().replace(/\s+/g, " ");

const isValidFullName = (name: string) => {
  const n = normalizeSpaces(name);
  // אותיות עברית/אנגלית + רווחים, לפחות 2 מילים
  const lettersAndSpaces = /^[A-Za-z\u0590-\u05FF ]+$/.test(n);
  const words = n.split(" ").filter(Boolean);
  return lettersAndSpaces && words.length >= 2;
};

const isValidId = (id: string) => /^\d{9}$/.test(id);

const inRange = (num: number, min: number, max: number) =>
  num >= min && num <= max;

const parseOrNull = (s: string) => {
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const AdminCandidatesPage = () => {
  // 0 = רשימה, 1 = הוספה/עריכה
  const [tab, setTab] = useState(0);

  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [query, setQuery] = useState("");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<keyof FormState, string>>({
    fullName: "",
    idNumber: "",
    psychometric: "",
    bagrutAverage: "",
    mathUnits: "",
    englishUnits: "",
    preferredTrack: "",
    status: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [saved, setSaved] = useState(false);

  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
    name: string | null;
  }>({ open: false, id: null, name: null });

  const handleChangeForm =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setSaved(false);

      // נקה שגיאה של השדה בזמן הקלדה
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const validateForm = (): boolean => {
    const nextErrors: Record<keyof FormState, string> = {
      fullName: "",
      idNumber: "",
      psychometric: "",
      bagrutAverage: "",
      mathUnits: "",
      englishUnits: "",
      preferredTrack: "",
      status: "",
    };

    // חובה: שם מלא + ת"ז + מסלול + סטטוס
    if (!form.fullName.trim()) nextErrors.fullName = "חובה להזין שם מלא";
    else if (!isValidFullName(form.fullName))
      nextErrors.fullName =
        "שם מלא חייב להכיל אותיות ורווחים בלבד ולפחות 2 מילים";

    if (!form.idNumber.trim()) nextErrors.idNumber = "חובה להזין תעודת זהות";
    else if (!isValidId(form.idNumber))
      nextErrors.idNumber = "תעודת זהות חייבת להיות 9 ספרות (מספרים בלבד)";

    if (!form.preferredTrack)
      nextErrors.preferredTrack = "חובה לבחור מסלול מועדף";

    if (!form.status) nextErrors.status = "חובה לבחור סטטוס";

    // אופציונלי אבל אם הוזן — חייב להיות תקין
    const psycho = parseOrNull(form.psychometric);
    if (form.psychometric !== "") {
      if (!isDigitsOnly(form.psychometric))
        nextErrors.psychometric = "ציון פסיכומטרי חייב להיות מספר";
      else if (psycho === null || !inRange(psycho, 200, 800))
        nextErrors.psychometric = "ציון פסיכומטרי חייב להיות בטווח 200–800";
    }

    const bagrut = parseOrNull(form.bagrutAverage);
    if (form.bagrutAverage !== "") {
      if (!/^\d+(\.\d+)?$/.test(form.bagrutAverage))
        nextErrors.bagrutAverage = "ממוצע בגרות חייב להיות מספר";
      else if (bagrut === null || !inRange(bagrut, 55, 120))
        nextErrors.bagrutAverage = "ממוצע בגרות חייב להיות בטווח 55–120";
    }

    const mathU = parseOrNull(form.mathUnits);
    if (form.mathUnits !== "") {
      if (!isDigitsOnly(form.mathUnits))
        nextErrors.mathUnits = "יחידות מתמטיקה חייב להיות מספר";
      else if (mathU === null || ![3, 4, 5].includes(mathU))
        nextErrors.mathUnits = "יחידות מתמטיקה חייב להיות 3 / 4 / 5";
    }

    const engU = parseOrNull(form.englishUnits);
    if (form.englishUnits !== "") {
      if (!isDigitsOnly(form.englishUnits))
        nextErrors.englishUnits = "יחידות אנגלית חייב להיות מספר";
      else if (engU === null || ![3, 4, 5].includes(engU))
        nextErrors.englishUnits = "יחידות אנגלית חייב להיות 3 / 4 / 5";
    }

    // בדיקת כפילות ת"ז בהוספה (או בעריכה אם משנים ת"ז)
    const idTrim = form.idNumber.trim();
    if (isValidId(idTrim)) {
      const exists = candidates.some((c) =>
        isEdit ? c.id !== editId && c.id === idTrim : c.id === idTrim
      );
      if (exists) nextErrors.idNumber = "קיים כבר מועמד עם תעודת זהות זו";
    }

    setErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some(Boolean);
    return !hasErrors;
  };

  const resetFormToEmpty = () => {
    setForm(emptyForm);
    setErrors({
      fullName: "",
      idNumber: "",
      psychometric: "",
      bagrutAverage: "",
      mathUnits: "",
      englishUnits: "",
      preferredTrack: "",
      status: "",
    });
    setIsEdit(false);
    setEditId(null);
    setSaved(false);
  };

  const startAdd = () => {
    resetFormToEmpty();
    setTab(1);
  };

  const startEdit = (c: Candidate) => {
    setIsEdit(true);
    setEditId(c.id);
    setSaved(false);
    setErrors({
      fullName: "",
      idNumber: "",
      psychometric: "",
      bagrutAverage: "",
      mathUnits: "",
      englishUnits: "",
      preferredTrack: "",
      status: "",
    });

    setForm({
      fullName: c.fullName,
      idNumber: c.id,
      psychometric: c.psychometric?.toString() ?? "",
      bagrutAverage: c.bagrutAverage?.toString() ?? "",
      mathUnits: c.mathUnits?.toString() ?? "",
      englishUnits: c.englishUnits?.toString() ?? "",
      preferredTrack: c.preferredTrack,
      status: c.status,
    });

    setTab(1);
  };

  const handleSave = () => {
    if (!validateForm()) {
      setSnack({
        open: true,
        message: "יש שדות לא תקינים — תקני את ההערות האדומות",
        severity: "error",
      });
      return;
    }

    const newCandidate: Candidate = {
      id: form.idNumber.trim(),
      fullName: normalizeSpaces(form.fullName),
      psychometric: parseOrNull(form.psychometric),
      bagrutAverage: parseOrNull(form.bagrutAverage),
      mathUnits: parseOrNull(form.mathUnits),
      englishUnits: parseOrNull(form.englishUnits),
      preferredTrack: form.preferredTrack as PreferredTrack,
      status: form.status as CandidateStatus,
    };

    setCandidates((prev) => {
      if (!isEdit || !editId) return [newCandidate, ...prev];

      return prev.map((c) => (c.id === editId ? newCandidate : c));
    });

    setSaved(true);
    setSnack({
      open: true,
      message: isEdit ? "המועמד עודכן בהצלחה" : "המועמד נשמר בהצלחה",
      severity: "success",
    });

    // אחרי שמירה נחזור לרשימה
    setTab(0);
    resetFormToEmpty();
  };

  const handleDeleteClick = (c: Candidate) => {
    setConfirmDelete({ open: true, id: c.id, name: c.fullName });
  };

  const handleConfirmDelete = () => {
    const id = confirmDelete.id;
    if (!id) return;

    setCandidates((prev) => prev.filter((c) => c.id !== id));
    setConfirmDelete({ open: false, id: null, name: null });

    // אם במקרה מוחקים את מי שנערך כרגע
    if (isEdit && editId === id) resetFormToEmpty();

    setSnack({
      open: true,
      message: "המועמד נמחק בהצלחה",
      severity: "success",
    });
  };

  const handleReset = () => {
    resetFormToEmpty();
    setSnack({ open: true, message: "הטופס נוקה", severity: "info", });
  };

  const filteredCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;

    return candidates.filter((c) => {
      const statusHeb =
        c.status === "accepted" ? "התקבל" : c.status === "pending" ? "בדיקה" : "נדחה";
      return (
        c.id.includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.preferredTrack.toLowerCase().includes(q) ||
        statusHeb.includes(q)
      );
    });
  }, [candidates, query]);

  return (
    <Box dir="rtl">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography
          variant="h6"
          align="center"
          fontWeight={700}
          color="success.main"
        >
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
            <Tab label={isEdit ? "עריכת מועמד" : "הוספת מועמד חדש"} />
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
                    onClick={startAdd}
                  >
                    הוספת מועמד חדש
                  </Button>

                  <TextField
                    size="small"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="חיפוש לפי שם, ת.ז או סטטוס..."
                  />
                </Stack>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                מספר המועמדים במערכת: {filteredCandidates.length}
              </Typography>

              <Paper
                elevation={0}
                sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "white" }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>פעולות</TableCell>
                      <TableCell>סטטוס</TableCell>
                      <TableCell>מסלול מועדף</TableCell>
                      <TableCell>ממוצע בגרות</TableCell>
                      <TableCell>ציון פסיכומטרי</TableCell>
                      <TableCell>שם מלא</TableCell>
                      <TableCell>ת.ז</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredCandidates.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<EditIcon fontSize="small" />}
                              onClick={() => startEdit(c)}
                            >
                              עריכה
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineIcon fontSize="small" />}
                              onClick={() => handleDeleteClick(c)}
                            >
                              מחיקה
                            </Button>
                          </Stack>
                        </TableCell>

                        <TableCell>{statusChip(c.status)}</TableCell>
                        <TableCell>{c.preferredTrack}</TableCell>
                        <TableCell>{c.bagrutAverage ?? "—"}</TableCell>
                        <TableCell>{c.psychometric ?? "—"}</TableCell>
                        <TableCell>{c.fullName}</TableCell>
                        <TableCell>{c.id}</TableCell>
                      </TableRow>
                    ))}

                    {filteredCandidates.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="text.secondary">
                            אין תוצאות להצגה
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {/* ================= טאב 2 – הוספה/עריכה ================= */}
          {tab === 1 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={1}>
                {isEdit ? "עריכת מועמד" : "הוספת מועמד חדש"}
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                הזיני את פרטי המועמד לצורך הרשמה למערכת. שדות חובה מסומנים ב-*.
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
                    helperText={errors.fullName || "לדוגמה: אגם חוליו"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="תעודת זהות"
                    value={form.idNumber}
                    onChange={(e) => {
                      // מאפשרים להקליד רק מספרים בפועל (ללא אותיות)
                      const next = e.target.value.replace(/[^\d]/g, "");
                      setForm((p) => ({ ...p, idNumber: next }));
                      setErrors((p) => ({ ...p, idNumber: "" }));
                      setSaved(false);
                    }}
                    inputProps={{ maxLength: 9 }}
                    error={!!errors.idNumber}
                    helperText={errors.idNumber || "9 ספרות"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ציון פסיכומטרי (אופציונלי)"
                    value={form.psychometric}
                    onChange={(e) => {
                      const next = e.target.value.replace(/[^\d]/g, "");
                      setForm((p) => ({ ...p, psychometric: next }));
                      setErrors((p) => ({ ...p, psychometric: "" }));
                      setSaved(false);
                    }}
                    error={!!errors.psychometric}
                    helperText={errors.psychometric || "טווח: 200–800"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ממוצע בגרות (אופציונלי)"
                    value={form.bagrutAverage}
                    onChange={(e) => {
                      // מאפשרים גם נקודה
                      const next = e.target.value.replace(/[^\d.]/g, "");
                      setForm((p) => ({ ...p, bagrutAverage: next }));
                      setErrors((p) => ({ ...p, bagrutAverage: "" }));
                      setSaved(false);
                    }}
                    error={!!errors.bagrutAverage}
                    helperText={errors.bagrutAverage || "טווח: 55–120"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="יחידות מתמטיקה (אופציונלי)"
                    value={form.mathUnits}
                    onChange={handleChangeForm("mathUnits")}
                    error={!!errors.mathUnits}
                    helperText={errors.mathUnits || "3 / 4 / 5"}
                  >
                    <MenuItem value="">
                      <em>לא נבחר</em>
                    </MenuItem>
                    <MenuItem value="3">3 יח״ל</MenuItem>
                    <MenuItem value="4">4 יח״ל</MenuItem>
                    <MenuItem value="5">5 יח״ל</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="יחידות אנגלית (אופציונלי)"
                    value={form.englishUnits}
                    onChange={handleChangeForm("englishUnits")}
                    error={!!errors.englishUnits}
                    helperText={errors.englishUnits || "3 / 4 / 5"}
                  >
                    <MenuItem value="">
                      <em>לא נבחר</em>
                    </MenuItem>
                    <MenuItem value="3">3 יח״ל</MenuItem>
                    <MenuItem value="4">4 יח״ל</MenuItem>
                    <MenuItem value="5">5 יח״ל</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="מסלול מועדף"
                    value={form.preferredTrack}
                    onChange={handleChangeForm("preferredTrack")}
                    error={!!errors.preferredTrack}
                    helperText={errors.preferredTrack || ""}
                  >
                    <MenuItem value="">
                      <em>בחרי</em>
                    </MenuItem>
                    <MenuItem value="בוקר">בוקר</MenuItem>
                    <MenuItem value="ערב">ערב</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="סטטוס הרשמה"
                    value={form.status}
                    onChange={handleChangeForm("status")}
                    error={!!errors.status}
                    helperText={errors.status || ""}
                  >
                    <MenuItem value="">
                      <em>בחרי</em>
                    </MenuItem>
                    <MenuItem value="accepted">התקבל</MenuItem>
                    <MenuItem value="pending">בדיקה</MenuItem>
                    <MenuItem value="rejected">נדחה</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Box
                mt={4}
                display="flex"
                justifyContent="center"
                gap={2}
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  color="success"
                  sx={{ borderRadius: 999, px: 4 }}
                  onClick={handleSave}
                >
                  {isEdit ? "עדכון" : "שמירה"}
                </Button>

                <Button
                  variant="outlined"
                  sx={{ borderRadius: 999, px: 4 }}
                  onClick={handleReset}
                >
                  ניקוי שדות
                </Button>

                <Button
                  variant="text"
                  sx={{ borderRadius: 999, px: 4 }}
                  onClick={() => {
                    setTab(0);
                    resetFormToEmpty();
                  }}
                >
                  חזרה לרשימה
                </Button>
              </Box>

              {saved && (
                <Box mt={3}>
                  <Alert severity="success">
                    {isEdit
                      ? "המועמד עודכן בהצלחה (דמה לצורכי תכנון פרויקט)."
                      : "מועמד חדש נשמר בהצלחה (דמה לצורכי תכנון פרויקט)."}
                  </Alert>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Container>

      {/* Snackbar הודעה קטנה */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2200}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        message={snack.message}
      />

      {/* Dialog אישור מחיקה */}
      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null, name: null })}
      >
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            למחוק את <b>{confirmDelete.name}</b> (ת״ז {confirmDelete.id})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDelete({ open: false, id: null, name: null })
            }
          >
            ביטול
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCandidatesPage;



// src/pages/AdminAdmissionRequirementsPage.tsx
import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";

import Grid from "@mui/material/GridLegacy";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type TrackType = "A" | "B" | "C";
type RequirementStatus = "active" | "inactive";

interface AdmissionRequirement {
  id: number;
  track: TrackType;
  trackName: string;

  // ציונים / תנאים (אופציונלי בהתאם למסלול)
  minPsycho?: number; // פסיכומטרי (כללי/כמותי לפי איך את מגדירה)
  minAverage?: number; // ממוצע בגרות
  minMath?: number; // ציון מתמטיקה
  minEnglish?: number; // ציון אנגלית
  mathUnits?: number; // יחידות מתמטיקה
  englishUnits?: number; // יחידות אנגלית

  status: RequirementStatus;
}

// key קבוע ל־localStorage 
const REQUIREMENTS_KEY = "admin_admission_requirements";

// נתוני דמה התחלתיים
const initialRequirements: AdmissionRequirement[] = [
  {
    id: 1,
    track: "A",
    trackName: "מסלול א' – פסיכומטרי ישיר",
    minPsycho: 650,
    status: "active",
  },
  {
    id: 2,
    track: "B",
    trackName: "מסלול ב' – סכום משולב",
    minPsycho: 130,
    minMath: 85,
    minAverage: 90,
    mathUnits: 5,
    status: "active",
  },
];

const statusChip = (status: RequirementStatus) => {
  switch (status) {
    case "active":
      return <Chip label="פעיל" color="success" size="small" />;
    case "inactive":
      return <Chip label="לא פעיל" color="default" size="small" />;
  }
};

type FormState = {
  track: "" | TrackType;
  trackName: string;
  minPsycho: string;
  minAverage: string;
  minMath: string;
  minEnglish: string;
  mathUnits: string;
  englishUnits: string;
  status: RequirementStatus;
};

const emptyForm: FormState = {
  track: "",
  trackName: "",
  minPsycho: "",
  minAverage: "",
  minMath: "",
  minEnglish: "",
  mathUnits: "",
  englishUnits: "",
  status: "active",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function toNumberOrUndef(v: string): number | undefined {
  const t = v.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function isIntInRange(n: number | undefined, min: number, max: number) {
  if (n === undefined) return false;
  return Number.isInteger(n) && n >= min && n <= max;
}

function isNumInRange(n: number | undefined, min: number, max: number) {
  if (n === undefined) return false;
  return n >= min && n <= max;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  // חובה
  if (!form.track) errors.track = "חובה לבחור מסלול";
  if (!form.trackName.trim()) errors.trackName = "חובה למלא שם מסלול";

  // המרות
  const minPsycho = toNumberOrUndef(form.minPsycho);
  const minAverage = toNumberOrUndef(form.minAverage);
  const minMath = toNumberOrUndef(form.minMath);
  const minEnglish = toNumberOrUndef(form.minEnglish);
  const mathUnits = toNumberOrUndef(form.mathUnits);
  const englishUnits = toNumberOrUndef(form.englishUnits);

  // בדיקות “מספר בלבד”
  const numericFields: Array<[keyof FormState, number | undefined, string]> = [
    ["minPsycho", minPsycho, "חייב להיות מספר"],
    ["minAverage", minAverage, "חייב להיות מספר"],
    ["minMath", minMath, "חייב להיות מספר"],
    ["minEnglish", minEnglish, "חייב להיות מספר"],
    ["mathUnits", mathUnits, "חייב להיות מספר"],
    ["englishUnits", englishUnits, "חייב להיות מספר"],
  ];

  for (const [key, val, msg] of numericFields) {
    if (form[key].trim() && val === undefined) {
      errors[key] = msg;
    }
  }

  // טווחים (את יכולה לשנות לפי הדרישות שלכם)
  // פסיכומטרי: 200–800 (אם את משתמשת בשדה כמותי 50–150, תשני כאן בהתאם)
  if (minPsycho !== undefined && !isNumInRange(minPsycho, 200, 800)) {
    errors.minPsycho = "טווח לא תקין (לדוגמה 200–800)";
  }

  // ממוצע בגרות: 0–120
  if (minAverage !== undefined && !isNumInRange(minAverage, 0, 120)) {
    errors.minAverage = "טווח לא תקין (0–120)";
  }

  // ציוני מתמטיקה/אנגלית: 0–100
  if (minMath !== undefined && !isNumInRange(minMath, 0, 100)) {
    errors.minMath = "טווח לא תקין (0–100)";
  }
  if (minEnglish !== undefined && !isNumInRange(minEnglish, 0, 100)) {
    errors.minEnglish = "טווח לא תקין (0–100)";
  }

  // יח"ל: 3–5 מספר שלם
  if (form.mathUnits.trim() && !isIntInRange(mathUnits, 3, 5)) {
    errors.mathUnits = "יח\"ל מתמטיקה חייב להיות 3–5";
  }
  if (form.englishUnits.trim() && !isIntInRange(englishUnits, 3, 5)) {
    errors.englishUnits = "יח\"ל אנגלית חייב להיות 3–5";
  }

  // חובה לפי מסלול (כמו הדרישה שלך “לא לקבל מה שלא תקין”)
  if (form.track === "A") {
    if (minPsycho === undefined) errors.minPsycho = "במסלול א' חובה פסיכומטרי מינימלי";
  }

  if (form.track === "B") {
    if (minPsycho === undefined) errors.minPsycho = "במסלול ב' חובה פסיכומטרי/כמותי מינימלי";
    if (minAverage === undefined) errors.minAverage = "במסלול ב' חובה ממוצע בגרות מינימלי";
    if (minMath === undefined) errors.minMath = "במסלול ב' חובה ציון מתמטיקה מינימלי";
    if (!isIntInRange(mathUnits, 3, 5)) errors.mathUnits = "במסלול ב' חובה יח\"ל מתמטיקה (3–5)";
  }

  // מסלול C (אופציונלי) – לא מכריחים כרגע

  return errors;
}

const AdminAdmissionRequirementsPage = () => {
  const [tab, setTab] = useState(0);

  //  רשימה אמיתית (לא mock קבוע)
  const [requirements, setRequirements] = useState<AdmissionRequirement[]>(() => {
  const raw = localStorage.getItem(REQUIREMENTS_KEY);
  if (!raw) return initialRequirements;

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AdmissionRequirement[]) : initialRequirements;
  } catch {
    return initialRequirements;
  }
});

  // טופס הוספה
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  // עריכה/מחיקה
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<AdmissionRequirement | null>(null);

  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [edited, setEdited] = useState(false);


  //  helper: מעדכן state + שומר ל־localStorage (Add/Edit/Delete משתמשים בו)
  const updateRequirements = (next: AdmissionRequirement[]) => {
    setRequirements(next);
    localStorage.setItem(REQUIREMENTS_KEY, JSON.stringify(next));
  };

  const nextId = useMemo(() => {
    return requirements.length ? Math.max(...requirements.map((r) => r.id)) + 1 : 1;
  }, [requirements]);

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setSaved(false);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSave = () => {
    const v = validateForm(form);
    setErrors(v);
    if (Object.values(v).some(Boolean)) return;

    const newReq: AdmissionRequirement = {
      id: nextId,
      track: form.track as TrackType,
      trackName: form.trackName.trim(),
      minPsycho: toNumberOrUndef(form.minPsycho),
      minAverage: toNumberOrUndef(form.minAverage),
      minMath: toNumberOrUndef(form.minMath),
      minEnglish: toNumberOrUndef(form.minEnglish),
      mathUnits: toNumberOrUndef(form.mathUnits),
      englishUnits: toNumberOrUndef(form.englishUnits),
      status: form.status,
    };

    // שמירה ל־localStorage 
    updateRequirements([newReq, ...requirements]);

    setSaved(true);
    setForm(emptyForm);
    setErrors({});
    setTab(0);
  };

  const handleReset = () => {
    setForm(emptyForm);
    setErrors({});
    setSaved(false);
  };

  const openEdit = (r: AdmissionRequirement) => {
    setSelected(r);
    setEditForm({
      track: r.track,
      trackName: r.trackName,
      minPsycho: r.minPsycho?.toString() ?? "",
      minAverage: r.minAverage?.toString() ?? "",
      minMath: r.minMath?.toString() ?? "",
      minEnglish: r.minEnglish?.toString() ?? "",
      mathUnits: r.mathUnits?.toString() ?? "",
      englishUnits: r.englishUnits?.toString() ?? "",
      status: r.status,
    });
    setEditErrors({});
    setEdited(false);
    setEditOpen(true);
  };

  const handleEditChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
      setEdited(false);
      setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const saveEdit = () => {
    const v = validateForm(editForm);
    setEditErrors(v);
    if (Object.values(v).some(Boolean)) return;
    if (!selected) return;

    const updated: AdmissionRequirement = {
      id: selected.id,
      track: editForm.track as TrackType,
      trackName: editForm.trackName.trim(),
      minPsycho: toNumberOrUndef(editForm.minPsycho),
      minAverage: toNumberOrUndef(editForm.minAverage),
      minMath: toNumberOrUndef(editForm.minMath),
      minEnglish: toNumberOrUndef(editForm.minEnglish),
      mathUnits: toNumberOrUndef(editForm.mathUnits),
      englishUnits: toNumberOrUndef(editForm.englishUnits),
      status: editForm.status,
    };

    // שמירה ל־localStorage גם בעריכה
    const next = requirements.map((x) => (x.id === selected.id ? updated : x));
    updateRequirements(next);

    setEdited(true);
    setTimeout(() => {
      setEditOpen(false);
      setSelected(null);
    }, 600);
  };

  const openDelete = (r: AdmissionRequirement) => {
    setSelected(r);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!selected) return;
    // 4) שמירה ל־localStorage גם במחיקה
    const next = requirements.filter((x) => x.id !== selected.id);
    updateRequirements(next);
    
    setDeleteOpen(false);
    setSelected(null);
  };

  const cancelDelete = () => {
    setDeleteOpen(false);
    setSelected(null);
  };

const renderFormFields = (
  current: FormState,
  onChange: (
    f: keyof FormState
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
  currentErrors: FormErrors
) => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <TextField
          select
          fullWidth
          required
          label="מסלול"
          value={current.track}
          onChange={onChange("track")}
          error={!!currentErrors.track}
          helperText={currentErrors.track}
        >
          <MenuItem value="A">מסלול א' – פסיכומטרי ישיר</MenuItem>
          <MenuItem value="B">מסלול ב' – סכום משולב</MenuItem>
          <MenuItem value="C">מסלול ג' – מסלול נוסף</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} md={8}>
        <TextField
          fullWidth
          required
          label="שם מסלול / תיאור קצר"
          value={current.trackName}
          onChange={onChange("trackName")}
          error={!!currentErrors.trackName}
          helperText={currentErrors.trackName || "לדוגמה: מסלול ב' – סכום משולב"}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="ציון פסיכומטרי מינימלי"
          value={current.minPsycho}
          onChange={onChange("minPsycho")}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          error={!!currentErrors.minPsycho}
          helperText={currentErrors.minPsycho || "מספרים בלבד"}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="ממוצע בגרות מינימלי"
          value={current.minAverage}
          onChange={onChange("minAverage")}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          error={!!currentErrors.minAverage}
          helperText={currentErrors.minAverage || "0–120"}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="ציון מתמטיקה מינימלי"
          value={current.minMath}
          onChange={onChange("minMath")}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          error={!!currentErrors.minMath}
          helperText={currentErrors.minMath || "0–100"}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="ציון אנגלית מינימלי"
          value={current.minEnglish}
          onChange={onChange("minEnglish")}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          error={!!currentErrors.minEnglish}
          helperText={currentErrors.minEnglish || "0–100 (אופציונלי)"}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          select
          fullWidth
          label='יחידות מתמטיקה נדרשות (יח"ל)'
          value={current.mathUnits}
          onChange={onChange("mathUnits")}
          error={!!currentErrors.mathUnits}
          helperText={currentErrors.mathUnits || "3–5"}
        >
          <MenuItem value="">לא נדרש</MenuItem>
          <MenuItem value="3">3 יח"ל</MenuItem>
          <MenuItem value="4">4 יח"ל</MenuItem>
          <MenuItem value="5">5 יח"ל</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          select
          fullWidth
          label='יחידות אנגלית נדרשות (יח"ל)'
          value={current.englishUnits}
          onChange={onChange("englishUnits")}
          error={!!currentErrors.englishUnits}
          helperText={currentErrors.englishUnits || "3–5 (אופציונלי)"}
        >
          <MenuItem value="">לא נדרש</MenuItem>
          <MenuItem value="3">3 יח"ל</MenuItem>
          <MenuItem value="4">4 יח"ל</MenuItem>
          <MenuItem value="5">5 יח"ל</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          select
          fullWidth
          label="סטטוס"
          value={current.status}
          onChange={onChange("status")}
        >
          <MenuItem value="active">פעיל</MenuItem>
          <MenuItem value="inactive">לא פעיל</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  );

  return (
    <Box dir="rtl">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" align="center" fontWeight={700} color="success.main">
          המחלקה למדעי המחשב
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          מערכת ניהול – תנאי קבלה
        </Typography>

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, bgcolor: "#f7fbf7" }}>
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            centered
            sx={{ mb: 3, "& .MuiTab-root": { fontWeight: 600 } }}
          >
            <Tab label="רשימת תנאי קבלה" />
            <Tab label="הוספת תנאי קבלה חדש" />
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
                  רשימת תנאי קבלה
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: 999, px: 3 }}
                  onClick={() => setTab(1)}
                >
                  הוספת תנאי קבלה חדש
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                מספר תנאי הקבלה במערכת: {requirements.length}
              </Typography>

              <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "white" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>פעולות</TableCell>
                      <TableCell>סטטוס</TableCell>
                      <TableCell>יח&apos; אנגלית</TableCell>
                      <TableCell>יח&apos; מתמטיקה</TableCell>
                      <TableCell>ממוצע בגרות מינימלי</TableCell>
                      <TableCell>ציון אנגלית מינימלי</TableCell>
                      <TableCell>ציון מתמטיקה מינימלי</TableCell>
                      <TableCell>ציון פסיכומטרי מינימלי</TableCell>
                      <TableCell>מסלול</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {requirements.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<EditIcon fontSize="small" />}
                              onClick={() => openEdit(r)}
                            >
                              עריכה
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineIcon fontSize="small" />}
                              onClick={() => openDelete(r)}
                            >
                              מחיקה
                            </Button>
                          </Stack>
                        </TableCell>
                        <TableCell>{statusChip(r.status)}</TableCell>
                        <TableCell>{r.englishUnits ?? "-"}</TableCell>
                        <TableCell>{r.mathUnits ?? "-"}</TableCell>
                        <TableCell>{r.minAverage ?? "-"}</TableCell>
                        <TableCell>{r.minEnglish ?? "-"}</TableCell>
                        <TableCell>{r.minMath ?? "-"}</TableCell>
                        <TableCell>{r.minPsycho ?? "-"}</TableCell>
                        <TableCell>{r.trackName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              {saved && (
                <Box mt={2}>
                  <Alert severity="success">תנאי קבלה נשמר בהצלחה.</Alert>
                </Box>
              )}
            </Box>
          )}

          {/* ===== TAB 1: ADD ===== */}
          {tab === 1 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={2}>
                הוספת תנאי קבלה חדש
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                אפשר לשמור רק אם כל השדות הנדרשים למסלול תקינים.
              </Typography>

              {renderFormFields(form, handleChange, errors)}

              <Box mt={4} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="success"
                  sx={{ borderRadius: 999, px: 4 }}
                  onClick={handleSave}
                >
                  שמירה
                </Button>
                <Button
                  variant="outlined"
                  sx={{ borderRadius: 999, px: 4 }}
                  onClick={handleReset}
                >
                  ניקוי שדות
                </Button>
              </Box>

              {Object.values(errors).some(Boolean) && (
                <Box mt={3}>
                  <Alert severity="error">יש שדות לא תקינים — תקני את המסומן באדום.</Alert>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Container>

      {/* ===== EDIT DIALOG ===== */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>עריכת תנאי קבלה</DialogTitle>
        <DialogContent dividers>
          {renderFormFields(editForm, handleEditChange, editErrors)}
          {Object.values(editErrors).some(Boolean) && (
            <Box mt={2}>
              <Alert severity="error">יש שדות לא תקינים — תקני את המסומן באדום.</Alert>
            </Box>
          )}
          {edited && (
            <Box mt={2}>
              <Alert severity="success">עודכן בהצלחה ✅</Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setEditOpen(false)}>
            סגור
          </Button>
          <Button variant="contained" color="success" onClick={saveEdit}>
            שמירת שינויים
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== DELETE CONFIRM ===== */}
      <Dialog open={deleteOpen} onClose={cancelDelete}>
        <DialogTitle sx={{ fontWeight: 700 }}>מחיקת תנאי קבלה</DialogTitle>
        <DialogContent dividers>
          <Typography>
            למחוק את התנאי:
            <Typography component="span" fontWeight={700}>
              {" "}
              {selected?.trackName}
            </Typography>
            ?
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            פעולה זו תמחק את הרשומה מהרשימה (דמה בצד לקוח).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>ביטול</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAdmissionRequirementsPage;


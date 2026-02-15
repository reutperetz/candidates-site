// src/pages/AdminAdmissionRequirementsPage.tsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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
  LinearProgress,
  Snackbar,
} from "@mui/material";

import Grid from "@mui/material/GridLegacy";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import styles from "../styles/adminShared.module.css";

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

type TrackType = "A" | "B" | "C";
type RequirementStatus = "active" | "inactive";

interface AdmissionRequirement {
  docId: string;
  track: TrackType;
  trackName: string;

  minPsycho?: number; // Psychometric (or quantitative score if used)
  minAverage?: number; // Bagrut average
  minMath?: number; // Math score
  minEnglish?: number; // English score
  mathUnits?: number; // Math units
  englishUnits?: number; // English units

  status: RequirementStatus;
  createdAt?: Timestamp;
}

type RequirementDoc = Omit<AdmissionRequirement, "docId">;

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

  // Required
  if (!form.track) errors.track = "חובה לבחור מסלול";
  if (!form.trackName.trim()) errors.trackName = "חובה למלא שם מסלול";

  // Conversions
  const minPsycho = toNumberOrUndef(form.minPsycho);
  const minAverage = toNumberOrUndef(form.minAverage);
  const minMath = toNumberOrUndef(form.minMath);
  const minEnglish = toNumberOrUndef(form.minEnglish);
  const mathUnits = toNumberOrUndef(form.mathUnits);
  const englishUnits = toNumberOrUndef(form.englishUnits);

  // Numeric-only checks
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

  // Ranges
  // Psychometric: 200–800
  if (minPsycho !== undefined && !isNumInRange(minPsycho, 200, 800)) {
    errors.minPsycho = "טווח לא תקין (לדוגמה 200–800)";
  }

  // Bagrut average: 0–120
  if (minAverage !== undefined && !isNumInRange(minAverage, 0, 120)) {
    errors.minAverage = "טווח לא תקין (0–120)";
  }

  // Math/English: 0–100
  if (minMath !== undefined && !isNumInRange(minMath, 0, 100)) {
    errors.minMath = "טווח לא תקין (0–100)";
  }
  if (minEnglish !== undefined && !isNumInRange(minEnglish, 0, 100)) {
    errors.minEnglish = "טווח לא תקין (0–100)";
  }

  // Units: 3–5
  if (form.mathUnits.trim() && !isIntInRange(mathUnits, 3, 5)) {
    errors.mathUnits = 'יח"ל מתמטיקה חייב להיות 3–5';
  }
  if (form.englishUnits.trim() && !isIntInRange(englishUnits, 3, 5)) {
    errors.englishUnits = 'יח"ל אנגלית חייב להיות 3–5';
  }

  // Track-specific requirements
  if (form.track === "A") {
    if (minPsycho === undefined) errors.minPsycho = "במסלול א' חובה פסיכומטרי מינימלי";
  }

  if (form.track === "B") {
    if (minPsycho === undefined) errors.minPsycho = "במסלול ב' חובה פסיכומטרי/כמותי מינימלי";
    if (minAverage === undefined) errors.minAverage = "במסלול ב' חובה ממוצע בגרות מינימלי";
    if (minMath === undefined) errors.minMath = "במסלול ב' חובה ציון מתמטיקה מינימלי";
    if (!isIntInRange(mathUnits, 3, 5)) errors.mathUnits = 'במסלול ב\' חובה יח"ל מתמטיקה (3–5)';
  }

  // Track C is optional for now

  return errors;
}

type RequirementsListProps = {
  requirements: AdmissionRequirement[];
  onAddNew: () => void;
  onEdit: (req: AdmissionRequirement) => void;
  onDelete: (req: AdmissionRequirement) => void;
};

const RequirementsListSection = ({
  requirements,
  onAddNew,
  onEdit,
  onDelete,
}: RequirementsListProps) => (
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
        className={styles.roundButton}
        onClick={onAddNew}
      >
        הוספת תנאי קבלה חדש
      </Button>
    </Box>

    <Typography variant="body2" color="text.secondary" mb={2}>
      מספר תנאי הקבלה במערכת: {requirements.length}
    </Typography>

    <Paper elevation={0} className={styles.tablePaper} sx={{ bgcolor: "background.paper" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>פעולות</TableCell>
            <TableCell>סטטוס</TableCell>
            <TableCell>יח' אנגלית</TableCell>
            <TableCell>יח' מתמטיקה</TableCell>
            <TableCell>ממוצע בגרות מינימלי</TableCell>
            <TableCell>ציון אנגלית מינימלי</TableCell>
            <TableCell>ציון מתמטיקה מינימלי</TableCell>
            <TableCell>ציון פסיכומטרי מינימלי</TableCell>
            <TableCell>מסלול</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {requirements.map((r) => (
            <TableRow key={r.docId}>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon fontSize="small" />}
                    onClick={() => onEdit(r)}
                  >
                    עריכה
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                    onClick={() => onDelete(r)}
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
  </Box>
);

type RequirementAddProps = {
  form: FormState;
  errors: FormErrors;
  saveError: string;
  onChange: (
    field: keyof FormState
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onReset: () => void;
};

const RequirementAddSection = ({
  form,
  errors,
  saveError,
  onChange,
  onSave,
  onReset,
}: RequirementAddProps) => (
  <Box>
    <Typography variant="h5" fontWeight={600} mb={2}>
      הוספת תנאי קבלה חדש
    </Typography>
    <Typography variant="body2" color="text.secondary" mb={3}>
      אפשר לשמור רק אם כל השדות הנדרשים למסלול תקינים.
    </Typography>

    {renderFormFields(form, onChange, errors)}
    {saveError && (
      <Box mt={2}>
        <Alert severity="error">{saveError}</Alert>
      </Box>
    )}

    <Box mt={4} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
      <Button
        variant="contained"
        color="success"
        className={styles.roundButtonWide}
        onClick={onSave}
      >
        שמירה
      </Button>
      <Button
        variant="outlined"
        className={styles.roundButtonWide}
        onClick={onReset}
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
);

const AdminAdmissionRequirementsPage = () => {
  const { requirementId } = useParams();
  const [tab, setTab] = useState(0);

  //  ????? ????? (Firestore)
  const [requirements, setRequirements] = useState<AdmissionRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [saveError, setSaveError] = useState("");
  const didSeedRef = useRef(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success",
  });

  const seedRequirements = async () => {
    const seedItems = [
      {
        track: "A",
        trackName: "\u05de\u05e1\u05dc\u05d5\u05dc \u05d0' - \u05e4\u05e1\u05d9\u05db\u05d5\u05de\u05d8\u05e8\u05d9 \u05d9\u05e9\u05d9\u05e8",
        minPsycho: 650,
        status: "active",
      },
      {
        track: "B",
        trackName: "\u05de\u05e1\u05dc\u05d5\u05dc \u05d1' - \u05e1\u05db\u05d5\u05dd \u05de\u05e9\u05d5\u05dc\u05d1",
        minPsycho: 130,
        minAverage: 90,
        minMath: 85,
        mathUnits: 5,
        status: "active",
      },
    ];

    try {
      await Promise.all(
        seedItems.map((item) =>
          addDoc(collection(db, "requirements"), { ...item, createdAt: serverTimestamp() })
        )
      );
    } catch (err) {
      console.error("Failed to seed requirements", err);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "requirements"),
      (snap) => {
        const items: AdmissionRequirement[] = snap.docs.map((d) => {
          const data = d.data() as Partial<RequirementDoc>;
          return {
            docId: d.id,
            track: data.track ?? "A",
            trackName: String(data.trackName ?? ""),
            minPsycho: data.minPsycho ?? undefined,
            minAverage: data.minAverage ?? undefined,
            minMath: data.minMath ?? undefined,
            minEnglish: data.minEnglish ?? undefined,
            mathUnits: data.mathUnits ?? undefined,
            englishUnits: data.englishUnits ?? undefined,
            status: data.status ?? "active",
            createdAt: data.createdAt,
          };
        });
        items.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));

        if (items.length === 0 && !didSeedRef.current) {
          didSeedRef.current = true;
          seedRequirements();
        }

        setRequirements(items);
        setIsLoading(false);

      },
      () => {
        setIsLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Add form
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);
  const [missingRequirementId, setMissingRequirementId] = useState<string | null>(null);
  const lastHandledIdRef = useRef<string | null>(null);

  // Edit/Delete
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<AdmissionRequirement | null>(null);

  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [edited, setEdited] = useState(false);


  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setSaved(false);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSave = async () => {
    const v = validateForm(form);
    setErrors(v);
    if (Object.values(v).some(Boolean)) return;
    setSaveError("");

    const payload = {
      track: form.track as TrackType,
      trackName: form.trackName.trim(),
      minPsycho: toNumberOrUndef(form.minPsycho),
      minAverage: toNumberOrUndef(form.minAverage),
      minMath: toNumberOrUndef(form.minMath),
      minEnglish: toNumberOrUndef(form.minEnglish),
      mathUnits: toNumberOrUndef(form.mathUnits),
      englishUnits: toNumberOrUndef(form.englishUnits),
      status: form.status,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "requirements"), payload);
      setSaved(true);
      setSnack({ open: true, msg: "תנאי קבלה נשמר בהצלחה.", severity: "success" });
      setForm(emptyForm);
      setErrors({});
      setTab(0);
    } catch (err) {
      console.error("Failed to add requirement", err);
      setSaved(false);
      setSaveError("\u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05e9\u05de\u05d9\u05e8\u05d4. \u05e0\u05e1\u05d9 \u05e9\u05d5\u05d1.");
      setSnack({ open: true, msg: "שגיאה בשמירה. נסי שוב.", severity: "error" });
    }
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

  useEffect(() => {
    if (!requirementId) {
      lastHandledIdRef.current = null;
      setMissingRequirementId(null);
      return;
    }

    if (lastHandledIdRef.current === requirementId) return;

    const match = requirements.find((r) => r.docId === requirementId);
    if (match) {
      setMissingRequirementId(null);
      openEdit(match);
    } else {
      setMissingRequirementId(requirementId);
    }
    lastHandledIdRef.current = requirementId;
  }, [requirementId, requirements]);

  const handleEditChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
      setEdited(false);
      setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const saveEdit = async () => {
    const v = validateForm(editForm);
    setEditErrors(v);
    if (Object.values(v).some(Boolean)) return;
    if (!selected) return;

    const updated = {
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

    try {
      await updateDoc(doc(db, "requirements", selected.docId), updated);
      setEdited(true);
      setSnack({ open: true, msg: "עודכן בהצלחה.", severity: "success" });
      setTimeout(() => {
        setEditOpen(false);
        setSelected(null);
      }, 600);
    } catch (err) {
      console.error("Failed to update requirement", err);
      setEdited(false);
      setSnack({ open: true, msg: "שגיאה בעדכון. נסי שוב.", severity: "error" });
    }
  };

  const openDelete = (r: AdmissionRequirement) => {
    setSelected(r);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await deleteDoc(doc(db, "requirements", selected.docId));
      setDeleteOpen(false);
      setSelected(null);
      setSnack({ open: true, msg: "נמחק בהצלחה.", severity: "success" });
    } catch (err) {
      console.error("Failed to delete requirement", err);
      setDeleteOpen(false);
      setSelected(null);
      setSnack({ open: true, msg: "שגיאה במחיקה. נסי שוב.", severity: "error" });
    }
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

        <Paper
          elevation={3}
          className={styles.sectionPaper}
          sx={{ bgcolor: "background.paper" }}
        >
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            centered
            sx={{ mb: 3, "& .MuiTab-root": { fontWeight: 600 } }}
          >
            <Tab label="רשימת תנאי קבלה" />
            <Tab label="הוספת תנאי קבלה חדש" />
          </Tabs>

          {isLoading && <LinearProgress sx={{ mb: 2 }} />}
          {!!missingRequirementId && (
            <Alert severity="error" sx={{ mb: 2 }}>
              תנאי קבלה עם המזהה "{missingRequirementId}" לא נמצא במערכת.
            </Alert>
          )}


          {/* ===== TAB 0: LIST ===== */}
          {tab === 0 && (
            <RequirementsListSection
              requirements={requirements}
              onAddNew={() => setTab(1)}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          )}
{/* ===== TAB 1: ADD ===== */}
          {tab === 1 && (
            <RequirementAddSection
              form={form}
              errors={errors}
              saveError={saveError}
              onChange={handleChange}
              onSave={handleSave}
              onReset={handleReset}
            />
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

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack({ open: false, msg: "", severity: snack.severity })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack({ open: false, msg: "", severity: snack.severity })}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAdmissionRequirementsPage;




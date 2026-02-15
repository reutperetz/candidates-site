// src/pages/AdminCandidatesPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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
  LinearProgress,
  Snackbar,
} from "@mui/material";

import Grid from "@mui/material/GridLegacy";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import styles from "../styles/adminShared.module.css";

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
type TrackStatus = "active" | "inactive";
type Units = 3 | 4 | 5;

type StudyTrack = {
  docId: string;
  code: string;
  name: string;
  status: TrackStatus;
};

interface Candidate {
  docId: string; // Firestore Document ID
  idNumber: string; // ת.ז (כשדה רגיל)
  fullName: string;
  psychometric: number; // 200-800
  bagrutAverage: number; // 60-120
  mathUnits: Units;
  englishUnits: Units;
  preferredTrackId: string;
  preferredTrackName: string;
  status: CandidateStatus;
  createdAtText: string; // dd/mm/yyyy לתצוגה
  createdAt?: Timestamp; // לשמירה/מיון (אופציונלי)
}

type CandidateDoc = Omit<Candidate, "docId">;

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
  preferredTrackId: string;
  status: string;
};

const emptyForm: FormState = {
  fullName: "",
  idNumber: "",
  psychometric: "",
  bagrutAverage: "",
  mathUnits: "",
  englishUnits: "",
  preferredTrackId: "",
  status: "",
};

type CandidatesListProps = {
  filtered: Candidate[];
  totalCount: number;
  query: string;
  onQueryChange: (value: string) => void;
  onAddNew: () => void;
  onEdit: (candidate: Candidate) => void;
  onDelete: (candidate: Candidate) => void;
  getTrackLabel: (candidate: Candidate) => string;
};

const CandidatesList = ({
  filtered,
  totalCount,
  query,
  onQueryChange,
  onAddNew,
  onEdit,
  onDelete,
  getTrackLabel,
}: CandidatesListProps) => (
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
        className={styles.roundButton}
        onClick={onAddNew}
      >
        הוספת מועמד חדש
      </Button>
        <TextField
          size="small"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="חיפוש לפי שם / ת.ז / סטטוס..."
        />
      </Stack>
    </Box>

    <Typography variant="body2" color="text.secondary" mb={2}>
      מספר המועמדים במערכת: {totalCount}
    </Typography>

    <Paper elevation={0} className={styles.tablePaper} sx={{ bgcolor: "background.paper" }}>
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
                    onClick={() => onEdit(c)}
                  >
                    עריכה
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                    onClick={() => onDelete(c)}
                  >
                    מחיקה
                  </Button>
                </Stack>
              </TableCell>
              <TableCell>{statusChip(c.status)}</TableCell>
              <TableCell>{getTrackLabel(c)}</TableCell>
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
);

type CandidateFormProps = {
  form: FormState;
  formErrors: Partial<Record<keyof FormState, string>>;
  formTouched: Record<string, boolean>;
  tracksLoading: boolean;
  activeTracks: StudyTrack[];
  canSave: boolean;
  onChangeForm: (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSetTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onAddCandidate: () => void;
  onReset: () => void;
  onBackToList: () => void;
};

const CandidateFormSection = ({
  form,
  formErrors,
  formTouched,
  tracksLoading,
  activeTracks,
  canSave,
  onChangeForm,
  onSetForm,
  onSetTouched,
  onAddCandidate,
  onReset,
  onBackToList,
}: CandidateFormProps) => (
  <Box>
    <Typography variant="h5" fontWeight={600} mb={2}>
      הוספת מועמד חדש
    </Typography>

    <Typography variant="body2" color="text.secondary" mb={3}>
      שדות חובה: שם מלא, ת.ז, מסלול מועדף, סטטוס. שאר השדות אופציונליים אך חייבים להיות
      בטווח אם הוזנו.
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
            onSetForm((p) => ({ ...p, idNumber: onlyDigits }));
            onSetTouched((t) => ({ ...t, idNumber: true }));
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
            onSetForm((p) => ({ ...p, psychometric: onlyDigits }));
            onSetTouched((t) => ({ ...t, psychometric: true }));
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
            onSetForm((p) => ({ ...p, bagrutAverage: onlyDigits }));
            onSetTouched((t) => ({ ...t, bagrutAverage: true }));
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
          value={form.preferredTrackId}
          onChange={onChangeForm("preferredTrackId")}
          error={!!formErrors.preferredTrackId && !!formTouched.preferredTrackId}
          helperText={
            formTouched.preferredTrackId
              ? formErrors.preferredTrackId
              : tracksLoading
                ? "טוען מסלולים..."
                : activeTracks.length === 0
                  ? "אין מסלולים פעילים - יש ליצור מסלול"
                  : " "
          }
          disabled={tracksLoading || activeTracks.length === 0}
        >
          <MenuItem value="">בחרי</MenuItem>
          {activeTracks.map((track) => (
            <MenuItem key={track.docId} value={track.docId}>
              {track.name}
            </MenuItem>
          ))}
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
        className={styles.roundButtonWide}
        onClick={onAddCandidate}
        disabled={!canSave}
      >
        שמירה
      </Button>
      <Button variant="outlined" className={styles.roundButtonWide} onClick={onReset}>
        ניקוי שדות
      </Button>
      <Button variant="text" className={styles.roundButton} onClick={onBackToList}>
        חזרה לרשימה
      </Button>
    </Box>
  </Box>
);

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

const normalize = (value: string) => value.trim().toLowerCase();

const AdminCandidatesPage = () => {
  const { candidateId } = useParams();
  // 0 = רשימה, 1 = הוספה
  const [tab, setTab] = useState(0);

  const [tracks, setTracks] = useState<StudyTrack[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
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
  const [isLoading, setIsLoading] = useState(true);
  const [missingCandidateId, setMissingCandidateId] = useState<string | null>(null);
  const lastHandledIdRef = useRef<string | null>(null);

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
            status: (data.status === "active" || data.status === "inactive"
              ? data.status
              : "inactive") as TrackStatus,
          };
        });
        setTracks(items);
        setTracksLoading(false);
      },
      () => setTracksLoading(false)
    );

    return () => unsub();
  }, []);

  // ===== Firestore: טעינה בזמן אמת =====
  useEffect(() => {
    console.log(
      "[CandidatesSnapshot] subscribing... projectId:",
      import.meta.env.VITE_FIREBASE_PROJECT_ID
    );

    const unsub = onSnapshot(
      collection(db, "candidates"),
      (snap) => {
        try {
          console.log("[CandidatesSnapshot] size:", snap.size);
          console.log("[CandidatesSnapshot] ids:", snap.docs.map((d) => d.id));
          console.log("[CandidatesSnapshot] firstDoc:", snap.docs[0]?.data());

          const items: Candidate[] = snap.docs.map((d) => {
            const data = d.data() as Partial<CandidateDoc>;

            const createdAtTs = data.createdAt as Timestamp | undefined;
            const createdAtText =
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
              preferredTrackId: String(data.preferredTrackId ?? ""),
              preferredTrackName: String(
                data.preferredTrackName ??
                  (data as { preferredTrack?: unknown }).preferredTrack ??
                  ""
              ),
              status: coerceStatus(data.status),
              createdAtText,
              createdAt: createdAtTs,
            };
          });

          items.sort((a, b) => {
            const at = a.createdAt?.toMillis?.() ?? 0;
            const bt = b.createdAt?.toMillis?.() ?? 0;
            return bt - at;
          });

          setCandidates(items);
        } catch (e) {
          console.error("[CandidatesSnapshot] MAPPING FAILED:", e);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("[CandidatesSnapshot] SNAPSHOT ERROR:", err);
        setIsLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const trackById = useMemo(() => {
    const map: Record<string, StudyTrack> = {};
    tracks.forEach((t) => {
      map[t.docId] = t;
    });
    return map;
  }, [tracks]);

  const activeTracks = useMemo(
    () => tracks.filter((t) => t.status === "active"),
    [tracks]
  );

  const getTrackLabel = (c: Candidate) => {
    const track = trackById[c.preferredTrackId];
    return track?.name || c.preferredTrackName || "";
  };

  const isActiveTrackId = (trackId: string) =>
    trackById[trackId]?.status === "active";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;

    return candidates.filter((c) => {
      const statusText =
        c.status === "accepted" ? "התקבל" : c.status === "pending" ? "בדיקה" : "נדחה";
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.idNumber.includes(q) ||
        getTrackLabel(c).toLowerCase().includes(q) ||
        statusText.includes(q)
      );
    });
  }, [candidates, query, trackById]);

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

    if (!form.preferredTrackId) errors.preferredTrackId = "שדה חובה";
    else if (!isActiveTrackId(form.preferredTrackId))
      errors.preferredTrackId = "לא ניתן לבחור מסלול לא פעיל";
    if (!form.status) errors.status = "שדה חובה";

    return errors;
  }, [form]);

  const canSave = useMemo(() => {
    const requiredOk =
      isHebrewNameLike(form.fullName) &&
      isIsraeliId9Digits(form.idNumber) &&
      !!form.preferredTrackId &&
      isActiveTrackId(form.preferredTrackId) &&
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
  }, [form, trackById]);

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
        preferredTrackId: true,
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

    const selectedTrack = trackById[form.preferredTrackId];
    if (!selectedTrack || selectedTrack.status !== "active") {
      setSnack({ open: true, msg: "לא ניתן לבחור מסלול לא פעיל" });
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
        preferredTrackId: selectedTrack.docId,
        preferredTrackName: selectedTrack.name,
        status: form.status as CandidateStatus,
        createdAt: serverTimestamp(),
        createdAtText: formatDateIL(new Date()),
      };

      console.log("[SaveCandidate] projectId:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
      console.log("[SaveCandidate] collection:", "candidates");
      console.log("[SaveCandidate] payload:", {
        idNumber: payload.idNumber,
        preferredTrackId: payload.preferredTrackId,
        preferredTrackName: payload.preferredTrackName,
        status: payload.status,
        mathUnits: payload.mathUnits,
        englishUnits: payload.englishUnits,
        bagrutAverage: payload.bagrutAverage,
        psychometric: payload.psychometric,
      });

      const docRef = await addDoc(collection(db, "candidates"), payload);
      console.log("[SaveCandidate] success docId:", docRef.id);

      setForm(emptyForm);
      setFormTouched({});
      setSnack({ open: true, msg: "מועמד נוסף בהצלחה" });
      setTab(0);
    } catch (err) {
      console.error("[SaveCandidate] FAILED:", err);
      alert("Save failed. Check console for details.");
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

    if (!editForm.preferredTrackId) errors.preferredTrackId = "שדה חובה";
    else if (!isActiveTrackId(editForm.preferredTrackId))
      errors.preferredTrackId = "לא ניתן לבחור מסלול לא פעיל";
    if (!editForm.status) errors.status = "שדה חובה";

    return errors;
  }, [editForm]);

  const canSaveEdit = useMemo(() => {
    const requiredOk =
      isHebrewNameLike(editForm.fullName) &&
      isIsraeliId9Digits(editForm.idNumber) &&
      !!editForm.preferredTrackId &&
      isActiveTrackId(editForm.preferredTrackId) &&
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
  }, [editForm, trackById]);

  const openEdit = (c: Candidate) => {
    setEditDocId(c.docId);
    const fallbackTrackId =
      c.preferredTrackId ||
      tracks.find((t) => normalize(t.name) === normalize(c.preferredTrackName))?.docId ||
      "";
    setEditForm({
      fullName: c.fullName,
      idNumber: c.idNumber,
      psychometric: String(c.psychometric || ""),
      bagrutAverage: String(c.bagrutAverage || ""),
      mathUnits: String(c.mathUnits || ""),
      englishUnits: String(c.englishUnits || ""),
      preferredTrackId: fallbackTrackId,
      status: c.status,
    });
    setEditTouched({});
    setEditOpen(true);
  };

  useEffect(() => {
    if (!candidateId) {
      lastHandledIdRef.current = null;
      setMissingCandidateId(null);
      return;
    }

    if (lastHandledIdRef.current === candidateId) return;

    const match = candidates.find((c) => c.docId === candidateId);
    if (match) {
      setMissingCandidateId(null);
      openEdit(match);
    } else {
      setMissingCandidateId(candidateId);
    }
    lastHandledIdRef.current = candidateId;
  }, [candidateId, candidates]);

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
        preferredTrackId: true,
        status: true,
      });
      return;
    }

    const selectedTrack = trackById[editForm.preferredTrackId];
    if (!selectedTrack || selectedTrack.status !== "active") {
      setSnack({ open: true, msg: "לא ניתן לבחור מסלול לא פעיל" });
      return;
    }

    try {
      await updateDoc(doc(db, "candidates", editDocId), {
        fullName: editForm.fullName.trim().replace(/\s+/g, " "),
        psychometric: toIntSafe(editForm.psychometric) ?? 0,
        bagrutAverage: toIntSafe(editForm.bagrutAverage) ?? 0,
        mathUnits: coerceUnits(toIntSafe(editForm.mathUnits) ?? 3),
        englishUnits: coerceUnits(toIntSafe(editForm.englishUnits) ?? 3),
        preferredTrackId: selectedTrack.docId,
        preferredTrackName: selectedTrack.name,
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

        <Paper
          elevation={3}
          className={styles.sectionPaper}
          sx={{ bgcolor: "background.paper" }}
        >
          {(isLoading || tracksLoading) && <LinearProgress sx={{ mb: 2 }} />}
          {!!missingCandidateId && (
            <Alert severity="error" sx={{ mb: 2 }}>
              מועמד עם המזהה "{missingCandidateId}" לא נמצא במערכת.
            </Alert>
          )}
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
            <CandidatesList
              filtered={filtered}
              totalCount={candidates.length}
              query={query}
              onQueryChange={setQuery}
              onAddNew={() => setTab(1)}
              onEdit={openEdit}
              onDelete={openDelete}
              getTrackLabel={getTrackLabel}
            />
          )}

          {/* ===== TAB 1: ADD ===== */}
          {tab === 1 && (
            <CandidateFormSection
              form={form}
              formErrors={formErrors}
              formTouched={formTouched}
              tracksLoading={tracksLoading}
              activeTracks={activeTracks}
              canSave={canSave}
              onChangeForm={onChangeForm}
              onSetForm={setForm}
              onSetTouched={setFormTouched}
              onAddCandidate={handleAddCandidate}
              onReset={handleReset}
              onBackToList={() => setTab(0)}
            />
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
                value={editForm.preferredTrackId}
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, preferredTrackId: e.target.value }));
                  setEditTouched((t) => ({ ...t, preferredTrackId: true }));
                }}
                error={!!editErrors.preferredTrackId && !!editTouched.preferredTrackId}
                helperText={editTouched.preferredTrackId ? editErrors.preferredTrackId : " "}
              >
                <MenuItem value="">בחרי</MenuItem>
                {tracks.map((track) => (
                  <MenuItem key={track.docId} value={track.docId} disabled={track.status !== "active"}>
                    {track.name}{track.status !== "active" ? " (לא פעיל)" : ""}
                  </MenuItem>
                ))}
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

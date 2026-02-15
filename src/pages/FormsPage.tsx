// src/pages/FormsPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  LinearProgress,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import Grid from "@mui/material/GridLegacy";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RuleIcon from "@mui/icons-material/Rule";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import { useNavigate } from "react-router-dom";
import styles from "./FormsPage.module.css";

// Firestore
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

type TrackStatus = "active" | "inactive";

type StudyTrack = {
  docId: string;
  name: string;
  status: TrackStatus;
};

type CandidateForm = {
  idNumber: string; // ת"ז
  fullName: string;
  phone: string;
  email: string;

  psychometric: string; // 200-800
  bagrutAvg: string; // 0-120
  mathUnits: string; // 3/4/5
  mathGrade: string; // 0-100
  englishUnits: string; // 3/4/5
  englishGrade: string; // 0-100

  preferredTrackId: string;
};

const ID_REGEX = /^\d{9}$/;
const PHONE_REGEX = /^\d{9,10}$/; // ישראל לרוב 9-10 ספרות (כולל 0)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clampNumberStr(value: string) {
  if (value === "") return "";
  return value.replace(/[^\d]/g, "");
}

const emptyForm: CandidateForm = {
  idNumber: "",
  fullName: "",
  phone: "",
  email: "",
  psychometric: "",
  bagrutAvg: "",
  mathUnits: "",
  mathGrade: "",
  englishUnits: "",
  englishGrade: "",
  preferredTrackId: "",
};

export default function FormsPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CandidateForm>(emptyForm);

  const [touched, setTouched] = useState<Record<keyof CandidateForm, boolean>>({
    idNumber: false,
    fullName: false,
    phone: false,
    email: false,
    psychometric: false,
    bagrutAvg: false,
    mathUnits: false,
    mathGrade: false,
    englishUnits: false,
    englishGrade: false,
    preferredTrackId: false,
  });

  const [snack, setSnack] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tracks, setTracks] = useState<StudyTrack[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "study_tracks"),
      (snap) => {
        const items: StudyTrack[] = snap.docs.map((doc) => {
          const data = doc.data() as Partial<StudyTrack>;
          return {
            docId: doc.id,
            name: String(data.name ?? ""),
            status:
              data.status === "active" || data.status === "inactive" ? data.status : "inactive",
          };
        });
        setTracks(items);
        setTracksLoading(false);
      },
      () => setTracksLoading(false)
    );

    return () => unsub();
  }, []);

  const activeTracks = useMemo(
    () => tracks.filter((track) => track.status === "active"),
    [tracks]
  );

  const fallbackTracks = useMemo<StudyTrack[]>(
    () => [
      { docId: "fallback-morning", name: "מסלול בוקר", status: "active" },
      { docId: "fallback-evening", name: "מסלול ערב", status: "active" },
    ],
    []
  );

  const selectableTracks = activeTracks.length > 0 ? activeTracks : fallbackTracks;

  const trackById = useMemo(() => {
    const map: Record<string, StudyTrack> = {};
    [...tracks, ...fallbackTracks].forEach((track) => {
      map[track.docId] = track;
    });
    return map;
  }, [tracks, fallbackTracks]);

  const setField = (key: keyof CandidateForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const markTouched = (key: keyof CandidateForm) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const errors = useMemo(() => {
    const e: Partial<Record<keyof CandidateForm, string>> = {};

    // ת"ז
    if (!form.idNumber.trim()) e.idNumber = "שדה חובה";
    else if (!ID_REGEX.test(form.idNumber))
      e.idNumber = "תעודת זהות חייבת להיות 9 ספרות בלבד";

    // שם מלא
    if (!form.fullName.trim()) e.fullName = "שדה חובה";
    else {
      const words = form.fullName.trim().split(/\s+/);
      if (words.length < 2) e.fullName = "יש להזין לפחות שתי מילים";
      const nameOk = /^[A-Za-z\u0590-\u05FF\s'-]+$/.test(form.fullName.trim());
      if (!nameOk) e.fullName = "השם יכול להכיל אותיות ורווחים בלבד";
    }

    // טלפון
    if (!form.phone.trim()) e.phone = "שדה חובה";
    else if (!PHONE_REGEX.test(form.phone)) e.phone = "טלפון חייב להיות 9–10 ספרות בלבד";

    // אימייל
    if (!form.email.trim()) e.email = "שדה חובה";
    else if (!EMAIL_REGEX.test(form.email.trim())) e.email = "אימייל לא תקין";

    // פסיכומטרי 200-800
    if (!form.psychometric.trim()) e.psychometric = "שדה חובה";
    else {
      const n = Number(form.psychometric);
      if (Number.isNaN(n)) e.psychometric = "מספר לא תקין";
      else if (n < 200 || n > 800) e.psychometric = "הטווח הוא 200–800";
    }

    // ממוצע בגרות 0-120
    if (!form.bagrutAvg.trim()) e.bagrutAvg = "שדה חובה";
    else {
      const n = Number(form.bagrutAvg);
      if (Number.isNaN(n)) e.bagrutAvg = "מספר לא תקין";
      else if (n < 0 || n > 120) e.bagrutAvg = "הטווח הוא 0–120";
    }

    // יחידות מתמטיקה 3/4/5
    if (!form.mathUnits.trim()) e.mathUnits = "שדה חובה";
    else if (!["3", "4", "5"].includes(form.mathUnits))
      e.mathUnits = "אפשר לבחור רק 3 / 4 / 5";

    // ציון מתמטיקה 0-100
    if (!form.mathGrade.trim()) e.mathGrade = "שדה חובה";
    else {
      const n = Number(form.mathGrade);
      if (Number.isNaN(n)) e.mathGrade = "מספר לא תקין";
      else if (n < 0 || n > 100) e.mathGrade = "הטווח הוא 0–100";
    }

    // יחידות אנגלית 3/4/5
    if (!form.englishUnits.trim()) e.englishUnits = "שדה חובה";
    else if (!["3", "4", "5"].includes(form.englishUnits))
      e.englishUnits = "אפשר לבחור רק 3 / 4 / 5";

    // ציון אנגלית 0-100
    if (!form.englishGrade.trim()) e.englishGrade = "שדה חובה";
    else {
      const n = Number(form.englishGrade);
      if (Number.isNaN(n)) e.englishGrade = "מספר לא תקין";
      else if (n < 0 || n > 100) e.englishGrade = "הטווח הוא 0–100";
    }

    // מסלול מועדף
    if (!form.preferredTrackId.trim()) e.preferredTrackId = "שדה חובה";
    else if (trackById[form.preferredTrackId]?.status !== "active")
      e.preferredTrackId = "לא ניתן לבחור מסלול לא פעיל";

    return e;
  }, [form, trackById]);

  const isValid = Object.keys(errors).length === 0;

  const onSubmit = async () => {
    // נוגעים בהכל כדי שיראו הודעות
    setTouched({
      idNumber: true,
      fullName: true,
      phone: true,
      email: true,
      psychometric: true,
      bagrutAvg: true,
      mathUnits: true,
      mathGrade: true,
      englishUnits: true,
      englishGrade: true,
      preferredTrackId: true,
    });

    if (!isValid) {
      setSnack({
        open: true,
        type: "error",
        message: "יש למלא את כל השדות החובה לפני השליחה.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedTrack = trackById[form.preferredTrackId];
      // Firestore: doc id נוצר אוטומטית
      const payload = {
        ...form,
        preferredTrackName: selectedTrack?.name ?? "",
        status: "חדש" as const,
        createdAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, "candidate_submissions"), payload);

      setSnack({
        open: true,
        type: "success",
        message: `המועמדות נשלחה בהצלחה ✅ (מספר פנייה: ${ref.id})`,
      });

      // איפוס
      setForm(emptyForm);
      setTouched({
        idNumber: false,
        fullName: false,
        phone: false,
        email: false,
        psychometric: false,
        bagrutAvg: false,
        mathUnits: false,
        mathGrade: false,
        englishUnits: false,
        englishGrade: false,
        preferredTrackId: false,
      });
    } catch {
      setSnack({
        open: true,
        type: "error",
        message: "שגיאה בשליחה. נסי שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showError = (key: keyof CandidateForm) => touched[key] && !!errors[key];

  return (
    <Box className={styles.pageSection}>
      <Container maxWidth="lg" dir="rtl">
        {/* כותרת */}
        <Box className={styles.header}>
          {(isSubmitting || tracksLoading) && (
            <LinearProgress className={styles.progress} />
          )}
          <Chip
            label="הגשת מועמדות"
            className={styles.headerChip}
          />
          <Typography variant="h4" component="h1" className={styles.headerTitle}>
            טפסים – Forms
          </Typography>
          <Typography variant="body1" className={styles.headerSubtitle}>
            כאן אפשר להגיש מועמדות ללימודים, לעיין בקורסים ובתנאי הקבלה, ולקבל עזרה במידת הצורך.
          </Typography>
        </Box>

        {/* טופס מועמדות */}
        <Card className={`${styles.cardBase} ${styles.cardTopSuccess}`}>
          <CardContent className={styles.cardContentRtl}>
            <Box className={styles.formHeaderRow}>
              <PersonAddAlt1Icon className={styles.iconSuccess} />
              <Typography variant="h6" fontWeight={700}>
                טופס הגשת מועמדות
              </Typography>
            </Box>

            <Typography variant="body2" className={styles.formDescription}>
              כל השדות חובה. לאחר השליחה תקבלי אישור, והמערכת תסמן את המועמדות כ״חדש״.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="תעודת זהות"
                  value={form.idNumber}
                  onChange={(e) => setField("idNumber", clampNumberStr(e.target.value))}
                  onBlur={() => markTouched("idNumber")}
                  error={showError("idNumber")}
                  helperText={showError("idNumber") ? errors.idNumber : "9 ספרות בלבד"}
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="שם מלא"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  onBlur={() => markTouched("fullName")}
                  error={showError("fullName")}
                  helperText={showError("fullName") ? errors.fullName : "לפחות שתי מילים"}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="טלפון"
                  value={form.phone}
                  onChange={(e) => setField("phone", clampNumberStr(e.target.value))}
                  onBlur={() => markTouched("phone")}
                  error={showError("phone")}
                  helperText={showError("phone") ? errors.phone : "9–10 ספרות"}
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="אימייל"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  onBlur={() => markTouched("email")}
                  error={showError("email")}
                  helperText={showError("email") ? errors.email : "לדוגמה: name@mail.com"}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label="מסלול מועדף"
                  value={form.preferredTrackId}
                  onChange={(e) => setField("preferredTrackId", e.target.value)}
                  onBlur={() => markTouched("preferredTrackId")}
                  error={showError("preferredTrackId")}
                  helperText={
                    showError("preferredTrackId")
                      ? errors.preferredTrackId
                      : tracksLoading
                        ? "טוען מסלולים..."
                        : selectableTracks.length === 0
                          ? "לא זמינים מסלולים כרגע"
                          : "בחרי מסלול מתאים"
                  }
                  disabled={tracksLoading}
                >
                  <MenuItem value="">
                    <em>לא נבחר</em>
                  </MenuItem>
                  {selectableTracks.map((track) => (
                    <MenuItem key={track.docId} value={track.docId}>
                      {track.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="ציון פסיכומטרי כללי"
                  value={form.psychometric}
                  onChange={(e) => setField("psychometric", clampNumberStr(e.target.value))}
                  onBlur={() => markTouched("psychometric")}
                  error={showError("psychometric")}
                  helperText={showError("psychometric") ? errors.psychometric : "200–800"}
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="ממוצע בגרות"
                  value={form.bagrutAvg}
                  onChange={(e) => setField("bagrutAvg", clampNumberStr(e.target.value))}
                  onBlur={() => markTouched("bagrutAvg")}
                  error={showError("bagrutAvg")}
                  helperText={showError("bagrutAvg") ? errors.bagrutAvg : "0–120"}
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="יחידות מתמטיקה"
                  value={form.mathUnits}
                  onChange={(e) => setField("mathUnits", e.target.value.replace(/[^\d]/g, ""))}
                  onBlur={() => markTouched("mathUnits")}
                  error={showError("mathUnits")}
                  helperText={showError("mathUnits") ? errors.mathUnits : "3 / 4 / 5"}
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="ציון מתמטיקה"
                  value={form.mathGrade}
                  onChange={(e) => setField("mathGrade", clampNumberStr(e.target.value))}
                  onBlur={() => markTouched("mathGrade")}
                  error={showError("mathGrade")}
                  helperText={showError("mathGrade") ? errors.mathGrade : "0–100"}
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="יחידות אנגלית"
                  value={form.englishUnits}
                  onChange={(e) => setField("englishUnits", e.target.value.replace(/[^\d]/g, ""))}
                  onBlur={() => markTouched("englishUnits")}
                  error={showError("englishUnits")}
                  helperText={showError("englishUnits") ? errors.englishUnits : "3 / 4 / 5"}
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="ציון אנגלית"
                  value={form.englishGrade}
                  onChange={(e) => setField("englishGrade", clampNumberStr(e.target.value))}
                  onBlur={() => markTouched("englishGrade")}
                  error={showError("englishGrade")}
                  helperText={showError("englishGrade") ? errors.englishGrade : "0–100"}
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>
            </Grid>

            <Box className={styles.submitRow}>
              <Button
                variant="contained"
                color="success"
                startIcon={<AssignmentIcon />}
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                שליחת מועמדות
              </Button>
              <Button variant="outlined" onClick={() => navigate("/admission-requirements")}>
                תנאי קבלה
              </Button>
              <Button variant="outlined" onClick={() => navigate("/courses")}>
                קורסים
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* כרטיסי מידע */}
        <Grid container spacing={3} className={styles.infoGrid}>
          <Grid item xs={12} md={4}>
            <Card className={`${styles.cardBase} ${styles.cardTopDark}`}>
              <CardContent className={styles.cardContentRtl}>
                <Box className={styles.infoHeaderRow}>
                  <RuleIcon className={styles.iconDark} />
                  <Typography variant="h6" fontWeight={700}>
                    איך יודעים אם עומדים בתנאי קבלה?
                  </Typography>
                </Box>
                <Typography variant="body2" className={styles.infoDescription}>
                  מומלץ לבדוק תנאי קבלה לפי המסלול המבוקש, ולהיעזר במחשבון הסיכוי.
                </Typography>
                <Button fullWidth variant="outlined" onClick={() => navigate("/admission-requirements")}>
                  מעבר לתנאי קבלה 
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className={`${styles.cardBase} ${styles.cardTopMain}`}>
              <CardContent className={styles.cardContentRtl}>
                <Box className={styles.infoHeaderRow}>
                  <MenuBookIcon className={styles.iconSuccess} />
                  <Typography variant="h6" fontWeight={700}>
                    הקורסים בתואר
                  </Typography>
                </Box>
                <Typography variant="body2" className={styles.infoDescription}>
                  אפשר לעיין ברשימת הקורסים ולבדוק אילו קורסים נלמדים בכל מסלול.
                </Typography>
                <Button fullWidth variant="outlined" onClick={() => navigate("/courses")}>
                  מעבר לקורסים
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className={`${styles.cardBase} ${styles.cardTopLight}`}>
              <CardContent className={styles.cardContentRtl}>
                <Box className={styles.infoHeaderRow}>
                  <HelpCenterIcon className={styles.iconLight} />
                  <Typography variant="h6" fontWeight={700}>
                    צריכים עזרה?
                  </Typography>
                </Box>
                <Typography variant="body2" className={styles.infoDescription}>
                  בעמוד העזרה תמצאי שאלות נפוצות ודרכי יצירת קשר.
                </Typography>
                <Button fullWidth variant="outlined" onClick={() => navigate("/help")}>
                  מעבר לעזרה
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* קישורים מהירים */}
        <Box className={styles.quickLinks}>
          <Divider className={styles.quickLinksDivider} />
          <Typography variant="h6" className={styles.quickLinksTitle}>
            קישורים מהירים
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Button fullWidth variant="outlined" onClick={() => navigate("/admission-calculator")}>
                מחשבון סיכוי קבלה
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button fullWidth variant="outlined" onClick={() => navigate("/login")}>
                התחברות
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button fullWidth variant="outlined" onClick={() => navigate("/help")}>
                תמיכה ועזרה
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Snackbar
          open={snack.open}
          autoHideDuration={3500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            severity={snack.type}
            variant="filled"
            className={styles.snackAlert}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}




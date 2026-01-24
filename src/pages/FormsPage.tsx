// src/pages/FormsPage.tsx
import { useMemo, useState } from "react";
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

// Firestore
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

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

  preferredTrack: string; // מסלול מועדף
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
  preferredTrack: "",
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
    preferredTrack: false,
  });

  const [snack, setSnack] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardBaseStyle = useMemo(
    () => ({
      height: "100%",
      boxShadow: 2,
      borderRadius: 3,
      overflow: "hidden",
      backgroundColor: "background.paper",
    }),
    []
  );

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
    else if (!ID_REGEX.test(form.idNumber)) e.idNumber = "תעודת זהות חייבת להיות 9 ספרות בלבד";

    // שם מלא
    if (!form.fullName.trim()) e.fullName = "שדה חובה";
    else {
      const words = form.fullName.trim().split(/\s+/);
      if (words.length < 2) e.fullName = "יש להזין לפחות שתי מילים";
      const nameOk = /^[A-Za-z\u0590-\u05FF\s'’-]+$/.test(form.fullName.trim());
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
    else if (!["3", "4", "5"].includes(form.mathUnits)) e.mathUnits = "אפשר לבחור רק 3 / 4 / 5";

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
    if (!form.preferredTrack.trim()) e.preferredTrack = "שדה חובה";

    return e;
  }, [form]);

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
      preferredTrack: true,
    });

    if (!isValid) {
      setSnack({
        open: true,
        type: "error",
        message: "יש לתקן את השדות המסומנים לפני השליחה.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Firestore: doc id נוצר אוטומטית
      const payload = {
        ...form,
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
        preferredTrack: false,
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
    <Box sx={{ bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="lg" dir="rtl">
        {/* כותרת */}
        <Box textAlign="center" mb={4}>
          {isSubmitting && <LinearProgress sx={{ mb: 2 }} />}
          <Chip
            label="הגשת מועמדות"
            sx={{
              mb: 2,
              bgcolor: "success.light",
              color: "success.main",
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h4"
            component="h1"
            sx={{ color: "success.main", fontWeight: 700, mb: 1 }}
          >
            טפסים – Forms
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 900, mx: "auto" }}>
            כאן אפשר להגיש מועמדות ללימודים, לעיין בקורסים ובתנאי הקבלה, ולקבל עזרה במידת הצורך.
          </Typography>
        </Box>

        {/* טופס מועמדות */}
        <Card sx={{ ...cardBaseStyle, borderTop: "4px solid", borderTopColor: "success.main", mb: 4 }}>
          <CardContent sx={{ direction: "rtl", textAlign: "right" }}>
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <PersonAddAlt1Icon sx={{ color: "success.main" }} />
              <Typography variant="h6" fontWeight={700}>
                טופס הגשת מועמדות
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
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
                  fullWidth
                  required
                  label="מסלול מועדף"
                  value={form.preferredTrack}
                  onChange={(e) => setField("preferredTrack", e.target.value)}
                  onBlur={() => markTouched("preferredTrack")}
                  error={showError("preferredTrack")}
                  helperText={
                    showError("preferredTrack")
                      ? errors.preferredTrack
                      : "לדוגמה: מדעי המחשב (בוקר)"
                  }
                />
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

            <Box mt={3} display="flex" justifyContent="flex-start" gap={1}>
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
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ ...cardBaseStyle, borderTop: "4px solid", borderTopColor: "success.dark" }}>
              <CardContent sx={{ direction: "rtl", textAlign: "right" }}>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <RuleIcon sx={{ color: "success.dark" }} />
                  <Typography variant="h6" fontWeight={700}>
                    איך יודעים אם עומדים בתנאי קבלה?
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  מומלץ לבדוק תנאי קבלה לפי המסלול המבוקש, ולהיעזר במחשבון הסיכוי.
                </Typography>
                <Button fullWidth variant="outlined" onClick={() => navigate("/admission-requirements")}>
                  מעבר לתנאי קבלה
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ ...cardBaseStyle, borderTop: "4px solid", borderTopColor: "success.main" }}>
              <CardContent sx={{ direction: "rtl", textAlign: "right" }}>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <MenuBookIcon sx={{ color: "success.main" }} />
                  <Typography variant="h6" fontWeight={700}>
                    הקורסים בתואר
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  אפשר לעיין ברשימת הקורסים ולבדוק אילו קורסים נלמדים בכל מסלול.
                </Typography>
                <Button fullWidth variant="outlined" onClick={() => navigate("/courses")}>
                  מעבר לקורסים
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ ...cardBaseStyle, borderTop: "4px solid", borderTopColor: "success.light" }}>
              <CardContent sx={{ direction: "rtl", textAlign: "right" }}>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <HelpCenterIcon sx={{ color: "success.light" }} />
                  <Typography variant="h6" fontWeight={700}>
                    צריכים עזרה?
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
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
        <Box mt={2}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "success.main" }}>
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
            sx={{ width: "100%" }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

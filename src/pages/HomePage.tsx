// src/pages/HomePage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";

import Grid from "@mui/material/GridLegacy";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useLocation, useNavigate } from "react-router-dom";

type HomeLocationState = {
  loginSuccess?: boolean;
  isGuest?: boolean;
  scrollTo?: "register";
};

type RegisterForm = {
  fullName: string;
  idNumber: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  studyTrack: "" | "morning" | "evening";
  plannedYear: "" | "2025" | "2026" | "2027";
  notes: string;
};

const initialRegister: RegisterForm = {
  fullName: "",
  idNumber: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  studyTrack: "",
  plannedYear: "",
  notes: "",
};

function isValidIsraeliID(id: string) {
  // בסיסי: רק 9 ספרות (לא אלגוריתם ספרת ביקורת כדי לא להכביד)
  return /^\d{9}$/.test(id);
}

function isValidPhone(phone: string) {
  // בסיסי ישראלי: 05X + 7 ספרות (מאפשר גם מקפים/רווחים אם תרצי להרחיב)
  return /^05\d{8}$/.test(phone);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState("התחברת בהצלחה");
  const [form, setForm] = useState<RegisterForm>(initialRegister);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterForm, string>>
  >({});

  const state = (location.state ?? {}) as HomeLocationState;

  const loginToastText = state?.isGuest
    ? "???????????? ???????????? (????????)"
    : "???????????? ????????????";
  const showLoginToast = Boolean(state?.loginSuccess);
  const showLocalToast = toastOpen;
  const showToast = showLocalToast || showLoginToast;
  const currentToastText = showLocalToast ? toastText : loginToastText;

  useEffect(() => {
    if (state?.scrollTo === "register") {
      // נותן רגע לרינדור ואז גולל
      setTimeout(() => {
        document.getElementById("register-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [state?.scrollTo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange =
    (key: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    };

  const validateRegister = useMemo(() => {
    return () => {
      const nextErrors: Partial<Record<keyof RegisterForm, string>> = {};

      if (!form.fullName.trim() || form.fullName.trim().split(" ").length < 2) {
        nextErrors.fullName = "נא להזין שם מלא (לפחות שתי מילים).";
      }
      if (!isValidIsraeliID(form.idNumber)) {
        nextErrors.idNumber = "תעודת זהות חייבת להכיל 9 ספרות.";
      }
      if (!isValidPhone(form.phone)) {
        nextErrors.phone = "טלפון חייב להיות בפורמט 05XXXXXXXX.";
      }
      if (!isValidEmail(form.email)) {
        nextErrors.email = "נא להזין אימייל תקין.";
      }
      if (form.password.length < 6) {
        nextErrors.password = "סיסמה חייבת להכיל לפחות 6 תווים.";
      }
      if (form.confirmPassword !== form.password) {
        nextErrors.confirmPassword = "אימות סיסמה לא תואם לסיסמה.";
      }
      if (!form.studyTrack) {
        nextErrors.studyTrack = "נא לבחור מסלול לימודים מועדף.";
      }
      if (!form.plannedYear) {
        nextErrors.plannedYear = "נא לבחור שנת התחלה מתוכננת.";
      }

      setErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    };
  }, [form]);

  const handleRegisterSubmit = () => {
    if (!validateRegister()) return;

    // דמו: שומרים משתמש מקומי ומראים הודעה
    localStorage.setItem(
      "registered_candidate",
      JSON.stringify({
        fullName: form.fullName.trim(),
        idNumber: form.idNumber,
        phone: form.phone,
        email: form.email.trim(),
        studyTrack: form.studyTrack,
        plannedYear: form.plannedYear,
      }),
    );

    setToastText("נרשמת בהצלחה! ניתן כעת להתחבר.");
    setToastOpen(true);
    setForm(initialRegister);
  };

  const handleReset = () => {
    setForm(initialRegister);
    setErrors({});
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }} dir="rtl">
      <Snackbar
        open={showToast}
        autoHideDuration={2500}
        onClose={() => {
          if (showLocalToast) setToastOpen(false);
          if (showLoginToast)
            navigate(location.pathname, { replace: true, state: {} });
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => {
            if (showLocalToast) setToastOpen(false);
            if (showLoginToast)
              navigate(location.pathname, { replace: true, state: {} });
          }}
          severity="success"
          sx={{ width: "100%" }}
        >
          {currentToastText}
        </Alert>
      </Snackbar>

      {/* כרטיס ברוכים הבאים */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: 4,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
          color: "success.contrastText",
        }}
      >
        <CardContent sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            ברוכים הבאים!
          </Typography>
          <Typography variant="body1">
            כאן תוכלו למצוא את כל המידע הדרוש על תהליך הקבלה למחלקה למדעי המחשב:
            הרשמה, תנאי קבלה, קורסים ומידע נוסף שיסייע לכם לקבל החלטה.
          </Typography>
        </CardContent>
      </Card>

      {/* ארבעת הכרטיסים */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
            }}
            onClick={() => navigate("/help")}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  הודעות חשובות
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  עדכונים ומידע חדש מהמכללה
                </Typography>
              </Box>
              <NotificationsActiveIcon
                sx={{ fontSize: 36, color: "success.main", ml: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
            }}
            onClick={() => navigate("/forms")}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  סטטוס הרשמה
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  בדיקת מצב הבקשה שלך להרשמה
                </Typography>
              </Box>
              <AssignmentTurnedInIcon
                sx={{ fontSize: 36, color: "success.main", ml: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
            }}
            onClick={() => navigate("/management")}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  קורסים שמתאימים עבורך
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  צפייה בקורסים ונתוני המסלול במחלקה
                </Typography>
              </Box>
              <MenuBookIcon
                sx={{ fontSize: 36, color: "success.main", ml: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
            }}
            onClick={() => navigate("/admission-calculator")}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  בדיקת סיכוי קבלה
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  הערכת סיכויי הקבלה על בסיס הנתונים שלך
                </Typography>
              </Box>
              <AssessmentIcon
                sx={{ fontSize: 36, color: "success.main", ml: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ------- טופס הרשמה מרכזי ------- */}
      <Box id="register-form" mb={2} textAlign="center">
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "success.main", mb: 1 }}
        >
          טופס הרשמה לתואר במדעי המחשב
        </Typography>
        <Typography variant="body2" color="text.secondary">
          הרשמה למועמד/ת – נדרשים פרטים אישיים + יצירת סיסמה.
        </Typography>
      </Box>

      <Card
        sx={{
          maxWidth: 700,
          mx: "auto",
          borderRadius: 3,
          boxShadow: "0 4px 15px rgba(0,0,0,0.10)",
          borderTop: "5px solid",
          borderTopColor: "success.main",
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              textAlign: "center",
              color: "success.main",
            }}
          >
            טופס הרשמה
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                פרטים אישיים
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="שם מלא"
                value={form.fullName}
                onChange={handleChange("fullName")}
                error={!!errors.fullName}
                helperText={errors.fullName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="תעודת זהות (9 ספרות)"
                value={form.idNumber}
                onChange={handleChange("idNumber")}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 9,
                }}
                error={!!errors.idNumber}
                helperText={errors.idNumber}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="טלפון נייד (05XXXXXXXX)"
                value={form.phone}
                onChange={handleChange("phone")}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 10,
                }}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="אימייל"
                value={form.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="סיסמה (לפחות 6 תווים)"
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="אימות סיסמה"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
            </Grid>

            <Grid item xs={12} mt={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                העדפות לימוד
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="מסלול לימודים מועדף"
                value={form.studyTrack}
                onChange={handleChange("studyTrack")}
                error={!!errors.studyTrack}
                helperText={errors.studyTrack}
              >
                <MenuItem value="">
                  <em>לא נבחר</em>
                </MenuItem>
                <MenuItem value="morning">מסלול בוקר</MenuItem>
                <MenuItem value="evening">מסלול ערב</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="שנת התחלה מתוכננת"
                value={form.plannedYear}
                onChange={handleChange("plannedYear")}
                error={!!errors.plannedYear}
                helperText={errors.plannedYear}
              >
                <MenuItem value="">
                  <em>לא נבחר</em>
                </MenuItem>
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2026">2026</MenuItem>
                <MenuItem value="2027">2027</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="הערות נוספות (לא חובה)"
                value={form.notes}
                onChange={handleChange("notes")}
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>

          <Box
            mt={3}
            display="flex"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Button variant="text" color="inherit" onClick={handleReset}>
              נקה טופס
            </Button>

            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => navigate("/forms")}
              >
                מעבר למסך הטפסים
              </Button>
              <Button
                variant="contained"
                color="success"
                sx={{ px: 4 }}
                onClick={handleRegisterSubmit}
              >
                הרשמה
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default HomePage;

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
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import styles from "./HomePage.module.css";

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
  studyTrackId: string;
  plannedYear: "" | "2025" | "2026" | "2027";
  notes: string;
};

type TrackStatus = "active" | "inactive";

type StudyTrack = {
  docId: string;
  name: string;
  status: TrackStatus;
};

const initialRegister: RegisterForm = {
  fullName: "",
  idNumber: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  studyTrackId: "",
  plannedYear: "",
  notes: "",
};

function isValidIsraeliID(id: string) {
  // Basic: 9 digits only (no checksum)
  return /^\d{9}$/.test(id);
}

function isValidPhone(phone: string) {
  // Basic Israeli mobile: 05X + 7 digits
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
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});

  const [tracks, setTracks] = useState<StudyTrack[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);

  const state = (location.state ?? {}) as HomeLocationState;

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

  const loginToastText = state?.isGuest
    ? "התחברת בהצלחה (אורח/ת)"
    : "התחברת בהצלחה";
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
      if (!form.studyTrackId) {
        nextErrors.studyTrackId = "נא לבחור מסלול לימודים מועדף.";
      } else if (trackById[form.studyTrackId]?.status !== "active") {
        nextErrors.studyTrackId = "לא ניתן לבחור מסלול לא פעיל.";
      }
      if (!form.plannedYear) {
        nextErrors.plannedYear = "נא לבחור שנת התחלה מתוכננת.";
      }

      setErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    };
  }, [form, trackById]);

  const handleRegisterSubmit = () => {
    const selectedTrack = trackById[form.studyTrackId];
    if (!validateRegister()) return;

    // דמו: שומרים משתמש מקומי ומראים הודעה
    localStorage.setItem(
      "registered_candidate",
      JSON.stringify({
        fullName: form.fullName.trim(),
        idNumber: form.idNumber,
        phone: form.phone,
        email: form.email.trim(),
        studyTrackId: form.studyTrackId,
        studyTrackName: selectedTrack?.name ?? "",
        plannedYear: form.plannedYear,
        registeredAt: new Date().toISOString(),
      })
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
    <Container maxWidth="lg" className={styles.container} dir="rtl">
      <Snackbar
        open={showToast}
        autoHideDuration={2500}
        onClose={() => {
          if (showLocalToast) setToastOpen(false);
          if (showLoginToast) navigate(location.pathname, { replace: true, state: {} });
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => {
            if (showLocalToast) setToastOpen(false);
            if (showLoginToast) navigate(location.pathname, { replace: true, state: {} });
          }}
          severity="success"
          className={styles.toastAlert}
        >
          {currentToastText}
        </Alert>
      </Snackbar>

      <Card className={styles.welcomeCard}>
        <CardContent className={styles.welcomeCardContent}>
          <Typography variant="h4" className={styles.welcomeTitle}>
            ברוכים הבאים!
          </Typography>
          <Typography variant="body1">
            כאן תוכלו למצוא את כל המידע הדרוש על תהליך הקבלה למחלקה למדעי המחשב:
            הרשמה, תנאי קבלה, קורסים ומידע נוסף שיסייע לכם לקבל החלטה זו.
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3} className={styles.featureGrid}>
        <Grid item xs={12} md={6}>
          <Card className={styles.featureCard} onClick={() => navigate("/help")}>
            <CardContent className={styles.featureCardContent}>
              <Box className={styles.featureText}>
                <Typography variant="subtitle1" fontWeight={700}>
                  הודעות חשובות
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  עדכונים ומידע חדש מהמכללה הזו.
                </Typography>
              </Box>
              <NotificationsActiveIcon className={styles.featureIcon} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className={styles.featureCard} onClick={() => navigate("/forms")}>
            <CardContent className={styles.featureCardContent}>
              <Box className={styles.featureText}>
                <Typography variant="subtitle1" fontWeight={700}>
                  סטטוס ההרשמה
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  בדיקת מצב הבקשה שלך להרשמה.
                </Typography>
              </Box>
              <AssignmentTurnedInIcon className={styles.featureIcon} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className={styles.featureCard} onClick={() => navigate("/management")}>
            <CardContent className={styles.featureCardContent}>
              <Box className={styles.featureText}>
                <Typography variant="subtitle1" fontWeight={700}>
                  קורסים שמתאימים עבורך
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  צפייה בקורסים ונתוני המסלול במחלקה.
                </Typography>
              </Box>
              <MenuBookIcon className={styles.featureIcon} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            className={styles.featureCard}
            onClick={() => navigate("/admission-calculator")}
          >
            <CardContent className={styles.featureCardContent}>
              <Box className={styles.featureText}>
                <Typography variant="subtitle1" fontWeight={700}>
                  בדיקת סיכוי קבלה
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  הערכת סיכויי הקבלה על בסיס הנתונים שלך.
                </Typography>
              </Box>
              <AssessmentIcon className={styles.featureIcon} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box id="register-form" className={styles.registerHeader}>
        <Typography variant="h5" className={styles.registerTitle}>
          טופס הרשמה לתואר במדעי המחשב
        </Typography>
        <Typography variant="body2" color="text.secondary">
          הרשמה למועמד/ת – נדרשים פרטים אישיים + יצירת סיסמה.
        </Typography>
      </Box>

      <Card className={styles.registerCard}>
        <CardContent>
          <Typography variant="h6" className={styles.registerCardTitle}>
            טופס הרשמה
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" className={styles.sectionLabel}>
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
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 9 }}
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
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 10 }}
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

            <Grid item xs={12} className={styles.sectionSpacer}>
              <Typography variant="subtitle2" className={styles.sectionLabel}>
                העדפות לימוד
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="מסלול לימודים מועדף"
                value={form.studyTrackId}
                onChange={handleChange("studyTrackId")}
                error={!!errors.studyTrackId}
                helperText={
                  errors.studyTrackId
                    ? errors.studyTrackId
                    : tracksLoading
                      ? "טוען מסלולים..."
                      : selectableTracks.length === 0
                        ? "לא זמינים מסלולים כרגע."
                        : " "
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

          <Box className={styles.actionsRow}>
            <Button variant="text" color="inherit" onClick={handleReset}>
              נקה טופס
            </Button>

            <Box className={styles.actionsGroup}>
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
                className={styles.submitButton}
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



import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  type AuthError,
} from "firebase/auth";
import { auth } from "../firebase";

import styles from "./LoginPage.module.css";

const getAuthErrorText = (err: AuthError) => {
  switch (err.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "פרטי ההתחברות שגויים.";
    case "auth/too-many-requests":
      return "ניסיון התחברות רב מדי. נסי שוב בעוד כמה דקות.";
    default:
      return "שגיאה בהתחברות. נסי שוב.";
  }
};

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  const [errorSnack, setErrorSnack] = useState<string | null>(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setErrorSnack("נא למלא אימייל וסיסמה.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, identifier.trim(), password);
      setOpenSnack(true);
      setErrorSnack(null);
      setTimeout(() => navigate("/"), 400);
    } catch (err) {
      setErrorSnack(getAuthErrorText(err as AuthError));
    }
  };

  const handleGuest = async () => {
    try {
      await signInAnonymously(auth);
      setOpenSnack(true);
      setErrorSnack(null);
      setTimeout(() => navigate("/"), 400);
    } catch {
      setErrorSnack("שגיאה בהתחברות כאורח. נסי שוב.");
    }
  };

  const handleGoToRegister = () => {
    navigate("/");
    setTimeout(() => {
      const el = document.getElementById("register");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.location.hash = "#register";
    }, 50);
  };

  return (
    <Box dir="rtl">
      <Container maxWidth="sm" className={styles.content}>
        <Typography variant="h6" align="center" fontWeight={700} color="success.main">
          המחלקה למדעי המחשב
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" className={styles.subtitle}>
          מידע לסטודנטים – המחלקה למדעי המחשב
        </Typography>

        <Paper elevation={3} className={styles.card}>
          <Box className={styles.cardHeader}>
            <Typography variant="h6" fontWeight={700}>
              התחברות למערכת
            </Typography>
            <Typography variant="body2">
              מידע לסטודנטים – המחלקה למדעי המחשב
            </Typography>
          </Box>

          <Box className={styles.cardBody}>
            <TextField
              fullWidth
              margin="normal"
              label="אימייל"
              variant="outlined"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="סיסמה"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={<LoginIcon />}
              className={styles.loginButton}
              onClick={handleLogin}
            >
              כניסה
            </Button>

            <Box className={styles.dividerRow}>
              <Divider className={styles.dividerLine} />
              <Typography variant="body2" color="text.secondary">
                או
              </Typography>
              <Divider className={styles.dividerLine} />
            </Box>

            <Button
              fullWidth
              variant="outlined"
              className={styles.guestButton}
              onClick={handleGuest}
            >
              כניסה כאורח (ללא הזדהות)
            </Button>

            <Box className={styles.registerRow}>
              <Typography variant="body2" color="text.secondary">
                עדיין לא נרשמת?
              </Typography>

              <Button variant="text" onClick={handleGoToRegister} className={styles.registerButton}>
                הרשמה עכשיו
              </Button>
            </Box>
          </Box>
        </Paper>

        <Snackbar
          open={openSnack}
          autoHideDuration={2500}
          onClose={() => setOpenSnack(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setOpenSnack(false)} severity="success" variant="filled">
            התחברת בהצלחה
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!errorSnack}
          autoHideDuration={2800}
          onClose={() => setErrorSnack(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setErrorSnack(null)} severity="error" variant="filled">
            {errorSnack}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default LoginPage;

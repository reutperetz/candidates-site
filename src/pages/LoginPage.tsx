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

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const fireAuthChanged = () => window.dispatchEvent(new Event("auth-changed"));

  const handleLogin = () => {
    // פה בעתיד תחברי API אמיתי. כרגע רק דמו:
    localStorage.setItem("authUser", identifier || "candidate");
    localStorage.setItem("authRole", "candidate");

    setOpenSnack(true);
    fireAuthChanged();

    // אופציונלי: להעביר לדף בית אחרי התחברות
    // setTimeout(() => navigate("/"), 700);
  };

  const handleGuest = () => {
    localStorage.setItem("authUser", "guest");
    localStorage.setItem("authRole", "guest");

    setOpenSnack(true);
    fireAuthChanged();

    // אופציונלי: להעביר לדף בית
    // setTimeout(() => navigate("/"), 700);
  };

  const handleGoToRegister = () => {
    // מעבר למסך הבית + גלילה לטופס הרשמה
    navigate("/");

    // אם לטופס הרשמה במסך הבית יש id="register" זה יגלול אליו
    setTimeout(() => {
      const el = document.getElementById("register");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.location.hash = "#register";
    }, 50);
  };

  return (
    <Box dir="rtl">
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Typography
          variant="h6"
          align="center"
          fontWeight={700}
          color="success.main"
        >
          המחלקה למדעי המחשב
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          mb={3}
        >
          מידע לסטודנטים – מחלקה למדעי המחשב
        </Typography>

        <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box
            sx={{
              bgcolor: "success.main",
              color: "success.contrastText",
              p: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              התחברות למערכת
            </Typography>
            <Typography variant="body2">
              מידע לסטודנטים – מחלקה למדעי המחשב
            </Typography>
          </Box>

          <Box sx={{ p: 3, bgcolor: "background.paper" }}>
            <TextField
              fullWidth
              margin="normal"
              label="תעודת זהות / אימייל"
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
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={<LoginIcon />}
              sx={{ mt: 2, borderRadius: 999, py: 1.2 }}
              onClick={handleLogin}
            >
              כניסה
            </Button>

            <Box
              sx={{ my: 2.5, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Divider sx={{ flex: 1 }} />
              <Typography variant="body2" color="text.secondary">
                או
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>

            <Button
              fullWidth
              variant="outlined"
              sx={{ borderRadius: 999, py: 1.1 }}
              onClick={handleGuest}
            >
              כניסה ללא הזדהות (אורח בלבד)
            </Button>

            <Box mt={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                עדיין לא נרשמת?
              </Typography>

              {/* במקום href="#" — ניווט תקין */}
              <Button
                variant="text"
                onClick={handleGoToRegister}
                sx={{ mt: 0.5 }}
              >
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
          <Alert
            onClose={() => setOpenSnack(false)}
            severity="success"
            variant="filled"
          >
            התחברת בהצלחה
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default LoginPage;

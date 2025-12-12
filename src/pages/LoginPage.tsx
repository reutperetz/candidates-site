import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box dir="rtl">
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        {/* טקסט עליון כמו בדוגמאות */}
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

        {/* כרטיס ההתחברות */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* פס ירוק עליון */}
          <Box
            sx={{
              bgcolor: "success.main",
              color: "white",
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

          {/* אזור הטופס */}
          <Box sx={{ p: 3, bgcolor: "#f7fbf7" }}>
            <TextField
              fullWidth
              margin="normal"
              label="תעודת זהות / אימייל"
              variant="outlined"
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
              sx={{
                mt: 2,
                borderRadius: 999,
                py: 1.2,
              }}
            >
              כניסה
            </Button>

            {/* מפריד */}
            <Box
              sx={{
                my: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
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
              sx={{
                borderRadius: 999,
                py: 1.1,
              }}
            >
              כניסה ללא הזדהות (אורח בלבד)
            </Button>

            <Box mt={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                עדיין לא נרשמת?
              </Typography>
              <Link href="#" underline="hover">
                הרשמה עכשיו
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;

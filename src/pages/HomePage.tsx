// src/pages/HomePage.tsx
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssessmentIcon from "@mui/icons-material/Assessment";

import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }} dir="rtl">
      {/* כרטיס ברוכים הבאים – הירוק הגדול למעלה */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
          background: "linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)",
          color: "white",
        }}
      >
        <CardContent
          sx={{
            py: 4,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
            }}
          >
            ברוכים הבאים!
          </Typography>
          <Typography variant="body1">
            כאן תוכלו למצוא את כל המידע הדרוש על תהליך הקבלה למחלקה למדעי
            המחשב: הרשמה, תנאי קבלה, קורסים ומידע נוסף שיסייע לכם לקבל החלטה.
          </Typography>
        </CardContent>
      </Card>

      {/* ארבעת הכרטיסים – הודעות / סטטוס הרשמה / קורסים / בדיקת סיכוי קבלה */}
      <Grid container spacing={3} mb={4}>
        {/* הודעות חשובות */}
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
                sx={{ fontSize: 36, color: "#2e7d32", ml: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* סטטוס הרשמה */}
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
                sx={{ fontSize: 36, color: "#2e7d32", ml: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* קורסים שמתאימים עבורך */}
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
                sx={{ fontSize: 36, color: "#2e7d32", ml: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* בדיקת סיכוי קבלה */}
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
                  בדיקת סיכוי קבלה
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  הערכת סיכויי הקבלה על בסיס הנתונים שלך
                </Typography>
              </Box>
              <AssessmentIcon
                sx={{ fontSize: 36, color: "#2e7d32", ml: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* כותרת "מידע מהיר" */}
      <Box mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#2e7d32" }}>
          מידע מהיר
        </Typography>
      </Box>

      {/* כרטיסי מידע מהיר – תואר / שנות לימוד / פסיכומטרי */}
      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                B.Sc
              </Typography>
              <Typography variant="body2" color="text.secondary">
                סוג התואר – תואר ראשון במדעי המחשב
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                3
              </Typography>
              <Typography variant="body2" color="text.secondary">
                שנות לימוד לתואר (בדרך כלל)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                650
              </Typography>
              <Typography variant="body2" color="text.secondary">
                דוגמה לסף פסיכומטרי משוער לקבלה (אפשר להתאים לדרישות המרצה)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ------- טופס הרשמה מרכזי ------- */}
      <Box mb={2} textAlign="center">
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#2e7d32", mb: 1 }}
        >
          טופס הרשמה לתואר במדעי המחשב
        </Typography>
        <Typography variant="body2" color="text.secondary">
          המידע שימולא כאן הוא דוגמה לטופס הרשמה ויזואלי בלבד, בהתאם לתכנון
          הפרויקט.
        </Typography>
      </Box>

      <Card
        sx={{
          maxWidth: 700,
          mx: "auto",
          borderRadius: 3,
          boxShadow: "0 4px 15px rgba(0,0,0,0.10)",
          borderTop: "5px solid #2e7d32",
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              textAlign: "center",
              color: "#2e7d32",
            }}
          >
            טופס הרשמה
          </Typography>

          <Grid container spacing={2}>
            {/* פרטים אישיים */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 0.5 }}
              >
                פרטים אישיים
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="שם מלא"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="תעודת זהות"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="טלפון נייד"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="אימייל"
                variant="outlined"
              />
            </Grid>

            {/* נתונים אקדמיים */}
            <Grid item xs={12} mt={1}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 0.5 }}
              >
                נתונים אקדמיים
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="ציון פסיכומטרי"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="ממוצע בגרות"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="יחידות במתמטיקה"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="יחידות באנגלית"
                variant="outlined"
              />
            </Grid>

            {/* העדפות לימוד */}
            <Grid item xs={12} mt={1}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 0.5 }}
              >
                העדפות לימוד
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="מסלול לימודים מועדף"
                defaultValue=""
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
                defaultValue=""
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
                variant="outlined"
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>

          {/* כפתורים */}
          <Box
            mt={3}
            display="flex"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Button variant="text" color="inherit">
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
              >
                שמירה / שליחה
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default HomePage;


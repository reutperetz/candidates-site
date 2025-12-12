// src/pages/AdminHelpPage.tsx
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Stack,
  Link,
} from "@mui/material";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const AdminHelpPage = () => {
  return (
    <Box dir="rtl" sx={{ bgcolor: "#f5f7f5", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        {/* כותרת עליונה */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" fontWeight={700} color="success.main">
            המחלקה למדעי המחשב
          </Typography>
          <Typography variant="body2" color="text.secondary">
            מערכת ניהול – מדריך מנהל ועזרה
          </Typography>
        </Box>

        {/* קופסת מדריך מנהל */}
        <Paper
          elevation={3}
          sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "#ffffff" }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <HelpOutlineIcon color="action" />
            <Typography variant="h6" fontWeight={600}>
              מדריך מנהל
            </Typography>
            <Chip label="טיפים והנחיות" size="small" color="success" />
          </Stack>

          {/* ניהול קורסים */}
          <Box mb={3}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                ניהול קורסים
              </Typography>
            </Stack>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="כדי להוסיף קורס חדש, לחצי על 'הוספת קורס' ומלאי את פרטי הקורס."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="ניתן לעדכן קוד, שם, נקודות זכות, סוג, שנה וסמסטר לכל קורס."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="למחיקת קורס קיים, השתמשי בכפתור מחיקה בטבלת הקורסים."
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* הגדרת תנאי קבלה */}
          <Box mb={3}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                הגדרת תנאי קבלה
              </Typography>
            </Stack>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="ניתן להגדיר מסלולי קבלה שונים (פסיכומטרי, ממוצע בגרות, מסלול משולב ועוד)."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="לכל מסלול אפשר להגדיר סף פסיכומטרי, סף בגרות, יחידות מתמטיקה ואנגלית."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="מומלץ לעדכן את תנאי הקבלה לפני פתיחת הרשמה חדשה."
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* בדיקת מועמדים */}
          <Box mb={3}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                בדיקת מועמדים
              </Typography>
            </Stack>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="כל מועמד חייב למלא את כל הפרטים הנדרשים בטופס ההרשמה."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="במסך המועמדים ניתן לראות סטטוס הרשמה: ממתין, חסר מסמכים, התקבל ועוד."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="מומלץ לוודא שכל הציונים מוזנים לפני קבלת החלטה סופית."
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* ניהול משתמשי מערכת */}
          <Box mb={3}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                ניהול משתמשי מערכת
              </Typography>
            </Stack>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="משתמשי מערכת יכולים לגשת למסכי הניהול בהתאם להרשאות שהוגדרו."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="חשוב לעדכן תפקידים: מנהל, מזכירות, רכזת קורסים וכו'."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="ניתן לחסום משתמש במקרה של עזיבה או שימוש לא תקין במערכת."
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* התראות והודעות */}
          <Box mb={3}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <InfoOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                התראות והודעות
              </Typography>
            </Stack>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText primary="הודעות מוצגות למועמדים במערכת ההרשמה." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText primary="ניתן להגדיר האם הודעה פעילה או לא פעילה." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText primary="רצוי לעדכן הודעות על מועדים חשובים ושינויים בתנאי הקבלה." />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* טיפים לעבודה נכונה */}
          <Box mb={3}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <InfoOutlinedIcon color="success" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                טיפים לעבודה נכונה
              </Typography>
            </Stack>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText primary="הקפידי להזין נתונים באופן עקבי וללא קיצורים מיותרים." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText primary="מומלץ לבדוק שינויים בנתוני מועמדים לפני אישור סופי." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpOutlineIcon color="action" />
                </ListItemIcon>
                <ListItemText primary="שמרי על שיח מסודר עם המועמדים באמצעות הודעות ותיעוד." />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* תמיכה טכנית */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <SupportAgentIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                תמיכה טכנית
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={1}>
              לשאלות ותקלות טכניות ניתן לפנות לצוות התמיכה:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <SupportAgentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <span>
                      דוא&quot;ל:{" "}
                      <Link href="mailto:support@ono.ac.il">
                        support@ono.ac.il
                      </Link>
                    </span>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SupportAgentIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="שעות פעילות: א'–ה' 08:00–16:00" />
              </ListItem>
            </List>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminHelpPage;


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
  Link,
} from "@mui/material";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

import styles from "./AdminHelpPage.module.css";

const AdminHelpPage = () => {
  return (
    <Box dir="rtl" className={styles.page}>
      <Container maxWidth="md">
        <Box className={styles.header}>
          <Typography variant="h5" fontWeight={700} color="success.main">
            המחלקה למדעי המחשב
          </Typography>
          <Typography variant="body2" color="text.secondary">
            מערכת ניהול – מדריך מנהל ועזרה
          </Typography>
        </Box>

        <Paper elevation={3} className={styles.card}>
          <Box className={styles.sectionHeader}>
            <HelpOutlineIcon color="action" />
            <Typography variant="h6" fontWeight={600}>
              מדריך מנהל
            </Typography>
            <Chip label="טיפים והנחיות" size="small" color="success" />
          </Box>

          <Box className={styles.section}>
            <Box className={styles.sectionHeader}>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                ניהול קורסים
              </Typography>
            </Box>
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

          <Divider className={styles.sectionDivider} />

          <Box className={styles.section}>
            <Box className={styles.sectionHeader}>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                הגדרת תנאי קבלה
              </Typography>
            </Box>
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

          <Divider className={styles.sectionDivider} />

          <Box className={styles.section}>
            <Box className={styles.sectionHeader}>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                בדיקת מועמדים
              </Typography>
            </Box>
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

          <Divider className={styles.sectionDivider} />

          <Box className={styles.section}>
            <Box className={styles.sectionHeader}>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                ניהול משתמשי מערכת
              </Typography>
            </Box>
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

          <Divider className={styles.sectionDivider} />

          <Box className={styles.section}>
            <Box className={styles.sectionHeader}>
              <InfoOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                התראות והודעות
              </Typography>
            </Box>
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

          <Divider className={styles.sectionDivider} />

          <Box className={styles.section}>
            <Box className={styles.sectionHeader}>
              <InfoOutlinedIcon color="success" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                טיפים לעבודה נכונה
              </Typography>
            </Box>
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

          <Divider className={styles.sectionDivider} />

          <Box>
            <Box className={styles.sectionHeader}>
              <SupportAgentIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                תמיכה טכנית
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" className={styles.supportText}>
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
                <ListItemText primary="שעות פעילות: א׳–ה׳ 08:00–16:00" />
              </ListItem>
            </List>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminHelpPage;

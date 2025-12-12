import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Chip,
  TextField,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RuleIcon from "@mui/icons-material/Rule";
import CampaignIcon from "@mui/icons-material/Campaign";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

function FormsPage() {
  const navigate = useNavigate();

  const cardBaseStyle = {
    height: "100%",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  } as const;

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", py: 6 }}>
      <Container maxWidth="lg" dir="rtl">
        {/* כותרת ראשית */}
        <Box textAlign="center" mb={4}>
          <Chip
            label="טפסי הזנת מידע"
            sx={{
              mb: 2,
              bgcolor: "#e8f5e9",
              color: "#2e7d32",
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h4"
            component="h1"
            sx={{ color: "#2e7d32", fontWeight: 700, mb: 1 }}
          >
            Forms – מסכי טפסים
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 900, mx: "auto" }}>
            מסך זה מרכז טפסים לדוגמה להזנת מידע עבור ישויות המערכת בהתאם
            לתכנון הפרויקט: משתמשי מערכת, מועמדים, קורסים, תנאי קבלה, הודעות
            ושאלות נפוצות. המיקוד כאן הוא בתצוגה ויזואלית של הטפסים ולא
            בהתחברות לשרת.
          </Typography>
        </Box>

        {/* אזור 1 – טפסי ניהול משתמשים ומועמדים (ממש טפסים) */}
        <Box
          sx={{
            mb: 4,
            p: 2.5,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, rgba(46,125,50,0.08), rgba(96,125,139,0.08))",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2e7d32" }}>
              טפסי ניהול משתמשים ומועמדים
            </Typography>
            <Typography variant="body2" sx={{ color: "#455a64" }}>
              דוגמאות לטפסים כפי שהוגדרו במסכי הזנת המידע בתכנון הפרויקט.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* טופס משתמש מערכת – עם שדות קלט */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  ...cardBaseStyle,
                  borderTop: "4px solid #2e7d32",
                }}
              >
                <CardContent sx={{ direction: "rtl", textAlign: "right" }}>
                  <Box display="flex" alignItems="center" mb={1.5} gap={1}>
                    <ManageAccountsIcon sx={{ color: "#2e7d32" }} />
                    <Typography variant="h6" fontWeight={600}>
                      טופס משתמש מערכת
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    טופס לדוגמה להזנת משתמש מערכת חדש (למשל: מנהל מערכת, אנשי
                    מזכירות). השדות מייצגים את הישויות שהוגדרו בתכנון.
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="תעודת זהות"
                        placeholder="9 ספרות"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="שם מלא"
                        placeholder="לפחות שתי מילים"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="טלפון" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="אימייל" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="סיסמה"
                        type="password"
                        autoComplete="new-password"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="תפקיד במערכת"
                        placeholder="מנהל מערכת / מזכירות / ..."
                      />
                    </Grid>
                  </Grid>

                  <Box mt={2} textAlign="left">
                    <Button variant="contained" sx={{ bgcolor: "#2e7d32" }}>
                      שמירת משתמש
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* טופס מועמד – עם שדות קלט */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  ...cardBaseStyle,
                  borderTop: "4px solid #388e3c",
                }}
              >
                <CardContent sx={{ direction: "rtl", textAlign: "right" }}>
                  <Box display="flex" alignItems="center" mb={1.5} gap={1}>
                    <PeopleAltIcon sx={{ color: "#388e3c" }} />
                    <Typography variant="h6" fontWeight={600}>
                      טופס מועמד
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    טופס לדוגמה להזנת/עדכון פרטי מועמד לתואר, כולל פרטים אישיים
                    ונתוני קבלה, כפי שהוגדרו במסך הזנת מועמד.
                  </Typography>

                  <Grid container spacing={2}>
                    {/* פרטים אישיים */}
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="תעודת זהות" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="שם מלא" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="טלפון" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="אימייל" />
                    </Grid>

                    {/* נתוני קבלה */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="ציון פסיכומטרי כללי"
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="ממוצע בגרות"
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="יחידות מתמטיקה"
                        placeholder='3 / 4 / 5'
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="ציון מתמטיקה"
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="יחידות אנגלית"
                        placeholder='3 / 4 / 5'
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="ציון אנגלית"
                        type="number"
                      />
                    </Grid>

                    {/* שדות נוספים */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="מסלול מועדף"
                        placeholder="למשל: מדעי המחשב בוקר"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="סטטוס הרשמה"
                        placeholder="חדש / בטיפול / התקבל / נדחה"
                      />
                    </Grid>
                  </Grid>

                  <Box mt={2} textAlign="left">
                    <Button variant="contained" sx={{ bgcolor: "#388e3c" }}>
                      שמירת מועמד
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* אזור 2 – טפסי קורסים ותנאי קבלה (הסבריים) */}
        <Box
          sx={{
            mb: 4,
            p: 2.5,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 700, color: "#2e7d32" }}
          >
            טפסי תוכן אקדמי ותנאי קבלה
          </Typography>

          <Grid container spacing={3}>
            {/* טופס קורס */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  ...cardBaseStyle,
                  borderTop: "4px solid #2e7d32",
                }}
              >
                <CardContent sx={{ direction: "rtl", textAlign: "right" }}>
                  <Box display="flex" alignItems="center" mb={2} gap={1}>
                    <MenuBookIcon sx={{ color: "#2e7d32" }} />
                    <Typography variant="h6" fontWeight={600}>
                      טופס קורס
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    טופס להזנת קורס חדש או עדכון קורס קיים: קוד קורס, שם, נק&quot;ז,
                    סוג (חובה/בחירה), סמסטר, שנה ותיאור קצר.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="קוד ושם קורס"
                        secondary='לדוגמה: 12345 – "מבוא למדעי המחשב".'
                        sx={{ textAlign: "right" }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary='נק"ז, סוג וסמסטר'
                        secondary="הגדרת מיקום הקורס בתואר לצורך תכנון מסלול."
                        sx={{ textAlign: "right" }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* טופס תנאי קבלה */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  ...cardBaseStyle,
                  borderTop: "4px solid #388e3c",
                }}
              >
                <CardContent sx={{ direction: "rtl", textAlign: "right" }}>
                  <Box display="flex" alignItems="center" mb={2} gap={1}>
                    <RuleIcon sx={{ color: "#388e3c" }} />
                    <Typography variant="h6" fontWeight={600}>
                      טופס תנאי קבלה
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    טופס להזנת תנאי קבלה – מסלול פסיכומטרי ישיר ומסלול סכם משולב:
                    ספי פסיכומטרי, סכם, ממוצע בגרות ויחידות מתמטיקה.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="שם התנאי ותיאורו"
                        secondary="לדוגמה: תנאי קבלה ראשי לתואר במדעי המחשב."
                        sx={{ textAlign: "right" }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="ערכי סף"
                        secondary="הגדרת ספים שונים לכל מסלול, כפי שמתואר בתכנון."
                        sx={{ textAlign: "right" }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* אזור 3 – טפסי הודעות ושאלות נפוצות */}
        <Box
          sx={{
            mb: 4,
            p: 2.5,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, rgba(46,125,50,0.04), rgba(96,125,139,0.04))",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 700, color: "#2e7d32" }}
          >
            טפסי הודעות ושאלות נפוצות
          </Typography>

          <Grid container spacing={3}>
            {/* טופס הודעה למועמדים */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  ...cardBaseStyle,
                  borderTop: "4px solid #4caf50",
                }}
              >
                <CardContent sx={{ direction: "rtl", textAlign: "right" }}>
                  <Box display="flex" alignItems="center" mb={2} gap={1}>
                    <CampaignIcon sx={{ color: "#4caf50" }} />
                    <Typography variant="h6" fontWeight={600}>
                      טופס הודעה למועמדים
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    טופס להזנת הודעות שיוצגו במסך הבית/העזרה למועמדים: כותרת,
                    תוכן ההודעה וסטטוס (פעיל/לא פעיל).
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="כותרת ותוכן הודעה"
                        sx={{ textAlign: "right" }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="סטטוס הודעה"
                        secondary="האם ההודעה מוצגת כרגע למועמדים."
                        sx={{ textAlign: "right" }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* טופס שאלה נפוצה */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  ...cardBaseStyle,
                  borderTop: "4px solid #2e7d32",
                }}
              >
                <CardContent sx={{ direction: "rtl", textAlign: "right" }}>
                  <Box display="flex" alignItems="center" mb={2} gap={1}>
                    <HelpCenterIcon sx={{ color: "#2e7d32" }} />
                    <Typography variant="h6" fontWeight={600}>
                      טופס שאלה נפוצה
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    טופס להזנת שאלה/תשובה שיוצגו במסך העזרה למועמדים, עם אפשרות
                    לסיווג לפי נושא.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="שאלה ותשובה"
                        sx={{ textAlign: "right" }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="נושא השאלה"
                        secondary=" הרשמה, תנאי קבלה, מידע על התואר."
                        sx={{ textAlign: "right" }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* אזור 4 – עקרונות עיצוב הטפסים */}
        <Box
          sx={{
            mb: 4,
            p: 2.5,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          
        </Box>

        {/* קישורים מהירים למטה */}
        <Box mt={2}>
          <Divider sx={{ mb: 3 }} />
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: "#2e7d32",
            }}
          >
            קישורים מהירים למסכים עיקריים
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={() => navigate("/")}
              >
                מעבר למסך הבית
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ManageAccountsIcon />}
                onClick={() => navigate("/management")}
              >
                מעבר למסכי ניהול
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<HelpCenterIcon />}
                onClick={() => navigate("/help")}
              >
                מעבר למסך עזרה
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default FormsPage;


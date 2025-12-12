// src/pages/AdminHomePage.tsx
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

const AdminHomePage = () => {
  return (
    <Box dir="rtl">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* כותרת עליונה כמו באתר אונו */}
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
          מערכת ניהול – משתמשים, מועמדים, קורסים ותנאי קבלה
        </Typography>

        {/* מסגרת ראשית של מסך הבית */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#f7fbf7",
            p: 3,
          }}
        >
          {/* באנר ירוק – שלום מנהל/ת */}
          <Box
            sx={{
              bgcolor: "success.main",
              color: "white",
              borderRadius: 3,
              p: 3,
              textAlign: "center",
              mb: 4,
            }}
          >
            <Typography variant="h5" fontWeight={700} gutterBottom>
              שלום מנהל/ת!
            </Typography>
            <Typography variant="body2">
              ברוכים הבאים למערכת הניהול של המחלקה למדעי המחשב
            </Typography>
          </Box>

          {/* כרטיסי סטטיסטיקה – 4 קוביות כמו בוירפריים */}
          <Grid container spacing={2} justifyContent="center">
            {/* הודעות */} 
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  bgcolor: "white",
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Box mb={1}>
                    <NotificationsNoneIcon color="success" />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={0.5}
                  >
                    מספר הודעות פעילות
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    1
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* קורסים פעילים */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  bgcolor: "white",
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Box mb={1}>
                    <MenuBookIcon color="success" />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={0.5}
                  >
                    מספר קורסים פעילים
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    4
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* מועמדים במערכת */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  bgcolor: "white",
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Box mb={1}>
                    <PersonOutlineIcon color="success" />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={0.5}
                  >
                    מספר מועמדים במערכת
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    0
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* משתמשי מערכת */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  bgcolor: "white",
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Box mb={1}>
                    <GroupOutlinedIcon color="success" />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={0.5}
                  >
                    מספר משתמשי מערכת
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    0
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminHomePage;


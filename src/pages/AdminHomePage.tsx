// src/pages/AdminHomePage.tsx
import { Box, Container, Typography, Card, CardContent, Paper } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import { useNavigate } from "react-router-dom";

type QuickCard = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  to: string;
};

const AdminHomePage = () => {
  const navigate = useNavigate();

  const cards: QuickCard[] = [
    {
      title: "ניהול הודעות",
      subtitle: "יצירה, עריכה ומחיקה של הודעות",
      icon: <NotificationsNoneIcon color="success" sx={{ fontSize: 34 }} />,
      to: "/admin/notifications",
    },
    {
      title: "ניהול קורסים",
      subtitle: "רשימת קורסים והוספת קורס חדש",
      icon: <MenuBookIcon color="success" sx={{ fontSize: 34 }} />,
      to: "/admin/courses",
    },
    {
      title: "ניהול מועמדים",
      subtitle: "צפייה ועדכון סטטוס מועמדים",
      icon: <PersonOutlineIcon color="success" sx={{ fontSize: 34 }} />,
      to: "/admin/candidates",
    },
    {
      title: "ניהול מסלולי לימוד",
      subtitle: "הגדרה ותחזוקה של מסלולים (בוקר/ערב וכו')",
      icon: <AltRouteIcon color="success" sx={{ fontSize: 34 }} />,
      to: "/admin/study-tracks",
    },
    {
      title: "משתמשי מערכת",
      subtitle: "ניהול משתמשים (מנהל/מזכירות וכו')",
      icon: <GroupOutlinedIcon color="success" sx={{ fontSize: 34 }} />,
      to: "/admin/users",
    },
  ];

  const handleGo = (to: string) => navigate(to);

  return (
    <Box dir="rtl">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* כותרת עליונה */}
        <Typography variant="h6" align="center" fontWeight={700} color="success.main">
          המחלקה למדעי המחשב
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          מערכת ניהול – משתמשים, מועמדים, קורסים ותנאי קבלה
        </Typography>

        {/* מסגרת ראשית */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "background.paper",
            p: { xs: 2, md: 3 },
          }}
        >
          {/* באנר ירוק */}
          <Box
            sx={{
              bgcolor: "success.main",
              color: "success.contrastText",
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

          {/* ריבועים (ללא מספרים) */}
          <Grid container spacing={2} justifyContent="center">
            {cards.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.to}>
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => handleGo(item.to)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleGo(item.to);
                  }}
                  sx={{
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    cursor: "pointer",
                    boxShadow: 2,
                    transition: "0.2s",
                    outline: "none",
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-2px)",
                    },
                    "&:focus-visible": {
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Box mb={1}>{item.icon}</Box>

                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
                      {item.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {item.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminHomePage;

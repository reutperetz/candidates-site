// src/pages/AdminHomePage.tsx
import { Box, Container, Typography, Card, CardContent, Paper } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import { useNavigate } from "react-router-dom";
import styles from "./AdminHomePage.module.css";

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
      icon: <NotificationsNoneIcon color="success" className={styles.cardIcon} />,
      to: "/admin/notifications",
    },
    {
      title: "ניהול קורסים",
      subtitle: "רשימת קורסים והוספת קורס חדש",
      icon: <MenuBookIcon color="success" className={styles.cardIcon} />,
      to: "/admin/courses",
    },
    {
      title: "ניהול מועמדים",
      subtitle: "צפייה ועדכון סטטוס מועמדים",
      icon: <PersonOutlineIcon color="success" className={styles.cardIcon} />,
      to: "/admin/candidates",
    },
    {
      title: "ניהול מסלולי לימוד",
      subtitle: "הגדרה ותחזוקה של מסלולים (בוקר/ערב וכו')",
      icon: <AltRouteIcon color="success" className={styles.cardIcon} />,
      to: "/admin/study-tracks",
    },
    {
      title: "משתמשי מערכת",
      subtitle: "ניהול משתמשים (מנהל/מזכירות וכו')",
      icon: <GroupOutlinedIcon color="success" className={styles.cardIcon} />,
      to: "/admin/users",
    },
  ];

  const handleGo = (to: string) => navigate(to);

  return (
    <Box dir="rtl">
      <Container maxWidth="lg" className={styles.page}>
        {/* כותרת עליונה */}
        <Typography variant="h6" align="center" className={styles.pageTitle}>
          המחלקה למדעי המחשב
        </Typography>
        <Typography variant="body2" align="center" className={styles.pageSubtitle}>
          מערכת ניהול – משתמשים, מועמדים, קורסים ותנאי קבלה
        </Typography>

        {/* מסגרת ראשית */}
        <Paper
          elevation={3}
          className={styles.panel}
        >
          {/* באנר ירוק */}
          <Box className={styles.banner}>
            <Typography variant="h5" className={styles.bannerTitle} gutterBottom>
              שלום מנהל/ת!
            </Typography>
            <Typography variant="body2" className={styles.bannerSubtitle}>
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
                  className={styles.card}
                >
                  <CardContent className={styles.cardContent}>
                    <Box className={styles.cardIconWrap}>{item.icon}</Box>

                    <Typography variant="subtitle1" className={styles.cardTitle}>
                      {item.title}
                    </Typography>

                    <Typography variant="body2" className={styles.cardSubtitle}>
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

// src/App.tsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Header
import Header from "./components/Header";

// מועמד
import HomePage from "./pages/HomePage";
import FormsPage from "./pages/FormsPage";
import HelpPage from "./pages/HelpPage";
import CoursesPage from "./pages/CoursesPage";
import AdmissionCalculatorPage from "./pages/AdmissionCalculatorPage";
import AdmissionRequirementsPage from "./pages/AdmissionRequirementsPage";
import LoginPage from "./pages/LoginPage";

// אדמין
import AdminHomePage from "./pages/AdminHomePage";
import AdminCandidatesPage from "./pages/AdminCandidatesPage";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import AdminAdmissionRequirementsPage from "./pages/AdminAdmissionRequirementsPage";
import AdminUsersNewPage from "./pages/AdminUsersNewPage";
import AdminNotificationsManagerPage from "./pages/AdminNotificationsManager";
import AdminFaqManagerPage from "./pages/AdminFaqManager";
import AdminHelpPage from "./pages/AdminHelpPage";

// 🔹 טעינה ראשונית ל-Local Storage
import { initLocalStorage } from "./utils/initLocalStorage";

type UserMode = "candidate" | "admin";

type AdminOnlyProps = {
  children: React.ReactNode;
};

function AdminDesktopOnly({ children }: AdminOnlyProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  if (isDesktop) return <>{children}</>;

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 520 }}>
        <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
          מסכי מנהל זמינים בדסקטופ בלבד
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          כדי להשתמש במסכי ניהול, עברי למחשב שולחני או הרחיבי את חלון הדפדפן.
        </Typography>
        <Button variant="contained" onClick={() => window.history.back()}>
          חזרה
        </Button>
      </Box>
    </Box>
  );
}

function App() {
  const [userMode, setUserMode] = useState<UserMode>("candidate");

  // 🚀 רץ פעם אחת בלבד בטעינת האפליקציה
  useEffect(() => {
    initLocalStorage();
  }, []);

  return (
    <Box dir="rtl" sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Header userMode={userMode} onChangeMode={setUserMode} />

      <Box sx={{ p: 2 }}>
        <Routes>
          {/* ===== מועמד ===== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route
            path="/admission-calculator"
            element={<AdmissionCalculatorPage />}
          />
          <Route
            path="/admission-requirements"
            element={<AdmissionRequirementsPage />}
          />
          <Route path="/login" element={<LoginPage />} />

          {/* ===== אדמין ===== */}
          <Route
            path="/admin"
            element={
              <AdminDesktopOnly>
                <AdminHomePage />
              </AdminDesktopOnly>
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <AdminDesktopOnly>
                <AdminCandidatesPage />
              </AdminDesktopOnly>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminDesktopOnly>
                <AdminCoursesPage />
              </AdminDesktopOnly>
            }
          />
          <Route
            path="/admin/admission-requirements"
            element={
              <AdminDesktopOnly>
                <AdminAdmissionRequirementsPage />
              </AdminDesktopOnly>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminDesktopOnly>
                <AdminUsersNewPage />
              </AdminDesktopOnly>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <AdminDesktopOnly>
                <AdminNotificationsManagerPage />
              </AdminDesktopOnly>
            }
          />
          <Route
            path="/admin/faq"
            element={
              <AdminDesktopOnly>
                <AdminFaqManagerPage />
              </AdminDesktopOnly>
            }
          />
          <Route
            path="/admin/help"
            element={
              <AdminDesktopOnly>
                <AdminHelpPage />
              </AdminDesktopOnly>
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;

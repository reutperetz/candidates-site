// src/App.tsx
import { useEffect, useState, type ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, Typography, useMediaQuery } from "@mui/material";
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
  children: ReactNode;
  isDesktop: boolean;
};

const AdminOnly = ({ children, isDesktop }: AdminOnlyProps) =>
  isDesktop ? (
    <>{children}</>
  ) : (
    <Box
      sx={{
        mt: 4,
        mb: 4,
        p: 4,
        borderRadius: 3,
        textAlign: "center",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        אזור הניהול זמין במסך מחשב בלבד
      </Typography>
      <Typography variant="body2" color="text.secondary">
        עבור מסכי מנהל יש לעבור לרוחב מסך Desktop.
      </Typography>
    </Box>
  );

function App() {
  const [userMode, setUserMode] = useState<UserMode>("candidate");
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

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
              <AdminOnly isDesktop={isDesktop}>
                <AdminHomePage />
              </AdminOnly>
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <AdminOnly isDesktop={isDesktop}>
                <AdminCandidatesPage />
              </AdminOnly>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminOnly isDesktop={isDesktop}>
                <AdminCoursesPage />
              </AdminOnly>
            }
          />
          <Route
            path="/admin/courses/:courseId"
            element={
              <AdminOnly isDesktop={isDesktop}>
                <AdminCoursesPage />
              </AdminOnly>
            }
          />
          <Route
            path="/admin/admission-requirements"
            element={
              <AdminOnly isDesktop={isDesktop}>
                <AdminAdmissionRequirementsPage />
              </AdminOnly>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminOnly isDesktop={isDesktop}>
                <AdminUsersNewPage />
              </AdminOnly>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <AdminOnly isDesktop={isDesktop}>
                <AdminNotificationsManagerPage />
              </AdminOnly>
            }
          />
          <Route
            path="/admin/faq"
            element={
              <AdminOnly isDesktop={isDesktop}>
                <AdminFaqManagerPage />
              </AdminOnly>
            }
          />
          <Route
            path="/admin/help"
            element={
              <AdminOnly isDesktop={isDesktop}>
                <AdminHelpPage />
              </AdminOnly>
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;

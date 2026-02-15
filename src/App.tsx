// src/App.tsx
import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, LinearProgress, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import "./styles/layout.css";

// Header
import Header from "./components/Header";

// מועמד
import HomePage from "./pages/HomePage";
import FormsPage from "./pages/FormsPage";
import CoursesPage from "./pages/CoursesPage";
import AdmissionCalculatorPage from "./pages/AdmissionCalculatorPage";
import AdmissionRequirementsPage from "./pages/AdmissionRequirementsPage";
import CandidateProcessStatusPage from "./pages/CandidateProcessStatusPage";
import CandidateStudyTracksPage from "./pages/CandidateStudyTracksPage";
import LoginPage from "./pages/LoginPage";

// אדמין
import AdminHomePage from "./pages/AdminHomePage";
import AdminCandidatesPage from "./pages/AdminCandidatesPage";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import AdminAdmissionRequirementsPage from "./pages/AdminAdmissionRequirementsPage";
import AdminNotificationsManagerPage from "./pages/AdminNotificationsManager";
import AdminFaqManagerPage from "./pages/AdminFaqManager";
import AdminStudyTracksPage from "./pages/AdminStudyTracksPage";

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
      className="admin-only"
      sx={{
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

const HelpPage = lazy(() => import("./pages/HelpPage"));
const AdminHelpPage = lazy(() => import("./pages/AdminHelpPage"));
const AdminUsersNewPage = lazy(() => import("./pages/AdminUsersNewPage"));

function App() {
  const [userMode, setUserMode] = useState<UserMode>("candidate");
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // 🚀 רץ פעם אחת בלבד בטעינת האפליקציה
  useEffect(() => {
    initLocalStorage();
  }, []);

  return (
    <Box
      dir="rtl"
      className="app-shell"
      sx={{ bgcolor: "background.default" }}
    >
      <Header userMode={userMode} onChangeMode={setUserMode} />

      <Box component="main" className="app-content">
        <Suspense
          fallback={
            <Box sx={{ px: 3, py: 2 }}>
              <LinearProgress />
            </Box>
          }
        >
          <Routes>
          {/* ===== מועמד ===== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/process-status" element={<CandidateProcessStatusPage />} />
          <Route path="/study-tracks" element={<CandidateStudyTracksPage />} />
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
            path="/admin/candidates/:candidateId"
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
            path="/admin/study-tracks"
            element={
              <AdminOnly isDesktop={isDesktop}>
                <AdminStudyTracksPage />
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
            path="/admin/admission-requirements/:requirementId"
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
        </Suspense>
      </Box>
    </Box>
  );
}

export default App;

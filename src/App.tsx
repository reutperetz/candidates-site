// src/App.tsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";

// שימי לב: כאן תיקנו ל־components/Header
import Header from "./components/Header";

// עמודי מועמד
import HomePage from "./pages/HomePage";
import FormsPage from "./pages/FormsPage";
import HelpPage from "./pages/HelpPage";
import CoursesPage from "./pages/CoursesPage";
import AdmissionCalculatorPage from "./pages/AdmissionCalculatorPage";
import AdmissionRequirementsPage from "./pages/AdmissionRequirementsPage";
import LoginPage from "./pages/LoginPage";


// עמודי אדמין
import AdminHomePage from "./pages/AdminHomePage";
import AdminCandidatesPage from "./pages/AdminCandidatesPage";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import AdminAdmissionRequirementsPage from "./pages/AdminAdmissionRequirementsPage";
import AdminUsersNewPage from "./pages/AdminUsersNewPage";
import AdminNotificationsManagerPage from "./pages/AdminNotificationsManager";
import AdminFaqManagerPage from "./pages/AdminFaqManager";
import AdminHelpPage from "./pages/AdminHelpPage";

type UserMode = "candidate" | "admin";

function App() {
  const [userMode, setUserMode] = useState<UserMode>("candidate");

  return (
    <Box dir="rtl" sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Header userMode={userMode} onChangeMode={setUserMode} />

      <Box sx={{ p: 2 }}>
        <Routes>
          {/* מועמד */}
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
          
          {/* אדמין */}
          <Route path="/admin" element={<AdminHomePage />} />
          <Route path="/admin/candidates" element={<AdminCandidatesPage />} />
          <Route path="/admin/courses" element={<AdminCoursesPage />} />
          <Route
            path="/admin/admission-requirements"
            element={<AdminAdmissionRequirementsPage />}
          />
          <Route path="/admin/users" element={<AdminUsersNewPage />} />
          <Route
            path="/admin/notifications"
            element={<AdminNotificationsManagerPage />}
          />
          <Route path="/admin/faq" element={<AdminFaqManagerPage />} />
          <Route path="/admin/help" element={<AdminHelpPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;


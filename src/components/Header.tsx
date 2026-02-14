// src/components/Header.tsx
import { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";
import { useThemeMode } from "../theme/themeContext";
import Tooltip from "@mui/material/Tooltip";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

type UserMode = "candidate" | "admin";

const candidateNav = [
  { label: "Home / מסך הבית", path: "/" },
  { label: "Forms / טפסים", path: "/forms" },
  { label: "Study Tracks / מסלולי לימוד", path: "/study-tracks" },
  { label: "Process Status / סטטוס מועמדות", path: "/process-status" },
  { label: "Courses / קורסים", path: "/courses" },
  { label: "Admission Calculator / מחשבון סיכוי קבלה", path: "/admission-calculator" },
  { label: "Admission Requirements / תנאי קבלה", path: "/admission-requirements" },
  { label: "Help / עזרה", path: "/help" },
  { label: "Login / התחברות", path: "/login" },
];

const adminNav = [
  { label: "Admin Home / מסך מנהל", path: "/admin" },
  { label: "System Users / משתמשי מערכת", path: "/admin/users" },
  { label: "Candidates / מועמדים", path: "/admin/candidates" },
  { label: "Study Tracks / מסלולי לימוד", path: "/admin/study-tracks" },
  { label: "Courses / קורסים", path: "/admin/courses" },
  { label: "Admission Requirements / תנאי קבלה", path: "/admin/admission-requirements" },
  { label: "Notifications / הודעות", path: "/admin/notifications" },
  { label: "FAQ / שאלות נפוצות", path: "/admin/faq" },
  { label: "Help / עזרה", path: "/admin/help" },
];

interface HeaderProps {
  userMode: UserMode;
  onChangeMode: (mode: UserMode) => void;
}

function Header({ userMode, onChangeMode }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authUser, setAuthUser] = useState<string | null>(localStorage.getItem("authUser"));

  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode: toggleColorMode } = useThemeMode();

  useEffect(() => {
    const sync = () => setAuthUser(localStorage.getItem("authUser"));
    window.addEventListener("auth-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const navItems = useMemo(() => {
    return userMode === "admin" ? adminNav : candidateNav;
  }, [userMode]);

  const handleOpenDrawer = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const toggleMode = () => {
    const nextMode: UserMode = userMode === "candidate" ? "admin" : "candidate";
    onChangeMode(nextMode);
    navigate(nextMode === "admin" ? "/admin" : "/");
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authRole");
    setAuthUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login");
  };

  return (
    <>
      <AppBar
        position="static"
        sx={(theme) => ({
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
          color: theme.palette.primary.contrastText,
          boxShadow: theme.shadows[4],
        })}
      >
        <Toolbar sx={{ direction: "rtl" }}>
          <IconButton
            edge="start"
            onClick={handleOpenDrawer}
            color="inherit"
            aria-label="menu"
            sx={{ ml: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            onClick={() => handleNavigate(userMode === "admin" ? "/admin" : "/")}
            sx={{
              flexGrow: 1,
              color: "inherit",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.5px",
              userSelect: "none",
              textAlign: "right",
            }}
          >
            Ono Academic College – Candidates Site
          </Typography>

          {/* אינדיקציה שהמשתמש מחובר + התנתקות */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 1 }}>
            {authUser && (
              <>
                <Chip
                  label={`מחובר/ת: ${authUser}`}
                  size="small"
                  sx={(theme) => ({
                    bgcolor: alpha(theme.palette.common.white, 0.18),
                    color: "inherit",
                  })}
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={handleLogout}
                >
                  התנתקות
                </Button>
              </>
            )}
          </Stack>

          {/* כפתור Dark/Light גלובלי */}
          <Tooltip title={mode === "dark" ? "מצב בהיר" : "מצב כהה"}>
            <IconButton onClick={toggleColorMode} color="inherit" sx={{ mr: 1 }}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              variant={userMode === "candidate" ? "contained" : "outlined"}
              color="secondary"
              onClick={() => {
                onChangeMode("candidate");
                navigate("/");
              }}
              size="small"
            >
              מועמד
            </Button>
            <Button
              variant={userMode === "admin" ? "contained" : "outlined"}
              color="secondary"
              onClick={() => {
                onChangeMode("admin");
                navigate("/admin");
              }}
              size="small"
            >
              Admin
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{ sx: { direction: "rtl" } }}
      >
        <Box sx={{ width: 280 }} role="presentation" dir="rtl">
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
              >
                <ListItemText primary={item.label} primaryTypographyProps={{ sx: { textAlign: "right" } }} />
              </ListItemButton>
            ))}
          </List>

          <Box sx={{ p: 2, display: "grid", gap: 1 }}>
            <Button fullWidth variant="outlined" onClick={toggleMode} size="small">
              מעבר ל־{userMode === "candidate" ? "מצב Admin" : "מצב מועמד"}
            </Button>

            {authUser && (
              <Button fullWidth variant="outlined" color="secondary" onClick={handleLogout} size="small">
                התנתקות
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default Header;

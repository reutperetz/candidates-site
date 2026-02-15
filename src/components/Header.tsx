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
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";
import { useThemeMode } from "../theme/themeContext";
import Tooltip from "@mui/material/Tooltip";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import styles from "./Header.module.css";

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
  const [authUser, setAuthUser] = useState<string | null>(
    localStorage.getItem("authUser")
  );

  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode: toggleColorMode } = useThemeMode();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const label = user
        ? user.email ?? (user.isAnonymous ? "אורח" : user.uid)
        : null;
      setAuthUser(label);
      if (label) {
        localStorage.setItem("authUser", label);
      } else {
        localStorage.removeItem("authUser");
        localStorage.removeItem("authRole");
      }
      window.dispatchEvent(new Event("auth-changed"));
    });

    return () => {
      unsub();
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

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("authUser");
    localStorage.removeItem("authRole");
    setAuthUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login");
  };

  return (
    <>
      <AppBar component="header" position="static" className={styles.appBar}>
        <Toolbar component="nav" className={styles.toolbar}>
          <IconButton
            edge="start"
            onClick={handleOpenDrawer}
            color="inherit"
            aria-label="menu"
            className={styles.menuButton}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            onClick={() => handleNavigate(userMode === "admin" ? "/admin" : "/")}
            className={styles.brand}
          >
            Ono Academic College – Candidates Site
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" className={styles.authRow}>
            {authUser && (
              <>
                <Chip
                  label={`מחובר/ת: ${authUser}`}
                  size="small"
                  className={styles.authChip}
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
            {!authUser && (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => handleNavigate("/login")}
              >
                התחברות
              </Button>
            )}
          </Stack>

          <Tooltip title={mode === "dark" ? "מצב בהיר" : "מצב כהה"}>
            <IconButton
              onClick={toggleColorMode}
              color="inherit"
              className={styles.modeButton}
            >
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Stack direction="row" spacing={1} className={styles.modeToggle}>
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
        PaperProps={{ className: styles.drawerPaper }}
      >
        <Box component="nav" className={styles.drawerNav} role="presentation" dir="rtl">
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ className: styles.drawerItemText }}
                />
              </ListItemButton>
            ))}
          </List>

          <Box className={styles.drawerActions}>
            <Button fullWidth variant="outlined" onClick={toggleMode} size="small">
              מעבר ל־{userMode === "candidate" ? "מצב Admin" : "מצב מועמד"}
            </Button>

            {authUser && (
              <Button fullWidth variant="outlined" color="secondary" onClick={handleLogout} size="small">
                התנתקות
              </Button>
            )}
            {!authUser && (
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={() => handleNavigate("/login")}
                size="small"
              >
                התחברות
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default Header;


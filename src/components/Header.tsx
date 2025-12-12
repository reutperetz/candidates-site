// src/Header.tsx
import { useState } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate, useLocation } from "react-router-dom";

type UserMode = "candidate" | "admin";

const candidateNav = [
  { label: "Home / מסך הבית", path: "/" },
  { label: "Forms / טפסים", path: "/forms" },
  { label: "Courses / קורסים", path: "/courses" },
  {
    label: "Admission Calculator / מחשבון סיכוי קבלה",
    path: "/admission-calculator",
  },
  {
    label: "Admission Requirements / תנאי קבלה",
    path: "/admission-requirements",
  },
  { label: "Help / עזרה", path: "/help" },
  { label: "Login / התחברות", path: "/login" },

];

const adminNav = [
  { label: "Admin Home / מסך מנהל", path: "/admin" },
  { label: "System Users / משתמשי מערכת", path: "/admin/users" },
  { label: "Candidates / מועמדים", path: "/admin/candidates" },
  { label: "Courses / קורסים", path: "/admin/courses" },
  {
    label: "Admission Requirements / תנאי קבלה",
    path: "/admin/admission-requirements",
  },
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
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = userMode === "admin" ? adminNav : candidateNav;

  const handleOpenDrawer = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const toggleMode = () => {
    onChangeMode(userMode === "candidate" ? "admin" : "candidate");
    navigate(userMode === "candidate" ? "/admin" : "/");
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(135deg, #33691e 0%, #607d8b 100%)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <Toolbar>
          {/* אייקון ☰ */}
          <IconButton
            edge="start"
            onClick={handleOpenDrawer}
            sx={{ mr: 2 }}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>

          {/* כותרת האתר */}
          <Typography
            variant="h6"
            onClick={() =>
              handleNavigate(userMode === "admin" ? "/admin" : "/")
            }
            sx={{
              flexGrow: 1,
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.5px",
            }}
          >
            Ono Academic College – Candidates Site
          </Typography>

          {/* כפתורי מצב משתמש בדסקטופ */}
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

      {/* Drawer למובייל */}
      <Drawer anchor="left" open={drawerOpen} onClose={handleCloseDrawer}>
        <Box sx={{ width: 260 }} role="presentation">
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={toggleMode}
              size="small"
            >
              מעבר ל־{userMode === "candidate" ? "מצב Admin" : "מצב מועמד"}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default Header;







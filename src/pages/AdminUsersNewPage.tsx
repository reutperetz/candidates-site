// src/pages/AdminUsersNewPage.tsx
import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  TextField,
  Grid,
  MenuItem,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type UserStatus = "active" | "pending" | "blocked";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: UserStatus;
}

// נתוני דמה לרשימת משתמשים
const mockUsers: AdminUser[] = [
  {
    id: "234567890",
    fullName: "מיכל כהן",
    email: "michal@example.com",
    phone: "0501234567",
    role: "מנהל",
    status: "active",
  },
  {
    id: "345678901",
    fullName: "דוד ישראלי",
    email: "david@example.com",
    phone: "0502345678",
    role: "מזכירות",
    status: "pending",
  },
  {
    id: "456789012",
    fullName: "שרה גרינברג",
    email: "sara@example.com",
    phone: "0503456789",
    role: "רכזת קורסים",
    status: "blocked",
  },
];

const statusChip = (status: UserStatus) => {
  switch (status) {
    case "active":
      return <Chip label="פעיל" color="success" size="small" />;
    case "pending":
      return <Chip label="ממתין" color="warning" size="small" />;
    case "blocked":
      return <Chip label="חסום" color="error" size="small" />;
  }
};

const AdminUsersNewPage = () => {
  // 0 = רשימה, 1 = הוספה
  const [tab, setTab] = useState(0);

  const [form, setForm] = useState({
    fullName: "",
    idNumber: "",
    phone: "",
    email: "",
    role: "",
  });
  const [saved, setSaved] = useState(false);

  const handleChangeForm =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
      setSaved(false);
    };

  const handleSave = () => {
    // כאן בעתיד תבוא שמירה אמיתית; כרגע רק הודעת הצלחה
    setSaved(true);
  };

  const handleReset = () => {
    setForm({
      fullName: "",
      idNumber: "",
      phone: "",
      email: "",
      role: "",
    });
    setSaved(false);
  };

  return (
    <Box dir="rtl">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* כותרת עליונה */}
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
          מערכת ניהול – משתמשי מערכת
        </Typography>

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, bgcolor: "#f7fbf7" }}>
          {/* טאב־בר */}
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            centered
            sx={{
              mb: 3,
              "& .MuiTab-root": { fontWeight: 600 },
            }}
          >
            <Tab label="רשימת משתמשים" />
            <Tab label="הוספת משתמש חדש" />
          </Tabs>

          {/* ======================== טאב 1 – רשימת משתמשים ======================== */}
          {tab === 0 && (
            <Box>
              <Box
                mb={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
              >
                <Typography variant="h5" fontWeight={600}>
                  רשימת משתמשים
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: 999, px: 3 }}
                    onClick={() => setTab(1)}
                  >
                    הוספת משתמש חדש
                  </Button>
                  <TextField
                    size="small"
                    placeholder="חיפוש לפי שם, אימייל או תפקיד..."
                  />
                </Stack>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                מספר המשתמשים במערכת: {mockUsers.length}
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "white",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>פעולות</TableCell>
                      <TableCell>סטטוס</TableCell>
                      <TableCell>תפקיד</TableCell>
                      <TableCell>אימייל</TableCell>
                      <TableCell>טלפון</TableCell>
                      <TableCell>שם מלא</TableCell>
                      <TableCell>ת.ז</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<EditIcon fontSize="small" />}
                            >
                              עריכה
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineIcon fontSize="small" />}
                            >
                              מחיקה
                            </Button>
                          </Stack>
                        </TableCell>
                        <TableCell>{statusChip(user.status)}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.id}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {/* ======================== טאב 2 – הוספת משתמש חדש ======================== */}
          {tab === 1 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={2}>
                הוספת משתמש חדש
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
              >
                הזיני את פרטי המשתמש החדש לצורך יצירה במערכת.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="שם מלא"
                    value={form.fullName}
                    onChange={handleChangeForm("fullName")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="תעודת זהות"
                    value={form.idNumber}
                    onChange={handleChangeForm("idNumber")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="טלפון"
                    value={form.phone}
                    onChange={handleChangeForm("phone")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="email"
                    label="אימייל"
                    value={form.email}
                    onChange={handleChangeForm("email")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="תפקיד במערכת"
                    value={form.role}
                    onChange={handleChangeForm("role")}
                  >
                    <MenuItem value="manager">מנהל מערכת</MenuItem>
                    <MenuItem value="secretary">מזכירות</MenuItem>
                    <MenuItem value="courses">רכזת קורסים</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Box
                mt={4}
                display="flex"
                justifyContent="center"
                gap={2}
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  color="success"
                  sx={{ borderRadius: 999, px: 4 }}
                  onClick={handleSave}
                >
                  שמירה
                </Button>
                <Button
                  variant="outlined"
                  sx={{ borderRadius: 999, px: 4 }}
                  onClick={handleReset}
                >
                  ניקוי שדות
                </Button>
              </Box>

              {saved && (
                <Box mt={3}>
                  <Alert severity="success">
                    משתמש חדש נשמר בהצלחה (דמה לצורכי תכנון פרויקט).
                  </Alert>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminUsersNewPage;

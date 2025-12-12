// src/pages/AdminCandidatesPage.tsx
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

type CandidateStatus = "accepted" | "pending" | "rejected";

interface Candidate {
  id: string;
  fullName: string;
  psychometric: number;
  bagrutAverage: number;
  preferredTrack: string;
  status: CandidateStatus;
}

// נתוני דמה לרשימת מועמדים
const mockCandidates: Candidate[] = [
  {
    id: "234567890",
    fullName: "נועה לוי",
    psychometric: 720,
    bagrutAverage: 102,
    preferredTrack: "בוקר",
    status: "accepted",
  },
  {
    id: "345678901",
    fullName: "יואב כהן",
    psychometric: 650,
    bagrutAverage: 95,
    preferredTrack: "ערב",
    status: "pending",
  },
  {
    id: "456789012",
    fullName: "אורית ישראלי",
    psychometric: 710,
    bagrutAverage: 108,
    preferredTrack: "בוקר",
    status: "accepted",
  },
  {
    id: "567890123",
    fullName: "רועי ברק",
    psychometric: 580,
    bagrutAverage: 78,
    preferredTrack: "ערב",
    status: "rejected",
  },
];

const statusChip = (status: CandidateStatus) => {
  switch (status) {
    case "accepted":
      return <Chip label="התקבל" color="success" size="small" />;
    case "pending":
      return <Chip label="בדיקה" color="warning" size="small" />;
    case "rejected":
      return <Chip label="נדחה" color="error" size="small" />;
  }
};

const AdminCandidatesPage = () => {
  // 0 = רשימה, 1 = הוספה
  const [tab, setTab] = useState(0);

  const [form, setForm] = useState({
    fullName: "",
    idNumber: "",
    psychometric: "",
    bagrutAverage: "",
    mathUnits: "",
    englishUnits: "",
    preferredTrack: "",
    status: "",
  });
  const [saved, setSaved] = useState(false);

  const handleChangeForm =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
      setSaved(false);
    };

  const handleSave = () => {
    // בעתיד אפשר להחליף בשמירה אמיתית לשרת
    setSaved(true);
  };

  const handleReset = () => {
    setForm({
      fullName: "",
      idNumber: "",
      psychometric: "",
      bagrutAverage: "",
      mathUnits: "",
      englishUnits: "",
      preferredTrack: "",
      status: "",
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
          מערכת ניהול – מועמדים
        </Typography>

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, bgcolor: "#f7fbf7" }}>
          {/* טאבים: רשימה / הוספה */}
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            centered
            sx={{
              mb: 3,
              "& .MuiTab-root": { fontWeight: 600 },
            }}
          >
            <Tab label="רשימת מועמדים" />
            <Tab label="הוספת מועמד חדש" />
          </Tabs>

          {/* ================= טאב 1 – רשימת מועמדים ================= */}
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
                  רשימת מועמדים
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: 999, px: 3 }}
                    onClick={() => setTab(1)}
                  >
                    הוספת מועמד חדש
                  </Button>
                  <TextField
                    size="small"
                    placeholder="חיפוש לפי שם, ת.ז או סטטוס..."
                  />
                </Stack>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                מספר המועמדים במערכת: {mockCandidates.length}
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
                      <TableCell>מסלול מועדף</TableCell>
                      <TableCell>ממוצע בגרות</TableCell>
                      <TableCell>ציון פסיכומטרי</TableCell>
                      <TableCell>שם מלא</TableCell>
                      <TableCell>ת.ז</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockCandidates.map((c) => (
                      <TableRow key={c.id}>
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
                        <TableCell>{statusChip(c.status)}</TableCell>
                        <TableCell>{c.preferredTrack}</TableCell>
                        <TableCell>{c.bagrutAverage}</TableCell>
                        <TableCell>{c.psychometric}</TableCell>
                        <TableCell>{c.fullName}</TableCell>
                        <TableCell>{c.id}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {/* ================= טאב 2 – הוספת מועמד חדש ================= */}
          {tab === 1 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={2}>
                הוספת מועמד חדש
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                הזיני את פרטי המועמד לצורך הרשמה למערכת.
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
                    label="ציון פסיכומטרי"
                    helperText="טווח דוגמה: 200–800"
                    value={form.psychometric}
                    onChange={handleChangeForm("psychometric")}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ממוצע בגרות"
                    helperText="טווח דוגמה: 60–120"
                    value={form.bagrutAverage}
                    onChange={handleChangeForm("bagrutAverage")}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="יחידות מתמטיקה"
                    value={form.mathUnits}
                    onChange={handleChangeForm("mathUnits")}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="יחידות אנגלית"
                    value={form.englishUnits}
                    onChange={handleChangeForm("englishUnits")}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="מסלול מועדף"
                    value={form.preferredTrack}
                    onChange={handleChangeForm("preferredTrack")}
                  >
                    <MenuItem value="בוקר">בוקר</MenuItem>
                    <MenuItem value="ערב">ערב</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="סטטוס הרשמה"
                    value={form.status}
                    onChange={handleChangeForm("status")}
                  >
                    <MenuItem value="accepted">התקבל</MenuItem>
                    <MenuItem value="pending">בדיקה</MenuItem>
                    <MenuItem value="rejected">נדחה</MenuItem>
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
                    מועמד חדש נשמר בהצלחה (דמה לצורכי תכנון פרויקט).
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

export default AdminCandidatesPage;

// src/pages/AdminCoursesPage.tsx
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

type CourseStatus = "active" | "not-active";

interface Course {
  code: string;
  name: string;
  type: "חובה" | "בחירה";
  year: string;
  semester: string;
  points: number;
  status: CourseStatus;
}

// נתוני דמה לרשימת קורסים – לפי ה־wireframe
const mockCourses: Course[] = [
  {
    code: "CS101",
    name: "מבוא למדעי המחשב",
    type: "חובה",
    year: "א",
    semester: "א",
    points: 3,
    status: "active",
  },
  {
    code: "CS102",
    name: "אלגוריתמים",
    type: "חובה",
    year: "ב",
    semester: "ב",
    points: 3,
    status: "active",
  },
  {
    code: "CS103",
    name: "מבני נתונים",
    type: "חובה",
    year: "ב",
    semester: "א",
    points: 3,
    status: "active",
  },
  {
    code: "CS104",
    name: "מערכות הפעלה",
    type: "בחירה",
    year: "ג",
    semester: "ב",
    points: 3,
    status: "not-active",
  },
];

const statusChip = (status: CourseStatus) => {
  switch (status) {
    case "active":
      return <Chip label="פעיל" color="success" size="small" />;
    case "not-active":
      return <Chip label="לא פעיל" color="default" size="small" />;
  }
};

const AdminCoursesPage = () => {
  // 0 = רשימה, 1 = הוספת קורס
  const [tab, setTab] = useState(0);

  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "",
    year: "",
    semester: "",
    points: "",
    description: "",
    prerequisites: "",
  });
  const [saved, setSaved] = useState(false);

  const handleChangeForm =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
      setSaved(false);
    };

  const handleSave = () => {
    // כאן בעתיד אפשר לעשות POST לשרת – כרגע רק הודעת הצלחה
    setSaved(true);
  };

  const handleReset = () => {
    setForm({
      name: "",
      code: "",
      type: "",
      year: "",
      semester: "",
      points: "",
      description: "",
      prerequisites: "",
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
          מערכת ניהול – קורסים
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
            <Tab label="רשימת קורסים" />
            <Tab label="הוספת קורס חדש" />
          </Tabs>

          {/* ================= טאב 1 – רשימת קורסים ================= */}
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
                  רשימת קורסים
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: 999, px: 3 }}
                    onClick={() => setTab(1)}
                  >
                    הוספת קורס חדש
                  </Button>
                  <TextField
                    size="small"
                    placeholder="חיפוש לפי שם, קוד קורס או שנה..."
                  />
                </Stack>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                מספר הקורסים במערכת: {mockCourses.length}
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
                      <TableCell>נק&quot;ז</TableCell>
                      <TableCell>סמסטר</TableCell>
                      <TableCell>שנה</TableCell>
                      <TableCell>סוג קורס</TableCell>
                      <TableCell>שם קורס</TableCell>
                      <TableCell>קוד קורס</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockCourses.map((c) => (
                      <TableRow key={c.code}>
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
                        <TableCell>{c.points}</TableCell>
                        <TableCell>{c.semester}</TableCell>
                        <TableCell>{c.year}</TableCell>
                        <TableCell>{c.type}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.code}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {/* ================= טאב 2 – הוספת קורס חדש ================= */}
          {tab === 1 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={2}>
                הוספת קורס חדש
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                מלאי את פרטי הקורס החדש לפי הדרישות.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="שם קורס"
                    value={form.name}
                    onChange={handleChangeForm("name")}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="קוד קורס"
                    value={form.code}
                    onChange={handleChangeForm("code")}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="סוג קורס"
                    value={form.type}
                    onChange={handleChangeForm("type")}
                  >
                    <MenuItem value="חובה">חובה</MenuItem>
                    <MenuItem value="בחירה">בחירה</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="שנה"
                    value={form.year}
                    onChange={handleChangeForm("year")}
                  >
                    <MenuItem value="א">א</MenuItem>
                    <MenuItem value="ב">ב</MenuItem>
                    <MenuItem value="ג">ג</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="סמסטר"
                    value={form.semester}
                    onChange={handleChangeForm("semester")}
                  >
                    <MenuItem value="א">א</MenuItem>
                    <MenuItem value="ב">ב</MenuItem>
                    <MenuItem value="קיץ">קיץ</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label='נקודות זכות (נק"ז)'
                    value={form.points}
                    onChange={handleChangeForm("points")}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="תיאור קורס"
                    helperText="תיאור הקורס עד כ–500 תווים (דמה)"
                    value={form.description}
                    onChange={handleChangeForm("description")}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="קורסי קדם (טקסט חופשי)"
                    value={form.prerequisites}
                    onChange={handleChangeForm("prerequisites")}
                  />
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
                    קורס חדש נשמר בהצלחה (דמה לצורכי תכנון פרויקט).
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

export default AdminCoursesPage;

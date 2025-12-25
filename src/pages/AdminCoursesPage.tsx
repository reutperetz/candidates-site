// src/pages/AdminCoursesPage.tsx
import { useMemo, useState } from "react";
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
type CourseType = "חובה" | "בחירה";
type CourseYear = "א" | "ב" | "ג";
type CourseSemester = "א" | "ב" | "קיץ";

interface Course {
  code: string; // למשל CS101
  name: string;
  type: CourseType;
  year: CourseYear;
  semester: CourseSemester;
  points: number; // נק"ז
  status: CourseStatus;
  description?: string;
  prerequisites?: string;
}

// נתוני דמה התחלתיים (עכשיו נשמרים ב-state כדי לערוך/למחוק)
const initialCourses: Course[] = [
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

type FormState = {
  name: string;
  code: string;
  type: "" | CourseType;
  year: "" | CourseYear;
  semester: "" | CourseSemester;
  points: string; // נשמור כמחרוזת בשביל TextField
  status: "" | CourseStatus;
  description: string;
  prerequisites: string;
};

const emptyForm: FormState = {
  name: "",
  code: "",
  type: "",
  year: "",
  semester: "",
  points: "",
  status: "",
  description: "",
  prerequisites: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function isHebrewNameOrText(value: string) {
  // מאפשר עברית/אנגלית/מספרים/גרש/מרכאות/סימנים בסיסיים ורווחים
  return /^[\u0590-\u05FFa-zA-Z0-9"'\-()&,.\s]+$/.test(value.trim());
}

function normalizeCourseCode(code: string) {
  return code.replace(/\s+/g, "").toUpperCase();
}

function validateCourse(form: FormState, courses: Course[], editingCode: string | null): FormErrors {
  const errors: FormErrors = {};

  const name = form.name.trim();
  const code = normalizeCourseCode(form.code);
  const desc = form.description.trim();

  if (!name) errors.name = "חובה להזין שם קורס";
  else if (name.length < 2) errors.name = "שם קורס קצר מדי";
  else if (!isHebrewNameOrText(name)) errors.name = "שם קורס מכיל תווים לא תקינים";

  if (!code) errors.code = "חובה להזין קוד קורס";
  else {
    // דוגמה לקוד: CS101 / CS102 וכו'
    const ok = /^[A-Z]{2}\d{3}$/.test(code);
    if (!ok) errors.code = "קוד חייב להיות בפורמט CS101 (2 אותיות + 3 ספרות)";
    const exists = courses.some((c) => c.code === code);
    if (exists && editingCode !== code) errors.code = "קוד קורס כבר קיים במערכת";
  }

  if (!form.type) errors.type = "חובה לבחור סוג קורס";
  if (!form.year) errors.year = "חובה לבחור שנה";
  if (!form.semester) errors.semester = "חובה לבחור סמסטר";
  if (!form.status) errors.status = "חובה לבחור סטטוס";

  if (form.points.trim() === "") errors.points = 'חובה להזין נק"ז';
  else {
    const p = Number(form.points);
    if (!Number.isFinite(p)) errors.points = 'נק"ז חייב להיות מספר';
    else if (!Number.isInteger(p)) errors.points = 'נק"ז חייב להיות מספר שלם';
    else if (p < 1 || p > 10) errors.points = 'נק"ז חייב להיות בין 1 ל-10';
  }

  if (desc.length > 500) errors.description = "תיאור יכול להיות עד 500 תווים";

  return errors;
}

const AdminCoursesPage = () => {
  // 0 = רשימה, 1 = הוספה/עריכה
  const [tab, setTab] = useState(0);

  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [query, setQuery] = useState("");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [savedMsg, setSavedMsg] = useState<string>("");
  const [editingCode, setEditingCode] = useState<string | null>(null); // אם לא null => עריכה

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;

    return courses.filter((c) => {
      const hay = `${c.code} ${c.name} ${c.type} ${c.year} ${c.semester} ${c.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [courses, query]);

  const handleChangeForm =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSavedMsg("");

      // נרצה לקוד להפוך ל-Uppercase בזמן אמת
      if (field === "code") {
        setForm((prev) => ({ ...prev, code: normalizeCourseCode(value) }));
        setErrors((prev) => ({ ...prev, code: undefined }));
        return;
      }

      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
    setSavedMsg("");
    setEditingCode(null);
  };

  const startCreate = () => {
    resetForm();
    setTab(1);
  };

  const startEdit = (course: Course) => {
    setEditingCode(course.code);
    setForm({
      name: course.name,
      code: course.code,
      type: course.type,
      year: course.year,
      semester: course.semester,
      points: String(course.points),
      status: course.status,
      description: course.description ?? "",
      prerequisites: course.prerequisites ?? "",
    });
    setErrors({});
    setSavedMsg("");
    setTab(1);
  };

  const handleDelete = (code: string) => {
    const c = courses.find((x) => x.code === code);
    if (!c) return;

    const ok = window.confirm(`למחוק את הקורס "${c.name}" (${c.code})?`);
    if (!ok) return;

    setCourses((prev) => prev.filter((x) => x.code !== code));

    // אם מחקנו קורס שהיה בעריכה – ננקה טופס
    if (editingCode === code) resetForm();
  };

  const handleSave = () => {
    const nextErrors = validateCourse(form, courses, editingCode);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSavedMsg("");
      return;
    }

    const payload: Course = {
      code: normalizeCourseCode(form.code),
      name: form.name.trim(),
      type: form.type as CourseType,
      year: form.year as CourseYear,
      semester: form.semester as CourseSemester,
      points: Number(form.points),
      status: form.status as CourseStatus,
      description: form.description.trim() || undefined,
      prerequisites: form.prerequisites.trim() || undefined,
    };

    setCourses((prev) => {
      // עריכה
      if (editingCode) {
        return prev.map((c) => (c.code === editingCode ? payload : c));
      }
      // יצירה
      return [payload, ...prev];
    });
    
    setSavedMsg(editingCode ? "הקורס עודכן בהצלחה." : "קורס חדש נשמר בהצלחה.");
    // נשארים בטאב כדי שתראי הודעה, אבל אפשר גם לעבור לרשימה:
    // setTab(0);
    setEditingCode(payload.code);
  };

  return (
    <Box dir="rtl">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" align="center" fontWeight={700} color="success.main">
          המחלקה למדעי המחשב
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          מערכת ניהול – קורסים
        </Typography>

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, bgcolor: "#f7fbf7" }}>
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            centered
            sx={{ mb: 3, "& .MuiTab-root": { fontWeight: 600 } }}
          >
            <Tab label="רשימת קורסים" />
            <Tab label={editingCode ? "עריכת קורס" : "הוספת קורס חדש"} />
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
                    onClick={startCreate}
                  >
                    הוספת קורס חדש
                  </Button>
                  <TextField
                    size="small"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="חיפוש לפי שם / קוד / שנה / סמסטר..."
                  />
                </Stack>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                מספר הקורסים במערכת: {filteredCourses.length}
              </Typography>

              <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "white" }}>
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
                    {filteredCourses.map((c) => (
                      <TableRow key={c.code} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<EditIcon fontSize="small" />}
                              onClick={() => startEdit(c)}
                            >
                              עריכה
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineIcon fontSize="small" />}
                              onClick={() => handleDelete(c.code)}
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

                    {filteredCourses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                          אין תוצאות לחיפוש.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {/* ================= טאב 2 – הוספה/עריכת קורס ================= */}
          {tab === 1 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={1}>
                {editingCode ? `עריכת קורס (${editingCode})` : "הוספת קורס חדש"}
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                מלאי את פרטי הקורס. השמירה תתבצע רק אם כל הנתונים תקינים.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="שם קורס"
                    value={form.name}
                    onChange={handleChangeForm("name")}
                    error={!!errors.name}
                    helperText={errors.name ?? "לדוגמה: מבוא למדעי המחשב"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="קוד קורס"
                    value={form.code}
                    onChange={handleChangeForm("code")}
                    error={!!errors.code}
                    helperText={errors.code ?? "פורמט חובה: CS101 (2 אותיות + 3 ספרות)"}
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="סוג קורס"
                    value={form.type}
                    onChange={handleChangeForm("type")}
                    error={!!errors.type}
                    helperText={errors.type ?? "חובה / בחירה"}
                  >
                    <MenuItem value="חובה">חובה</MenuItem>
                    <MenuItem value="בחירה">בחירה</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="שנה"
                    value={form.year}
                    onChange={handleChangeForm("year")}
                    error={!!errors.year}
                    helperText={errors.year ?? "בחרי שנה: א / ב / ג"}
                  >
                    <MenuItem value="א">א</MenuItem>
                    <MenuItem value="ב">ב</MenuItem>
                    <MenuItem value="ג">ג</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="סמסטר"
                    value={form.semester}
                    onChange={handleChangeForm("semester")}
                    error={!!errors.semester}
                    helperText={errors.semester ?? "בחרי סמסטר: א / ב / קיץ"}
                  >
                    <MenuItem value="א">א</MenuItem>
                    <MenuItem value="ב">ב</MenuItem>
                    <MenuItem value="קיץ">קיץ</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label='נקודות זכות (נק"ז)'
                    value={form.points}
                    onChange={handleChangeForm("points")}
                    error={!!errors.points}
                    helperText={errors.points ?? 'מספר שלם בין 1 ל-10'}
                    inputProps={{ min: 1, max: 10, step: 1 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="סטטוס"
                    value={form.status}
                    onChange={handleChangeForm("status")}
                    error={!!errors.status}
                    helperText={errors.status ?? "פעיל / לא פעיל"}
                  >
                    <MenuItem value="active">פעיל</MenuItem>
                    <MenuItem value="not-active">לא פעיל</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="תיאור קורס"
                    value={form.description}
                    onChange={handleChangeForm("description")}
                    error={!!errors.description}
                    helperText={errors.description ?? "עד 500 תווים (אופציונלי)"}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="קורסי קדם"
                    value={form.prerequisites}
                    onChange={handleChangeForm("prerequisites")}
                    helperText="אופציונלי. לדוגמה: CS101, מתמטיקה בדידה"
                  />
                </Grid>
              </Grid>

              <Box mt={4} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
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
                  onClick={resetForm}
                >
                  ניקוי שדות
                </Button>

                <Button
                  variant="text"
                  sx={{ borderRadius: 999, px: 2 }}
                  onClick={() => setTab(0)}
                >
                  חזרה לרשימה
                </Button>
              </Box>

              {!!savedMsg && (
                <Box mt={3}>
                  <Alert severity="success">{savedMsg}</Alert>
                </Box>
              )}

              {Object.keys(errors).length > 0 && (
                <Box mt={2}>
                  <Alert severity="error">
                    יש שדות לא תקינים. תקני את ההודעות האדומות ואז שמרי שוב.
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

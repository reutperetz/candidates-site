// src/pages/AdminCoursesPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  MenuItem,
  Alert,
  LinearProgress,
} from "@mui/material";

import Grid from "@mui/material/GridLegacy";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

type CourseStatus = "active" | "not-active";
type CourseType = "חובה" | "בחירה";
type CourseYear = "א" | "ב" | "ג";
type CourseSemester = "א" | "ב" | "קיץ";

interface Course {
  docId: string;
  code: string; // למשל CS101
  name: string;
  type: CourseType;
  year: CourseYear;
  semester: CourseSemester;
  points: number; // נק"ז
  status: CourseStatus;
  description?: string;
  prerequisites?: string;
  createdAt?: Timestamp;
}

type CourseDoc = Omit<Course, "docId">;

// נתוני דמה התחלתיים (עכשיו נשמרים ב-state כדי לערוך/למחוק)

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

function validateCourse(form: FormState, courses: Course[], editingDocId: string | null, editingCode: string | null): FormErrors {
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
    const exists = courses.some((c) => c.code === code && c.docId !== editingDocId);
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
  const { courseId } = useParams();
  const navigate = useNavigate();
  // 0 = רשימה, 1 = הוספה/עריכה
  const [tab, setTab] = useState(0);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [savedMsg, setSavedMsg] = useState<string>("");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const didSeedRef = useRef(false);
  const lastHandledIdRef = useRef<string | null>(null);
  const courseIdRef = useRef<string | undefined>(undefined);
  const [missingCourseId, setMissingCourseId] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<string | null>(null); // אם לא null => עריכה

  useEffect(() => {
    courseIdRef.current = courseId;
  }, [courseId]);

  const seedCourses = async () => {
    const seedItems = [
      {
        code: "CS101",
        name: "\u05de\u05d1\u05d5\u05d0 \u05dc\u05de\u05d3\u05e2\u05d9 \u05d4\u05de\u05d7\u05e9\u05d1",
        type: "\u05d7\u05d5\u05d1\u05d4",
        year: "\u05d0",
        semester: "\u05d0",
        points: 3,
        status: "active",
      },
      {
        code: "CS102",
        name: "\u05d0\u05dc\u05d2\u05d5\u05e8\u05d9\u05ea\u05de\u05d9\u05dd",
        type: "\u05d7\u05d5\u05d1\u05d4",
        year: "\u05d1",
        semester: "\u05d1",
        points: 3,
        status: "active",
      },
      {
        code: "CS103",
        name: "\u05de\u05d1\u05e0\u05d9 \u05e0\u05ea\u05d5\u05e0\u05d9\u05dd",
        type: "\u05d7\u05d5\u05d1\u05d4",
        year: "\u05d1",
        semester: "\u05d0",
        points: 3,
        status: "active",
      },
      {
        code: "CS104",
        name: "\u05de\u05e2\u05e8\u05db\u05d5\u05ea \u05d4\u05e4\u05e2\u05dc\u05d4",
        type: "\u05d1\u05d7\u05d9\u05e8\u05d4",
        year: "\u05d2",
        semester: "\u05d1",
        points: 3,
        status: "not-active",
      },
    ];

    try {
      await Promise.all(
        seedItems.map((item) =>
          addDoc(collection(db, "courses"), { ...item, createdAt: serverTimestamp() })
        )
      );
    } catch (err) {
      console.error("Failed to seed courses", err);
    }
  };


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
      setSaveError("");

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
    setSaveError("");
    setEditingDocId(null);
    setEditingCode(null);
  };

  const startCreate = () => {
    if (courseId) {
      navigate("/admin/courses");
    }
    resetForm();
    setTab(1);
  };

  const startEdit = (course: Course) => {
    setEditingDocId(course.docId);
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

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "courses"),
      (snap) => {
        const items: Course[] = snap.docs.map((d) => {
          const data = d.data() as Partial<CourseDoc>;
          return {
            docId: d.id,
            code: String(data.code ?? ""),
            name: String(data.name ?? ""),
            type: data.type ?? "\u05d7\u05d5\u05d1\u05d4",
            year: data.year ?? "\u05d0",
            semester: data.semester ?? "\u05d0",
            points: Number(data.points ?? 0),
            status: data.status ?? "active",
            description: data.description ?? undefined,
            prerequisites: data.prerequisites ?? undefined,
            createdAt: data.createdAt,
          };
        });
        items.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));

        if (items.length === 0 && !didSeedRef.current) {
          didSeedRef.current = true;
          seedCourses();
        }

        const currentId = courseIdRef.current;
        if (!currentId) {
          lastHandledIdRef.current = null;
          setMissingCourseId(null);
        } else if (lastHandledIdRef.current !== currentId) {
          const match = items.find((course) => course.docId === currentId);
          if (match) {
            setMissingCourseId(null);
            startEdit(match);
          } else {
            setMissingCourseId(currentId);
          }
          lastHandledIdRef.current = currentId;
        }

        setCourses(items);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleDelete = async (course: Course) => {
    const ok = window.confirm(`\u05dc\u05de\u05d7\u05d5\u05e7 \u05d0\u05ea \u05d4\u05e7\u05d5\u05e8\u05e1 "${course.name}" (${course.code})?`);
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "courses", course.docId));
      if (editingDocId === course.docId) resetForm();
    } catch (err) {
      console.error("Failed to delete course", err);
      setSaveError("\u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05de\u05d7\u05d9\u05e7\u05d4. \u05e0\u05e1\u05d9 \u05e9\u05d5\u05d1.");
    }
  };

  const handleSave = async () => {
    const nextErrors = validateCourse(form, courses, editingDocId, editingCode);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSavedMsg("");
      setSaveError("");
      return;
    }
    setSaveError("");

    const payload = {
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

    try {
      if (editingDocId) {
        await updateDoc(doc(db, "courses", editingDocId), payload);
        setSavedMsg("\u05d4\u05e7\u05d5\u05e8\u05e1 \u05e2\u05d5\u05d3\u05db\u05df \u05d1\u05d4\u05e6\u05dc\u05d7\u05d4.");
      } else {
        const ref = await addDoc(collection(db, "courses"), { ...payload, createdAt: serverTimestamp() });
        setEditingDocId(ref.id);
        setSavedMsg("\u05e7\u05d5\u05e8\u05e1 \u05d7\u05d3\u05e9 \u05e0\u05e9\u05de\u05e8 \u05d1\u05d4\u05e6\u05dc\u05d7\u05d4.");
      }
      setEditingCode(payload.code);
    } catch (err) {
      console.error("Failed to save course", err);
      setSavedMsg("");
      setSaveError("\u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05e9\u05de\u05d9\u05e8\u05d4. \u05e0\u05e1\u05d9 \u05e9\u05d5\u05d1.");
    }
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

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, bgcolor: "background.paper" }}>
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            centered
            sx={{ mb: 3, "& .MuiTab-root": { fontWeight: 600 } }}
          >
            <Tab label="רשימת קורסים" />
            <Tab label={editingCode ? "עריכת קורס" : "הוספת קורס חדש"} />
          </Tabs>

          {isLoading && <LinearProgress sx={{ mb: 2 }} />}
          {!!missingCourseId && (
            <Alert severity="error" sx={{ mb: 2 }}>
              קורס עם המזהה "{missingCourseId}" לא נמצא במערכת.
            </Alert>
          )}

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

              <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "background.paper" }}>
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
                      <TableRow key={c.docId} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<EditIcon fontSize="small" />}
                              onClick={() => {
                                startEdit(c);
                                navigate(`/admin/courses/${c.docId}`);
                              }}
                            >
                              עריכה
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineIcon fontSize="small" />}
                              onClick={() => handleDelete(c)}
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
                  onClick={() => {
                    setTab(0);
                    navigate("/admin/courses");
                  }}
                >
                  חזרה לרשימה
                </Button>
              </Box>

              {!!savedMsg && (
                <Box mt={3}>
                  <Alert severity="success">{savedMsg}</Alert>
                </Box>
              )}
              {saveError && (
                <Box mt={2}>
                  <Alert severity="error">{saveError}</Alert>
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

// src/pages/CoursesPage.tsx
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import styles from "./CoursesPage.module.css";

type Course = {
  docId: string;
  code: string;
  name: string;
  year: string;
  semester: string;
  type: "חובה" | "בחירה";
  credits: number;
  prerequisites: string;
  status?: string;
};

type CourseDoc = Omit<Course, "docId" | "credits"> & {
  credits?: number;
  points?: number;
};





function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "courses"));
        const items: Course[] = snap.docs.map((d) => {
          const data = d.data() as Partial<CourseDoc>;
          return {
            docId: d.id,
            code: String(data.code ?? ""),
            name: String(data.name ?? ""),
            year: String(data.year ?? ""),
            semester: String(data.semester ?? ""),
            type: data.type ?? "\u05d7\u05d5\u05d1\u05d4",
            credits: Number(data.points ?? data.credits ?? 0),
            prerequisites: String(data.prerequisites ?? "-"),
            status: data.status ?? "active",
          };
        });
        if (active) setCourses(items);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<"הכל" | "א" | "ב">(
    "הכל"
  );
  const [typeFilter, setTypeFilter] = useState<"הכל" | "חובה" | "בחירה">(
    "הכל"
  );

  const activeCourses = courses.filter((course) => course.status !== "not-active");

  const filteredCourses = activeCourses.filter((course) => {
    const matchesSearch =
      course.name.includes(search) ||
      course.code.includes(search) ||
      course.year.includes(search);

    const matchesSemester =
      semesterFilter === "הכל"
        ? true
        : semesterFilter === "א"
        ? course.semester.includes("א")
        : course.semester.includes("ב");

    const matchesType =
      typeFilter === "הכל" ? true : course.type === typeFilter;

    return matchesSearch && matchesSemester && matchesType;
  });

  return (
    <Container maxWidth="lg" className={styles.page} dir="rtl">
      {/* כותרת עליונה */}
      <Box className={styles.header}>
        <Typography
          variant="h4"
          component="h1"
          className={styles.title}
        >
          קורסים – רשימת הקורסים בתואר
        </Typography>
        <Typography variant="body1" className={styles.subtitle}>
          מסך זה מציג רשימה מרוכזת של כל קורסי מדעי המחשב, כולל שנה, סמסטר,
          נק״ז וסוג (חובה/בחירה). ניתן לבצע חיפוש וסינון לפי סמסטר וסוג קורס.
        </Typography>
      </Box>

      {/* כרטיס ראשי של טבלת הקורסים */}
      <Card className={styles.card}>
        <CardContent>
          {isLoading && <LinearProgress className={styles.loadingBar} />}
          {/* כותרת + פילטרים */}
          <Box className={styles.filtersRow}
          >
            <Box className={styles.headingRow}>
              <MenuBookIcon className={styles.headingIcon} />
              <Typography variant="h6" className={styles.headingTitle}>
                רשימת הקורסים במחלקה למדעי המחשב
              </Typography>
              <Chip
                label={`${filteredCourses.length} מתוך ${activeCourses.length} קורסים`}
                size="small"
                className={styles.countChip}
              />
            </Box>

            <Box className={styles.filters}>
              <TextField
                size="small"
                label="חיפוש"
                placeholder="חיפוש לפי שם קורס / קוד קורס"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <FormControl size="small" className={styles.filterControl}>
                <InputLabel id="semester-label">סמסטר</InputLabel>
                <Select
                  labelId="semester-label"
                  label="סמסטר"
                  value={semesterFilter}
                  onChange={(e) =>
                    setSemesterFilter(e.target.value as "הכל" | "א" | "ב")
                  }
                >
                  <MenuItem value="הכל">כל הסמסטרים</MenuItem>
                  <MenuItem value="א">סמסטר א׳</MenuItem>
                  <MenuItem value="ב">סמסטר ב׳</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" className={styles.filterControl}>
                <InputLabel id="type-label">סוג קורס</InputLabel>
                <Select
                  labelId="type-label"
                  label="סוג קורס"
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(
                      e.target.value as "הכל" | "חובה" | "בחירה"
                    )
                  }
                >
                  <MenuItem value="הכל">כל הקורסים</MenuItem>
                  <MenuItem value="חובה">קורסי חובה</MenuItem>
                  <MenuItem value="בחירה">קורסי בחירה</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* טבלה */}
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="right">קוד קורס</TableCell>
                  <TableCell align="right">שם קורס</TableCell>
                  <TableCell align="right">נק״ז</TableCell>
                  <TableCell align="right">סוג</TableCell>
                  <TableCell align="right">שנה</TableCell>
                  <TableCell align="right">סמסטר</TableCell>
                  <TableCell align="right">קורסי קדם</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.docId} hover>
                    <TableCell align="right">{course.code}</TableCell>
                    <TableCell align="right">{course.name}</TableCell>
                    <TableCell align="right">{course.credits}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={course.type}
                        size="small"
                        className={course.type === "חובה" ? styles.typeChipRequired : styles.typeChipElective}
                      />
                    </TableCell>
                    <TableCell align="right">{course.year}</TableCell>
                    <TableCell align="right">{course.semester}</TableCell>
                    <TableCell align="right">{course.prerequisites}</TableCell>
                  </TableRow>
                ))}

                {!isLoading && filteredCourses.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      className={styles.emptyCell}
                    >
                      לא נמצאו קורסים התואמים לסינון הנוכחי.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}

export default CoursesPage;



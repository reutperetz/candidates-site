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
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";

type Course = {
  code: string;
  name: string;
  year: string;
  semester: string;
  type: "חובה" | "בחירה";
  credits: number;
  prerequisites: string;
};

const COURSES: Course[] = [
  {
    code: "CS101",
    name: "מבוא למדעי המחשב",
    year: "שנה א׳",
    semester: "סמסטר א׳",
    type: "חובה",
    credits: 4,
    prerequisites: "-",
  },
  {
    code: "CS102",
    name: "תכנות מונחה עצמים",
    year: "שנה א׳",
    semester: "סמסטר ב׳",
    type: "חובה",
    credits: 4,
    prerequisites: "CS101",
  },
  {
    code: "MATH101",
    name: "אינטגרלים ודיפרנציאלים 1",
    year: "שנה א׳",
    semester: "סמסטר א׳",
    type: "חובה",
    credits: 5,
    prerequisites: "-",
  },
  {
    code: "CS201",
    name: "מבני נתונים",
    year: "שנה ב׳",
    semester: "סמסטר א׳",
    type: "חובה",
    credits: 4,
    prerequisites: "CS102",
  },
  {
    code: "CS202",
    name: "אלגוריתמים",
    year: "שנה ב׳",
    semester: "סמסטר ב׳",
    type: "חובה",
    credits: 4,
    prerequisites: "CS201",
  },
  {
    code: "CS230",
    name: "פיתוח אפליקציות ווב",
    year: "שנה ב׳",
    semester: "סמסטר ב׳",
    type: "בחירה",
    credits: 3,
    prerequisites: "CS102",
  },
  {
    code: "CS301",
    name: "פרויקט גמר במדעי המחשב",
    year: "שנה ג׳",
    semester: "סמסטר ב׳",
    type: "חובה",
    credits: 4,
    prerequisites: "סיום רוב קורסי החובה",
  },
  {
    code: "CS310",
    name: "סדנת נושאים מתקדמים ב-AI",
    year: "שנה ג׳",
    semester: "סמסטר א׳",
    type: "בחירה",
    credits: 3,
    prerequisites: "CS202",
  },
];

import { useState } from "react";

function CoursesPage() {
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<"הכל" | "א" | "ב">(
    "הכל"
  );
  const [typeFilter, setTypeFilter] = useState<"הכל" | "חובה" | "בחירה">(
    "הכל"
  );

  const filteredCourses = COURSES.filter((course) => {
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
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }} dir="rtl">
      {/* כותרת עליונה */}
      <Box textAlign="center" mb={4}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: "#2e7d32", fontWeight: 700, mb: 1 }}
        >
          קורסים – רשימת הקורסים בתואר
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 900, mx: "auto" }}>
          מסך זה מציג רשימה מרוכזת של כל קורסי מדעי המחשב, כולל שנה, סמסטר,
          נק״ז וסוג (חובה/בחירה). ניתן לבצע חיפוש וסינון לפי סמסטר וסוג קורס.
        </Typography>
      </Box>

      {/* כרטיס ראשי של טבלת הקורסים */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderTop: "4px solid #2e7d32",
        }}
      >
        <CardContent>
          {/* כותרת + פילטרים */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
            mb={3}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <MenuBookIcon sx={{ color: "#2e7d32" }} />
              <Typography variant="h6" fontWeight={600}>
                רשימת הקורסים במחלקה למדעי המחשב
              </Typography>
              <Chip
                label={`${filteredCourses.length} מתוך ${COURSES.length} קורסים`}
                size="small"
                sx={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}
              />
            </Box>

            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              alignItems="center"
              justifyContent="flex-end"
            >
              <TextField
                size="small"
                label="חיפוש"
                placeholder="חיפוש לפי שם קורס / קוד קורס"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <FormControl size="small" sx={{ minWidth: 130 }}>
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

              <FormControl size="small" sx={{ minWidth: 130 }}>
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
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
                  <TableRow key={course.code} hover>
                    <TableCell align="right">{course.code}</TableCell>
                    <TableCell align="right">{course.name}</TableCell>
                    <TableCell align="right">{course.credits}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={course.type}
                        size="small"
                        sx={{
                          backgroundColor:
                            course.type === "חובה" ? "#e8f5e9" : "#e3f2fd",
                          color:
                            course.type === "חובה" ? "#2e7d32" : "#1565c0",
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">{course.year}</TableCell>
                    <TableCell align="right">{course.semester}</TableCell>
                    <TableCell align="right">{course.prerequisites}</TableCell>
                  </TableRow>
                ))}

                {filteredCourses.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 4, color: "text.secondary" }}
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

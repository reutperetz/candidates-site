import { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

type StudyMode = "firstDegree" | "preAcademic";

interface FormValues {
  psychometricQuant: string;
  psychometricVerbal: string;
  bagrutAverage: string;
  mathUnits: string;
  englishUnits: string;
}

const initialValues: FormValues = {
  psychometricQuant: "",
  psychometricVerbal: "",
  bagrutAverage: "",
  mathUnits: "",
  englishUnits: "",
};

const AdmissionCalculatorPage = () => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [studyMode, setStudyMode] = useState<StudyMode>("firstDegree");
  const [result, setResult] = useState<string>("");

  const handleChange =
    (field: keyof FormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: StudyMode | null
  ) => {
    if (newMode !== null) {
      setStudyMode(newMode);
    }
  };

  const handleCalculate = () => {
    const q = Number(values.psychometricQuant) || 0;
    const v = Number(values.psychometricVerbal) || 0;
    const b = Number(values.bagrutAverage) || 0;

    // נוסחה פשוטה לדוגמה – אפשר לשנות לפי דרישות המרצה
    const score = q * 0.4 + v * 0.2 + b * 0.4;

    let level: string;

    if (score >= 700) {
      level = "סיכויי קבלה גבוהים מאוד";
    } else if (score >= 600) {
      level = "סיכויי קבלה טובים";
    } else if (score >= 500) {
      level = "סיכויי קבלה בינוניים";
    } else {
      level = "סיכויי קבלה נמוכים – מומלץ לבדוק מסלולים נוספים";
    }

    const modeText =
      studyMode === "firstDegree" ? "מצב תואר ראשון" : "מצב לימודי הכנה";

    setResult(
      `הציון המחושב שלך הוא ${score.toFixed(
        0
      )}. לפי מצב "${modeText}" – ${level}.`
    );
  };

  const handleReset = () => {
    setValues(initialValues);
    setResult("");
  };

  return (
    <Box dir="rtl">
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          {/* כותרת עליונה */}
          <Typography variant="h5" align="center" fontWeight={600} gutterBottom>
            מחשבון סיכוי קבלה
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            mb={4}
          >
            בדקו את סיכויי הקבלה שלכם למחלקה למדעי המחשב על פי נתוני הבגרות
            והפסיכומטרי.
          </Typography>

          {/* טופס השדות */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ציון פסיכומטרי כמותי"
                variant="outlined"
                value={values.psychometricQuant}
                onChange={handleChange("psychometricQuant")}
                placeholder="50-150"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ציון פסיכומטרי מילולי"
                variant="outlined"
                value={values.psychometricVerbal}
                onChange={handleChange("psychometricVerbal")}
                placeholder="50-150"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ממוצע בגרות"
                variant="outlined"
                value={values.bagrutAverage}
                onChange={handleChange("bagrutAverage")}
                placeholder="55-120"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="יחידות מתמטיקה"
                variant="outlined"
                value={values.mathUnits}
                onChange={handleChange("mathUnits")}
                displayEmpty
              >
                <MenuItem value="">
                  <em>בחרי יחידות</em>
                </MenuItem>
                <MenuItem value="3">3 יחידות</MenuItem>
                <MenuItem value="4">4 יחידות</MenuItem>
                <MenuItem value="5">5 יחידות</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="יחידות אנגלית"
                variant="outlined"
                value={values.englishUnits}
                onChange={handleChange("englishUnits")}
                displayEmpty
              >
                <MenuItem value="">
                  <em>בחרי יחידות</em>
                </MenuItem>
                <MenuItem value="3">3 יחידות</MenuItem>
                <MenuItem value="4">4 יחידות</MenuItem>
                <MenuItem value="5">5 יחידות</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* כפתור חישוב */}
          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button
              variant="contained"
              size="large"
              onClick={handleCalculate}
              sx={{ px: 6, borderRadius: 999 }}
            >
              חשב כעת
            </Button>
            <Button variant="outlined" size="large" onClick={handleReset}>
              נקה טופס
            </Button>
          </Box>

          {/* מצב לימודים – כמו בויירפריים למטה */}
          <Box mt={3} display="flex" justifyContent="center">
            <ToggleButtonGroup
              exclusive
              value={studyMode}
              onChange={handleModeChange}
              sx={{
                borderRadius: 999,
                "& .MuiToggleButton-root": { px: 3 },
              }}
            >
              <ToggleButton value="firstDegree">מצב תואר ראשון</ToggleButton>
              <ToggleButton value="preAcademic">
                מצב לימודי הכנה
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* תוצאה */}
          {result && (
            <Box mt={3}>
              <Alert severity="info" sx={{ fontSize: "0.95rem" }}>
                {result}
              </Alert>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdmissionCalculatorPage;

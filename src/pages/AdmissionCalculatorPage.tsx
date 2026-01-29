import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";

/**
 * תנאי קבלה (עדכני לפי פרסומי אונו במסלולי טכנולוגיה דומים).
 * אם יש לך מספרים רשמיים למדעי המחשב – פשוט עדכני כאן.
 */
const ADMISSION_RULES = {
  direct: {
    bagrutAvgMin: 95,
    psychometricMin: 650,
    math: {
      units4MinGrade: 80,
      units5MinGrade: 70,
    },
  },
};

interface FormValues {
  psychometricTotal: string; // 200-800
  bagrutAverage: string; // 55-120 (לפי נהוג בבגרות משוקללת)
  mathUnits: string; // "4" | "5"
  mathBagrutGrade: string; // 0-100
  englishUnits: string; // optional: "3" | "4" | "5"
}

const initialValues: FormValues = {
  psychometricTotal: "",
  bagrutAverage: "",
  mathUnits: "",
  mathBagrutGrade: "",
  englishUnits: "",
};

type Errors = Partial<Record<keyof FormValues, string>>;

function isIntInRange(value: string, min: number, max: number) {
  if (!/^\d+$/.test(value)) return false;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max;
}

const AdmissionCalculatorPage = () => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<string>("");

  const criteriaText = useMemo(() => {
    const r = ADMISSION_RULES.direct;
    return [
      `ממוצע בגרות ${r.bagrutAvgMin}+`,
      `או פסיכומטרי כללי ${r.psychometricMin}+ (עם בגרות מלאה)`,
      `בנוסף: מתמטיקה 4 יח"ל בציון ${r.math.units4MinGrade}+ / 5 יח"ל בציון ${r.math.units5MinGrade}+`,
    ];
  }, []);

  const handleChange =
    (field: keyof FormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setValues((prev) => ({ ...prev, [field]: next }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setResult("");
    };

  const validate = (): boolean => {
    const nextErrors: Errors = {};

    // פסיכומטרי כללי: 200-800
    if (!values.psychometricTotal) {
      nextErrors.psychometricTotal = "חובה להזין ציון פסיכומטרי כללי";
    } else if (!isIntInRange(values.psychometricTotal, 200, 800)) {
      nextErrors.psychometricTotal =
        "פסיכומטרי חייב להיות מספר שלם בין 200 ל-800";
    }

    // ממוצע בגרות: 55-120 (אצל רבים זה טווח סביר לממוצע משוקלל)
    if (!values.bagrutAverage) {
      nextErrors.bagrutAverage = "חובה להזין ממוצע בגרות";
    } else if (!/^\d+(\.\d{1,2})?$/.test(values.bagrutAverage)) {
      nextErrors.bagrutAverage =
        "ממוצע בגרות חייב להיות מספר (אפשר עם עד 2 ספרות אחרי נקודה)";
    } else {
      const b = Number(values.bagrutAverage);
      if (Number.isNaN(b) || b < 55 || b > 120) {
        nextErrors.bagrutAverage = "ממוצע בגרות חייב להיות בין 55 ל-120";
      }
    }

    // יחידות מתמטיקה: 4 או 5 חובה
    if (!values.mathUnits) {
      nextErrors.mathUnits = "חובה לבחור יחידות מתמטיקה";
    } else if (!["4", "5"].includes(values.mathUnits)) {
      nextErrors.mathUnits = "בחירה לא תקינה";
    }

    // ציון מתמטיקה: 0-100 חובה
    if (!values.mathBagrutGrade) {
      nextErrors.mathBagrutGrade = "חובה להזין ציון מתמטיקה בבגרות";
    } else if (!isIntInRange(values.mathBagrutGrade, 0, 100)) {
      nextErrors.mathBagrutGrade =
        "ציון מתמטיקה חייב להיות מספר שלם בין 0 ל-100";
    }

    // אנגלית: אופציונלי אבל אם נבחר – חייב להיות 3/4/5
    if (values.englishUnits && !["3", "4", "5"].includes(values.englishUnits)) {
      nextErrors.englishUnits = "בחירה לא תקינה";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCalculate = () => {
    setResult("");
    if (!validate()) return;

    const p = Number(values.psychometricTotal);
    const b = Number(values.bagrutAverage);
    const mathUnits = Number(values.mathUnits);
    const m = Number(values.mathBagrutGrade);

    const { direct } = ADMISSION_RULES;

    const meetsMath =
      (mathUnits === 4 && m >= direct.math.units4MinGrade) ||
      (mathUnits === 5 && m >= direct.math.units5MinGrade);

    const meetsDirect =
      meetsMath && (b >= direct.bagrutAvgMin || p >= direct.psychometricMin);

    if (meetsDirect) {
      setResult(
        "✅ לפי הנתונים שהזנת – את עומדת בתנאי הקבלה הישירה (על פי הכללים שהוגדרו במחשבון).",
      );
    } else {
      const reasons: string[] = [];
      if (!meetsMath) {
        reasons.push(
          `מתמטיקה: נדרש 4 יח"ל ${direct.math.units4MinGrade}+ או 5 יח"ל ${direct.math.units5MinGrade}+`,
        );
      }
      if (!(b >= direct.bagrutAvgMin || p >= direct.psychometricMin)) {
        reasons.push(
          `נדרש ממוצע בגרות ${direct.bagrutAvgMin}+ או פסיכומטרי ${direct.psychometricMin}+`,
        );
      }

      setResult(
        `ℹ️ לפי הנתונים שהזנת – אין עמידה מלאה בתנאי הקבלה הישירה.\n` +
          `מה חסר:\n- ${reasons.join("\n- ")}\n\n` +
          `המלצה: לפנות לייעוץ רישום/בדיקת מסלולים חלופיים.`,
      );
    }
  };

  const handleReset = () => {
    setValues(initialValues);
    setErrors({});
    setResult("");
  };

  return (
    <Box dir="rtl">
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" align="center" fontWeight={700} gutterBottom>
            מחשבון סיכויי קבלה
          </Typography>

          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            mb={3}
          >
            הזינו נתונים אמיתיים (מספרים בלבד). הכפתור “חשב כעת” יפעל רק כשהכול
            תקין.
          </Typography>

          {/* תנאי קבלה גלויים וברורים */}
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              תנאי קבלה (קבלה ישירה) – לפי הכללים שהוגדרו במחשבון
            </Typography>
            <ul style={{ margin: 0, paddingInlineStart: 18 }}>
              {criteriaText.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Alert>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="ציון פסיכומטרי כללי (200–800)"
                value={values.psychometricTotal}
                onChange={handleChange("psychometricTotal")}
                error={!!errors.psychometricTotal}
                helperText={errors.psychometricTotal || "לדוגמה: 650"}
                inputProps={{ inputMode: "numeric", pattern: "\\d*" }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="ממוצע בגרות (55–120)"
                value={values.bagrutAverage}
                onChange={handleChange("bagrutAverage")}
                error={!!errors.bagrutAverage}
                helperText={
                  errors.bagrutAverage || "אפשר גם עם נקודה, לדוגמה: 98.5"
                }
                inputProps={{ inputMode: "decimal" }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                required
                label="יחידות מתמטיקה"
                value={values.mathUnits}
                onChange={handleChange("mathUnits")}
                error={!!errors.mathUnits}
                helperText={errors.mathUnits || "חובה לבחור 4 או 5 יחידות"}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">
                  <em>בחרי</em>
                </MenuItem>
                <MenuItem value="4">4 יחידות</MenuItem>
                <MenuItem value="5">5 יחידות</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="ציון בגרות במתמטיקה (0–100)"
                value={values.mathBagrutGrade}
                onChange={handleChange("mathBagrutGrade")}
                error={!!errors.mathBagrutGrade}
                helperText={errors.mathBagrutGrade || "לדוגמה: 85"}
                inputProps={{ inputMode: "numeric", pattern: "\\d*" }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="יחידות אנגלית (אופציונלי)"
                value={values.englishUnits}
                onChange={handleChange("englishUnits")}
                error={!!errors.englishUnits}
                helperText={
                  errors.englishUnits || "לא חובה לחישוב, לשיקוף מידע בלבד"
                }
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">
                  <em>לא לבחור</em>
                </MenuItem>
                <MenuItem value="3">3 יחידות</MenuItem>
                <MenuItem value="4">4 יחידות</MenuItem>
                <MenuItem value="5">5 יחידות</MenuItem>
              </TextField>
            </Grid>
          </Grid>

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

          {result && (
            <Box mt={3}>
              <Alert
                severity={result.startsWith("✅") ? "success" : "info"}
                sx={{ whiteSpace: "pre-line" }}
              >
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

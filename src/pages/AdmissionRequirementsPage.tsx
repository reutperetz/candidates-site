import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";

type Requirement = {
  label: string;
  value: string;
};

const trackARequirements: Requirement[] = [
  { label: "ציון פסיכומטרי מינימלי", value: "≥ 650" },
];

const trackBRequirements: Requirement[] = [
  { label: "ציון פסיכומטרי כמותי", value: "≥ 130" },
  { label: "ציון כמותי", value: "≥ 75" },
  { label: "ציון מתמטיקה", value: "≥ 85" },
  { label: "ממוצע בגרות", value: "≥ 90" },
  { label: "יחידות מתמטיקה", value: "5 יח״ל" },
];

const AdmissionRequirementsPage = () => {
  const navigate = useNavigate();

  const renderRequirementBox = (r: Requirement) => (
    <Paper
      key={r.label}
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #d8e6d8",
        bgcolor: "#f7fbf7",
        textAlign: "center",
        minHeight: 90,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary" mb={0.5}>
        {r.label}
      </Typography>
      <Typography variant="h6" fontWeight={700}>
        {r.value}
      </Typography>
    </Paper>
  );

  return (
    <Box dir="rtl">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* כותרת עליונה כמו באתר אונו */}
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
          מידע למועמדים – קבלה, מסלולים והודעות חשובות
        </Typography>

        {/* מסגרת כללית */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#f5f8f5",
          }}
        >
          {/* מסלול א' */}
          <Box sx={{ bgcolor: "#2e7d32", color: "white", p: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              מסלול א׳ – פסיכומטרי ישיר
            </Typography>
            <Typography variant="body2">
              קבלה על בסיס ציון פסיכומטרי בלבד
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                דרישות:
              </Typography>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
            </Box>

            <Grid container spacing={2} mb={2}>
              {trackARequirements.map(renderRequirementBox)}
            </Grid>
          </Box>

          <Divider />

          {/* מסלול ב' */}
          <Box sx={{ bgcolor: "#2e7d32", color: "white", p: 3, mt: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              מסלול ב׳ – סכום משולב
            </Typography>
            <Typography variant="body2">
              קבלה על בסיס שילוב ציונים
            </Typography>
          </Box>

          <Box sx={{ p: 3, pb: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                דרישות:
              </Typography>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
            </Box>

            <Grid container spacing={2} mb={2}>
              {trackBRequirements.map(renderRequirementBox)}
            </Grid>

            <Paper
              elevation={0}
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: "#fff",
                border: "1px dashed #c8dccc",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                נוסחת המסלול: שילוב של ציון פסיכומטרי כמותי, ממוצע בגרות,
                ציון מתמטיקה וציון כמותי.
              </Typography>
            </Paper>
          </Box>

          {/* כפתורים בתחתית – מעבר למחשבון / חזרה לבית */}
          <Box
            sx={{
              px: 3,
              pb: 3,
              pt: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="contained"
              endIcon={<ArrowForwardIosIcon />}
              sx={{
                borderRadius: 999,
                px: 4,
              }}
              onClick={() => navigate("/admission-calculator")}
            >
              מעבר למחשבון סיכוי קבלה
            </Button>

            <Button
              variant="text"
              onClick={() => navigate("/")}
              sx={{ borderRadius: 999 }}
            >
              חזרה למסך הבית
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdmissionRequirementsPage;

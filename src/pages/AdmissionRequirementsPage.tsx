import { useEffect, useMemo, useState } from "react";
import { Box, Container, Typography, Paper, Grid, Button, Divider } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";

type RequirementDisplay = {
  label: string;
  value: string;
};

type TrackType = "A" | "B" | "C";
type RequirementStatus = "active" | "inactive";

type AdminRequirement = {
  id: number;
  track: TrackType;
  trackName: string;
  minPsycho?: number;
  minAverage?: number;
  minMath?: number;
  minEnglish?: number;
  mathUnits?: number;
  englishUnits?: number;
  status: RequirementStatus;
};

const REQUIREMENTS_KEY = "admin_admission_requirements";

const fallbackRequirements: AdminRequirement[] = [
  {
    id: 1,
    track: "A",
    trackName: "מסלול א' - פסיכומטרי ישיר",
    minPsycho: 650,
    status: "active",
  },
  {
    id: 2,
    track: "B",
    trackName: "מסלול ב' - סכום משולב",
    minPsycho: 130,
    minMath: 85,
    minAverage: 90,
    mathUnits: 5,
    status: "active",
  },
];

const trackOrder: Record<TrackType, number> = { A: 0, B: 1, C: 2 };

function loadRequirements(): AdminRequirement[] {
  const raw = localStorage.getItem(REQUIREMENTS_KEY);
  if (!raw) return fallbackRequirements;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AdminRequirement[]) : fallbackRequirements;
  } catch {
    return fallbackRequirements;
  }
}

function buildDisplayItems(req: AdminRequirement): RequirementDisplay[] {
  const items: RequirementDisplay[] = [];
  if (req.minPsycho !== undefined) {
    items.push({ label: "ציון פסיכומטרי מינימלי", value: String(req.minPsycho) });
  }
  if (req.minAverage !== undefined) {
    items.push({ label: "ממוצע בגרות מינימלי", value: String(req.minAverage) });
  }
  if (req.minMath !== undefined) {
    items.push({ label: "ציון מתמטיקה מינימלי", value: String(req.minMath) });
  }
  if (req.minEnglish !== undefined) {
    items.push({ label: "ציון אנגלית מינימלי", value: String(req.minEnglish) });
  }
  if (req.mathUnits !== undefined) {
    items.push({ label: "יחידות מתמטיקה נדרשות", value: String(req.mathUnits) });
  }
  if (req.englishUnits !== undefined) {
    items.push({ label: "יחידות אנגלית נדרשות", value: String(req.englishUnits) });
  }
  return items;
}

const AdmissionRequirementsPage = () => {
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState<AdminRequirement[]>(() => loadRequirements());

  useEffect(() => {
    const sync = () => setRequirements(loadRequirements());
    window.addEventListener("storage", sync);
    window.addEventListener("admission-requirements-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("admission-requirements-changed", sync);
    };
  }, []);

  const activeRequirements = useMemo(
    () =>
      requirements
        .filter((req) => req.status === "active")
        .sort((a, b) => trackOrder[a.track] - trackOrder[b.track] || a.id - b.id),
    [requirements]
  );

  const renderRequirementBox = (r: RequirementDisplay) => (
    <Paper
      key={r.label}
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
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
        <Typography variant="h6" align="center" fontWeight={700} color="success.main">
          {"המחלקה למדעי המחשב"}
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          {"מידע למועמדים - תנאי קבלה והמסלולים האפשריים"}
        </Typography>

        <Paper
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          {activeRequirements.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {"לא זמינים תנאי קבלה פעילים כרגע."}
              </Typography>
            </Box>
          ) : (
            <>
              {activeRequirements.map((req, index) => {
                const items = buildDisplayItems(req);
                return (
                  <Box key={req.id}>
                    <Box
                      sx={{
                        bgcolor: "success.main",
                        color: "success.contrastText",
                        p: 3,
                        mt: index ? 2 : 0,
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {req.trackName}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 3, pb: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {"דרישות:"}
                        </Typography>
                        <CheckCircleOutlineIcon color="success" fontSize="small" />
                      </Box>

                      <Grid container spacing={2} mb={2}>
                        {items.length ? (
                          items.map(renderRequirementBox)
                        ) : (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" align="center">
                              {"אין תנאים מינימליים מוגדרים למסלול זה."}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    {index < activeRequirements.length - 1 && <Divider />}
                  </Box>
                );
              })}

              <Box sx={{ p: 3, pt: 0 }}>
                <Paper
                  elevation={0}
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    border: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {"ניתן להתקבל גם לפי שקלול של בגרות ופסיכומטרי (לפי מדיניות הקבלה של המחלקה)."}
                  </Typography>
                </Paper>
              </Box>
            </>
          )}

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
              {"מעבר למחשבון סיכוי קבלה"}
            </Button>

            <Button variant="text" onClick={() => navigate("/")} sx={{ borderRadius: 999 }}>
              {"חזרה למסך הבית"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdmissionRequirementsPage;

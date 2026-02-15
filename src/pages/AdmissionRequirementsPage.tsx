import { useEffect, useMemo, useState } from "react";
import { Box, Container, Typography, Paper, Button, Divider, LinearProgress } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Grid from "@mui/material/GridLegacy";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, type Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import styles from "./AdmissionRequirementsPage.module.css";

type RequirementDisplay = {
  label: string;
  value: string;
};

type TrackType = "A" | "B" | "C";
type RequirementStatus = "active" | "inactive";

type AdminRequirement = {
  docId: string;
  track: TrackType;
  trackName: string;
  minPsycho?: number;
  minAverage?: number;
  minMath?: number;
  minEnglish?: number;
  mathUnits?: number;
  englishUnits?: number;
  status: RequirementStatus;
  createdAt?: Timestamp;
};

const trackOrder: Record<TrackType, number> = { A: 0, B: 1, C: 2 };

type RequirementDoc = Omit<AdminRequirement, "docId">;


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

  const [requirements, setRequirements] = useState<AdminRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "requirements"));
        const items: AdminRequirement[] = snap.docs.map((d) => {
          const data = d.data() as Partial<RequirementDoc>;
          return {
            docId: d.id,
            track: data.track ?? "A",
            trackName: String(data.trackName ?? ""),
            minPsycho: data.minPsycho ?? undefined,
            minAverage: data.minAverage ?? undefined,
            minMath: data.minMath ?? undefined,
            minEnglish: data.minEnglish ?? undefined,
            mathUnits: data.mathUnits ?? undefined,
            englishUnits: data.englishUnits ?? undefined,
            status: data.status ?? "active",
            createdAt: data.createdAt,
          };
        });
        if (active) setRequirements(items);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const activeRequirements = useMemo(
    () =>
      requirements
        .filter((req) => req.status === "active")
        .sort((a, b) =>
          trackOrder[a.track] - trackOrder[b.track] || (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        ),
    [requirements]
  );

  const renderRequirementBox = (r: RequirementDisplay) => (
    <Paper
      key={r.label}
      elevation={0}
      className={styles.requirementBox}
    >
      <Typography variant="body2" className={styles.requirementLabel}>
        {r.label}
      </Typography>
      <Typography variant="h6" className={styles.requirementValue}>
        {r.value}
      </Typography>
    </Paper>
  );

  return (
    <Box dir="rtl">
      <Container maxWidth="lg" className={styles.page}>
        <Typography variant="h6" align="center" className={styles.pageTitle}>
          {"המחלקה למדעי המחשב"}
        </Typography>
        <Typography variant="body2" align="center" className={styles.pageSubtitle}>
          {"מידע למועמדים - תנאי קבלה והמסלולים האפשריים"}
        </Typography>

        <Paper elevation={2} className={styles.panel}>
          {isLoading && <LinearProgress />}
          {isLoading ? null : activeRequirements.length === 0 ? (
            <Box className={styles.emptyBox}>
              <Typography variant="body2" className={styles.mutedText}>
                {"לא זמינים תנאי קבלה פעילים כרגע."}
              </Typography>
            </Box>
          ) : (
            <>
              {activeRequirements.map((req, index) => {
                const items = buildDisplayItems(req);
                return (
                  <Box key={req.docId}>
                    <Box className={`${styles.trackHeader} ${index ? styles.trackHeaderSpaced : ""}`}>
                      <Typography variant="h6" className={styles.trackTitle}>
                        {req.trackName}
                      </Typography>
                    </Box>

                    <Box className={styles.trackBody}>
                      <Box className={styles.requirementsRow}>
                        <Typography variant="subtitle1" className={styles.requirementsTitle}>
                          {"דרישות:"}
                        </Typography>
                        <CheckCircleOutlineIcon color="success" fontSize="small" />
                      </Box>

                      <Grid container spacing={2} className={styles.requirementsGrid}>
                        {items.length ? (
                          items.map(renderRequirementBox)
                        ) : (
                          <Grid item xs={12}>
                            <Typography variant="body2" className={styles.mutedText} align="center">
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

              <Box className={styles.noticeWrapper}>
                <Paper elevation={0} className={styles.noticePaper}>
                  <Typography variant="body2" className={styles.mutedText}>
                    {"ניתן להתקבל גם לפי שקלול של בגרות ופסיכומטרי (לפי מדיניות הקבלה של המחלקה)."}
                  </Typography>
                </Paper>
              </Box>
            </>
          )}

          <Box className={styles.actions}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIosIcon />}
              className={styles.primaryButton}
              onClick={() => navigate("/admission-calculator")}
            >
              {"מעבר למחשבון סיכוי קבלה"}
            </Button>

            <Button variant="text" onClick={() => navigate("/")} className={styles.secondaryButton}>
              {"חזרה למסך הבית"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdmissionRequirementsPage;


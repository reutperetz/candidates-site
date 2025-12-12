// src/pages/AdminAdmissionRequirementsPage.tsx
import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Chip,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type TrackType = "A" | "B" | "C";
type RequirementStatus = "active" | "inactive";

interface AdmissionRequirement {
  id: number;
  track: TrackType;
  trackName: string;
  minPsycho?: number; // ציון פסיכומטרי
  minAverage?: number; // ממוצע בגרות
  minMath?: number; // ציון מתמטיקה
  minEnglish?: number; // ציון אנגלית
  mathUnits?: number; // יחידות מתמטיקה
  englishUnits?: number; // יחידות אנגלית
  status: RequirementStatus;
}

// נתוני דמה לרשימה – כדי שייראה כמו בטופס שלך
const mockRequirements: AdmissionRequirement[] = [
  {
    id: 1,
    track: "A",
    trackName: "מסלול א' – פסיכומטרי ישר",
    minPsycho: 650,
    status: "active",
  },
  {
    id: 2,
    track: "B",
    trackName: "מסלול ב' – סכום משוכלל",
    minPsycho: 130,
    minMath: 85,
    minAverage: 90,
    mathUnits: 5,
    status: "active",
  },
];

const statusChip = (status: RequirementStatus) => {
  switch (status) {
    case "active":
      return <Chip label="פעיל" color="success" size="small" />;
    case "inactive":
      return <Chip label="לא פעיל" color="default" size="small" />;
  }
};

const AdminAdmissionRequirementsPage = () => {
  // 0 = רשימה, 1 = הוספת תנאי חדש
  const [tab, setTab] = useState(0);

  const [form, setForm] = useState({
    track: "",
    trackName: "",
    minPsycho: "",
    minAverage: "",
    minMath: "",
    minEnglish: "",
    mathUnits: "",
    englishUnits: "",
  });

  const [saved, setSaved] = useState(false);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [field]: e.target.value });
      setSaved(false);
    };

  const handleSave = () => {
    // כאן בעתיד אפשר לבצע שמירה לשרת.
    setSaved(true);
  };

  const handleReset = () => {
    setForm({
      track: "",
      trackName: "",
      minPsycho: "",
      minAverage: "",
      minMath: "",
      minEnglish: "",
      mathUnits: "",
      englishUnits: "",
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
          מערכת ניהול – תנאי קבלה
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
            <Tab label="רשימת תנאי קבלה" />
            <Tab label="הוספת תנאי קבלה חדש" />
          </Tabs>

          {/* =============== טאב 1 – רשימת תנאי קבלה =============== */}
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
                  רשימת תנאי קבלה
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: 999, px: 3 }}
                  onClick={() => setTab(1)}
                >
                  הוספת תנאי קבלה חדש
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                מספר תנאי הקבלה במערכת: {mockRequirements.length}
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
                      <TableCell>יח&apos; אנגלית</TableCell>
                      <TableCell>יח&apos; מתמטיקה</TableCell>
                      <TableCell>ממוצע בגרות מינימלי</TableCell>
                      <TableCell>ציון אנגלית מינימלי</TableCell>
                      <TableCell>ציון מתמטיקה מינימלי</TableCell>
                      <TableCell>ציון פסיכומטרי מינימלי</TableCell>
                      <TableCell>מסלול</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockRequirements.map((r) => (
                      <TableRow key={r.id}>
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
                        <TableCell>{statusChip(r.status)}</TableCell>
                        <TableCell>{r.englishUnits ?? "-"}</TableCell>
                        <TableCell>{r.mathUnits ?? "-"}</TableCell>
                        <TableCell>{r.minAverage ?? "-"}</TableCell>
                        <TableCell>{r.minEnglish ?? "-"}</TableCell>
                        <TableCell>{r.minMath ?? "-"}</TableCell>
                        <TableCell>{r.minPsycho ?? "-"}</TableCell>
                        <TableCell>{r.trackName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              {mockRequirements.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mt={2}
                  align="center"
                >
                  אין תנאים להצגה.
                </Typography>
              )}
            </Box>
          )}

          {/* =============== טאב 2 – הוספת תנאי קבלה חדש =============== */}
          {tab === 1 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={2}>
                הוספת תנאי קבלה חדש
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                הגדירי את תנאי הקבלה לכל מסלול בהתאם לתכנון הפרויקט.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="מסלול"
                    value={form.track}
                    onChange={handleChange("track")}
                  >
                    <MenuItem value="A">מסלול א&apos; – פסיכומטרי ישיר</MenuItem>
                    <MenuItem value="B">מסלול ב&apos; – סכום משוכלל</MenuItem>
                    <MenuItem value="C">מסלול ג&apos; – מסלול מורחב</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="שם מסלול / תיאור קצר"
                    placeholder="למשל: מסלול א' – פסיכומטרי ישיר"
                    value={form.trackName}
                    onChange={handleChange("trackName")}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="ציון פסיכומטרי מינימלי"
                    value={form.minPsycho}
                    onChange={handleChange("minPsycho")}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="ציון מתמטיקה מינימלי"
                    value={form.minMath}
                    onChange={handleChange("minMath")}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="ציון אנגלית מינימלי"
                    value={form.minEnglish}
                    onChange={handleChange("minEnglish")}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ממוצע בגרות מינימלי"
                    value={form.minAverage}
                    onChange={handleChange("minAverage")}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="יחידות מתמטיקה נדרשות"
                    value={form.mathUnits}
                    onChange={handleChange("mathUnits")}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="יחידות אנגלית נדרשות"
                    value={form.englishUnits}
                    onChange={handleChange("englishUnits")}
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
                    תנאי קבלה חדש נשמר בהצלחה (דמה לצורכי תכנון פרויקט).
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

export default AdminAdmissionRequirementsPage;

// src/pages/CandidateStudyTracksPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { collection, onSnapshot, type Timestamp } from "firebase/firestore";
import { db } from "../firebase";

type TrackStatus = "active" | "inactive";

type StudyTrack = {
  docId: string;
  code: string;
  name: string;
  description: string;
  status: TrackStatus;
  notes?: string;
  updatedAt?: Timestamp;
};

const formatDateTimeIL = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
};

const CandidateStudyTracksPage = () => {
  const [tracks, setTracks] = useState<StudyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  useEffect(() => {
    const registered = localStorage.getItem("registered_candidate");
    if (registered) {
      try {
        const data = JSON.parse(registered) as { studyTrackId?: string };
        if (data.studyTrackId) setSelectedTrackId(data.studyTrackId);
      } catch {
        setSelectedTrackId("");
      }
    }
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "study_tracks"),
      (snap) => {
        const items: StudyTrack[] = snap.docs.map((doc) => {
          const data = doc.data() as Partial<StudyTrack>;
          return {
            docId: doc.id,
            code: String(data.code ?? ""),
            name: String(data.name ?? ""),
            description: String(data.description ?? ""),
            status:
              data.status === "active" || data.status === "inactive" ? data.status : "inactive",
            notes: String(data.notes ?? ""),
            updatedAt: data.updatedAt as Timestamp | undefined,
          };
        });

        items.sort((a, b) => {
          const at = a.updatedAt?.toMillis?.() ?? 0;
          const bt = b.updatedAt?.toMillis?.() ?? 0;
          return bt - at;
        });

        setTracks(items);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );

    return () => unsub();
  }, []);

  const activeTracks = useMemo(
    () => tracks.filter((track) => track.status === "active"),
    [tracks]
  );
  const inactiveTracks = useMemo(
    () => tracks.filter((track) => track.status === "inactive"),
    [tracks]
  );

  const handleSelect = (track: StudyTrack) => {
    if (track.status !== "active") return;
    setSelectedTrackId(track.docId);
    localStorage.setItem("preferredTrackId", track.docId);
    localStorage.setItem("preferredTrackName", track.name);

    const registered = localStorage.getItem("registered_candidate");
    if (registered) {
      try {
        const data = JSON.parse(registered) as Record<string, unknown>;
        const next = {
          ...data,
          studyTrackId: track.docId,
          studyTrackName: track.name,
        };
        localStorage.setItem("registered_candidate", JSON.stringify(next));
      } catch {
        // ignore
      }
    }

    setSnack({ open: true, msg: "בחירת המסלול נשמרה בהצלחה." });
  };

  const renderTrackCard = (track: StudyTrack) => {
    const isSelected = selectedTrackId === track.docId;
    const isActive = track.status === "active";

    return (
      <Card
        key={track.docId}
        sx={{
          height: "100%",
          borderRadius: 3,
          boxShadow: isSelected ? "0 6px 16px rgba(46,125,50,0.25)" : 2,
          border: isSelected ? "1px solid" : "1px solid transparent",
          borderColor: isSelected ? "success.main" : "transparent",
        }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              {track.name || "מסלול ללא שם"}
            </Typography>
            <Chip
              size="small"
              label={isActive ? "פעיל" : "לא פעיל"}
              color={isActive ? "success" : "default"}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {track.code || "—"}
          </Typography>

          <Typography variant="body2">{track.description || "אין תיאור מסלול."}</Typography>

          {track.notes && (
            <Alert icon={<InfoOutlinedIcon fontSize="small" />} severity="warning">
              {track.notes}
            </Alert>
          )}

          <Typography variant="caption" color="text.secondary">
            עודכן: {track.updatedAt?.toDate ? formatDateTimeIL(track.updatedAt.toDate()) : "—"}
          </Typography>

          <Box mt="auto" display="flex" justifyContent="space-between" alignItems="center">
            {isSelected ? (
              <Chip icon={<CheckCircleIcon />} label="מסלול נבחר" color="success" />
            ) : (
              <span />
            )}
            <Button
              variant={isSelected ? "outlined" : "contained"}
              color="success"
              disabled={!isActive}
              onClick={() => handleSelect(track)}
            >
              {isSelected ? "נבחר" : "בחירת מסלול"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box dir="rtl">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h6" align="center" fontWeight={700} color="success.main">
          מסלולי לימוד
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          כאן ניתן לבחור מסלול לימודים מועדף ולראות פרטים על כל מסלול.
        </Typography>

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, bgcolor: "background.paper" }}>
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}

          <Box mb={2}>
            <Typography variant="h6" fontWeight={700}>
              מסלולי לימוד פעילים
            </Typography>
            <Typography variant="body2" color="text.secondary">
              בחרי מסלול לימוד אחד מועדף.
            </Typography>
          </Box>

          {activeTracks.length === 0 && !isLoading && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              אין מסלולים פעילים כרגע. ניתן לצפות במסלולים שאינם פעילים בלבד.
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {activeTracks.map((track) => (
              <Grid item xs={12} md={6} lg={4} key={track.docId}>
                {renderTrackCard(track)}
              </Grid>
            ))}
          </Grid>

          <Box mb={2}>
            <Typography variant="h6" fontWeight={700}>
              מסלולים לא פעילים
            </Typography>
            <Typography variant="body2" color="text.secondary">
              מסלולים אלה מוצגים לצפייה בלבד.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {inactiveTracks.map((track) => (
              <Grid item xs={12} md={6} lg={4} key={track.docId}>
                {renderTrackCard(track)}
              </Grid>
            ))}
            {inactiveTracks.length === 0 && !isLoading && (
              <Grid item xs={12}>
                <Typography align="center" color="text.secondary">
                  אין מסלולים לא פעילים להצגה.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={2000}
        onClose={() => setSnack({ open: false, msg: "" })}
        message={snack.msg}
      />
    </Box>
  );
};

export default CandidateStudyTracksPage;

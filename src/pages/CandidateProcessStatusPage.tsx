// src/pages/CandidateProcessStatusPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { collection, onSnapshot, query, where, type Timestamp } from "firebase/firestore";
import { db } from "../firebase";

import styles from "./CandidateProcessStatusPage.module.css";

type StageType =
  | "הרשמה בוצעה"
  | "חישוב סיכויים"
  | "מועמד בתנאי סף"
  | "ראיון"
  | "התקבל";

const stageOrder: StageType[] = [
  "הרשמה בוצעה",
  "חישוב סיכויים",
  "מועמד בתנאי סף",
  "ראיון",
  "התקבל",
];

const stageMaxPercent: Record<StageType, number> = {
  "הרשמה בוצעה": 20,
  "חישוב סיכויים": 40,
  "מועמד בתנאי סף": 60,
  "ראיון": 80,
  "התקבל": 100,
};

type ProcessStatus = {
  docId: string;
  candidateIdNumber: string;
  stage: StageType;
  progressPercent: number;
  systemNotes?: string;
  managerNotes?: string;
  updatedAt?: Timestamp | Date;
};

const formatDateTimeIL = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
};

const toDisplayDate = (value?: Timestamp | Date) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  return null;
};

const CandidateProcessStatusPage = () => {
  const [items, setItems] = useState<ProcessStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [candidateId, setCandidateId] = useState("");
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState("");
  const [submissionTimestamp, setSubmissionTimestamp] = useState<Timestamp | null>(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [localRegisteredAt, setLocalRegisteredAt] = useState<string | null>(null);

  useEffect(() => {
    const registered = localStorage.getItem("registered_candidate");
    if (registered) {
      try {
        const data = JSON.parse(registered) as { idNumber?: string; registeredAt?: string };
        if (data.idNumber) {
          setCandidateId(data.idNumber);
          setInputId(data.idNumber);
        }
        if (data.registeredAt) {
          setLocalRegisteredAt(data.registeredAt);
        } else if (data.idNumber) {
          setLocalRegisteredAt(new Date().toISOString());
        }
      } catch {
        setCandidateId("");
      }
    } else {
      const authUser = localStorage.getItem("authUser");
      if (authUser && /^\d{9}$/.test(authUser)) {
        setCandidateId(authUser);
        setInputId(authUser);
      }
    }
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "candidate_process_statuses"),
      (snap) => {
        const list: ProcessStatus[] = snap.docs.map((doc) => {
          const data = doc.data() as Partial<ProcessStatus>;
          const fallbackId = String((data as { candidateId?: string }).candidateId ?? "");
          const legacyId = String((data as { idNumber?: string }).idNumber ?? "");
          const primaryId = String(data.candidateIdNumber ?? "");
          return {
            docId: doc.id,
            candidateIdNumber: primaryId || fallbackId || legacyId || "",
            stage: (data.stage ?? "הרשמה בוצעה") as StageType,
            progressPercent: Number(data.progressPercent ?? 0),
            systemNotes: String(data.systemNotes ?? ""),
            managerNotes: String(data.managerNotes ?? ""),
            updatedAt: data.updatedAt as Timestamp | undefined,
          };
        });
        setItems(list);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!candidateId) {
      setSubmissionTimestamp(null);
      setSubmissionLoading(false);
      return;
    }

    setSubmissionLoading(true);
    const q = query(
      collection(db, "candidate_submissions"),
      where("idNumber", "==", candidateId)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const first = snap.docs[0];
        if (!first) {
          setSubmissionTimestamp(null);
        } else {
          const data = first.data() as { createdAt?: Timestamp };
          setSubmissionTimestamp(data.createdAt ?? null);
        }
        setSubmissionLoading(false);
      },
      () => {
        setSubmissionTimestamp(null);
        setSubmissionLoading(false);
      }
    );

    return () => unsub();
  }, [candidateId]);

  const current = useMemo(() => {
    if (!candidateId) return null;
    return items.find((x) => x.candidateIdNumber === candidateId) || null;
  }, [items, candidateId]);

  const derivedCurrent = useMemo<ProcessStatus | null>(() => {
    if (!candidateId || !submissionTimestamp) return null;
    return {
      docId: "derived-registration",
      candidateIdNumber: candidateId,
      stage: "הרשמה בוצעה",
      progressPercent: 20,
      systemNotes: "ההרשמה התקבלה וממתינה לעדכון המשך תהליך.",
      managerNotes: "",
      updatedAt: submissionTimestamp,
    };
  }, [candidateId, submissionTimestamp]);

  const derivedLocal = useMemo<ProcessStatus | null>(() => {
    if (!candidateId || !localRegisteredAt) return null;
    const date = new Date(localRegisteredAt);
    return {
      docId: "local-registration",
      candidateIdNumber: candidateId,
      stage: "הרשמה בוצעה",
      progressPercent: 20,
      systemNotes: "ההרשמה התקבלה במערכת המקומית וממתינה לעדכון המשך תהליך.",
      managerNotes: "",
      updatedAt: Number.isNaN(date.getTime()) ? undefined : date,
    };
  }, [candidateId, localRegisteredAt]);

  const displayed = current ?? derivedCurrent ?? derivedLocal;
  const currentStageIndex = displayed ? stageOrder.indexOf(displayed.stage) : -1;

  const handleCheck = () => {
    if (!/^\d{9}$/.test(inputId)) {
      setError('ת"ז חייבת להיות 9 ספרות');
      return;
    }
    setError("");
    setCandidateId(inputId);
  };

  return (
    <Box dir="rtl">
      <Container maxWidth="md" className={styles.content}>
        <Typography variant="h6" align="center" fontWeight={700} color="success.main">
          סטטוס תהליך מועמדות
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" className={styles.subtitle}>
          כאן ניתן לראות את ההתקדמות בשלבי הקבלה והקרבה להתקבל.
        </Typography>

        <Paper elevation={3} className={styles.card}>
          {isLoading && <LinearProgress className={styles.loadingBar} />}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              label="תעודת זהות"
              value={inputId}
              onChange={(e) => setInputId(e.target.value.replace(/[^\d]/g, ""))}
              error={!!error}
              helperText={error || 'הזיני ת"ז כדי לצפות בסטטוס'}
              inputProps={{ inputMode: "numeric", maxLength: 9 }}
            />
            <Button
              variant="contained"
              color="success"
              onClick={handleCheck}
              className={styles.checkButton}
            >
              הצג סטטוס
            </Button>
          </Stack>
        </Paper>

        {!candidateId && (
          <AlertBlock text="נא להזין תעודת זהות כדי לצפות בהתקדמות." />
        )}

        {candidateId && !displayed && !isLoading && !submissionLoading && (
          <AlertBlock text="לא נמצא סטטוס למועמד/ת זה/זו." />
        )}

        {displayed && (
          <Paper elevation={3} className={styles.card}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  השלב הנוכחי: {displayed.stage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  אחוז ההתקדמות: {displayed.progressPercent}% (מקסימום לשלב:{" "}
                  {stageMaxPercent[displayed.stage]}%)
                </Typography>
              </Box>

              <Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Math.max(0, displayed.progressPercent))}
                  className={styles.progressBar}
                />
              </Box>

              <Grid container spacing={2}>
                {stageOrder.map((stage, idx) => {
                  const done = idx <= currentStageIndex;
                  return (
                    <Grid item xs={12} sm={6} key={stage}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {done ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                        )}
                        <Typography variant="body2" fontWeight={done ? 700 : 500}>
                          {stage}
                        </Typography>
                        <Chip
                          label={`עד ${stageMaxPercent[stage]}%`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Grid>
                  );
                })}
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    title="הערות מערכת"
                    value={displayed.systemNotes || "אין הערות מערכת."}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    title="הערות מנהל"
                    value={displayed.managerNotes || "אין הערות מנהל."}
                  />
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary">
                עודכן לאחרונה:{" "}
                {toDisplayDate(displayed.updatedAt)
                  ? formatDateTimeIL(toDisplayDate(displayed.updatedAt) as Date)
                  : "—"}
              </Typography>
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

const AlertBlock = ({ text }: { text: string }) => (
  <Paper elevation={0} className={styles.alertCard}>
    <Typography variant="body2" color="text.secondary" align="center">
      {text}
    </Typography>
  </Paper>
);

const InfoCard = ({ title, value }: { title: string; value: string }) => (
  <Paper elevation={0} className={styles.infoCard}>
    <Typography variant="subtitle2" fontWeight={700} className={styles.infoTitle}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {value}
    </Typography>
  </Paper>
);

export default CandidateProcessStatusPage;

// src/pages/AdminFaqManager.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Stack,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

type FaqStatus = "active" | "inactive";

interface FaqItem {
  docId: string;
  question: string;
  answer: string;
  status: FaqStatus;
  createdAt?: Timestamp;
}

const statusChip = (status: FaqStatus) =>
  status === "active"
    ? <Chip label="פעיל" color="success" size="small" />
    : <Chip label="לא פעיל" size="small" />;

function formatDate(value?: Timestamp) {
  if (!value?.toDate) return "";
  return value.toDate().toLocaleDateString("he-IL");
}

export default function AdminFaqManager() {
  const [tab, setTab] = useState(0);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "faqs"),
      (snap) => {
        const items: FaqItem[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            docId: d.id,
            question: String(data.question ?? ""),
            answer: String(data.answer ?? ""),
            status: data.status ?? "active",
            createdAt: data.createdAt,
          };
        });
        items.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setFaqs(items);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<FaqStatus>("active");
  const [errors, setErrors] = useState<{ question?: string; answer?: string }>({});

  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<FaqItem | null>(null);

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setStatus("active");
    setErrors({});
  };

  const validate = () => {
    const e: { question?: string; answer?: string } = {};
    if (!question.trim()) e.question = "שדה חובה";
    if (!answer.trim()) e.answer = "שדה חובה";
    setErrors(e);
    return !e.question && !e.answer;
  };

  const createFaq = async () => {
    if (!validate()) {
      setSnack({
        open: true,
        msg: "אי אפשר לשמור – יש שדות חסרים",
        severity: "error",
      });
      return;
    }

    try {
      await addDoc(collection(db, "faqs"), {
        question: question.trim(),
        answer: answer.trim(),
        status,
        createdAt: serverTimestamp(),
      });
      setSnack({
        open: true,
        msg: "שאלה נפוצה נוספה בהצלחה",
        severity: "success",
      });
      resetForm();
      setTab(0);
    } catch {
      setSnack({
        open: true,
        msg: "אי אפשר לשמור – יש שדות חסרים",
        severity: "error",
      });
    }
  };

  const openEdit = (item: FaqItem) => {
    setSelected(item);
    setQuestion(item.question);
    setAnswer(item.answer);
    setStatus(item.status);
    setErrors({});
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!selected) return;
    if (!validate()) {
      setSnack({
        open: true,
        msg: "אי אפשר לשמור – יש שדות חסרים",
        severity: "error",
      });
      return;
    }

    try {
      await updateDoc(doc(db, "faqs", selected.docId), {
        question: question.trim(),
        answer: answer.trim(),
        status,
      });
      setEditOpen(false);
      setSelected(null);
      setSnack({
        open: true,
        msg: "השאלה עודכנה בהצלחה",
        severity: "success",
      });
      resetForm();
    } catch {
      setSnack({
        open: true,
        msg: "אי אפשר לשמור – יש שדות חסרים",
        severity: "error",
      });
    }
  };

  const openDelete = (item: FaqItem) => {
    setSelected(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await deleteDoc(doc(db, "faqs", selected.docId));
      setDeleteOpen(false);
      setSelected(null);
      setSnack({
        open: true,
        msg: "השאלה נמחקה",
        severity: "success",
      });
    } catch {
      setDeleteOpen(false);
      setSelected(null);
    }
  };


  return (
    <Box dir="rtl">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" align="center" fontWeight={700} color="success.main">
          המחלקה למדעי המחשב
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          מערכת ניהול – שאלות נפוצות
        </Typography>

        <Paper elevation={3} sx={{ borderRadius: 3, p: 2, mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            centered
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": { fontWeight: 600 },
              "& .MuiTab-root.Mui-selected": { color: "success.main" },
              "& .MuiTabs-indicator": { backgroundColor: "success.main" },
            }}
          >
            <Tab label="רשימת שאלות נפוצות" />
            <Tab label="יצירת שאלה נפוצה חדשה" />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            {isLoading && <LinearProgress sx={{ mb: 2 }} />}
            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Typography variant="h5" fontWeight={600}>
                רשימת שאלות נפוצות
              </Typography>

              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                sx={{ borderRadius: 999 }}
                onClick={() => {
                  resetForm();
                  setTab(1);
                }}
              >
                יצירת שאלה
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" mb={2}>
              מספר השאלות במערכת: {faqs.length}
            </Typography>

            <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "background.paper" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>פעולות</TableCell>
                    <TableCell>סטטוס</TableCell>
                    <TableCell>תאריך יצירה</TableCell>
                    <TableCell>תשובה</TableCell>
                    <TableCell>שאלה</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {faqs.map((item) => (
                    <TableRow key={item.docId}>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<EditIcon fontSize="small" />}
                            onClick={() => openEdit(item)}
                          >
                            עריכה
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutlineIcon fontSize="small" />}
                            onClick={() => openDelete(item)}
                          >
                            מחיקה
                          </Button>
                        </Stack>
                      </TableCell>
                      <TableCell>{statusChip(item.status)}</TableCell>
                      <TableCell>{formatDate(item.createdAt) || "-"}</TableCell>
                      <TableCell sx={{ maxWidth: 400 }}>
                        <Typography noWrap>{item.answer}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography noWrap>{item.question}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Paper>
        )}

        {tab === 1 && (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} mb={2}>
              יצירת שאלה נפוצה חדשה
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={3}>
              מלאי את שאלתך ואת התשובה שתוצג למועמדים.
            </Typography>

            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                label="שאלה *"
                multiline
                minRows={2}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                error={!!errors.question}
                helperText={errors.question || " "}
                fullWidth
              />

              <TextField
                label="תשובה *"
                multiline
                minRows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                error={!!errors.answer}
                helperText={errors.answer || " "}
                fullWidth
              />

              <TextField
                label="סטטוס"
                select
                SelectProps={{ native: true }}
                value={status}
                onChange={(e) => setStatus(e.target.value as FaqStatus)}
                fullWidth
              >
                <option value="active">פעיל</option>
                <option value="inactive">לא פעיל</option>
              </TextField>

              <Box mt={2} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Button variant="text" color="success" onClick={() => setTab(0)}>
                  ⬅ חזרה לרשימת שאלות
                </Button>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      resetForm();
                    }}
                  >
                    ביטול
                  </Button>
                  <Button variant="contained" color="success" onClick={createFaq}>
                    שמירה
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>

      {/* EDIT */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>עריכת שאלה נפוצה</DialogTitle>
        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="שאלה *"
              multiline
              minRows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              error={!!errors.question}
              helperText={errors.question || " "}
              fullWidth
            />
            <TextField
              label="תשובה *"
              multiline
              minRows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              error={!!errors.answer}
              helperText={errors.answer || " "}
              fullWidth
            />
            <TextField
              label="סטטוס"
              select
              SelectProps={{ native: true }}
              value={status}
              onChange={(e) => setStatus(e.target.value as FaqStatus)}
              fullWidth
            >
              <option value="active">פעיל</option>
              <option value="inactive">לא פעיל</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)}>ביטול</Button>
          <Button variant="contained" color="success" onClick={saveEdit}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>מחיקת שאלה</DialogTitle>
        <DialogContent>
          <Typography>
            למחוק את השאלה <b>{selected?.question}</b>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>ביטול</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled" sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}


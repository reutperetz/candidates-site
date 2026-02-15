// src/pages/AdminNotificationsManager.tsx
import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import styles from "./AdminNotificationsManager.module.css";

interface NotificationItem {
  id: number;
  title: string;
  content: string;
  status: "active" | "inactive";
  createdAt: string; // dd/mm/yyyy
  time: string; // hh:mm
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "פתיחת סמסטר",
    content: "השיעורים יחלו בתאריך 1.12",
    time: "12:42",
    createdAt: "30/11/2025",
    status: "active",
  },
];

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const createdAt = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { createdAt, time };
}

type FormState = {
  title: string;
  content: string;
  status: "active" | "inactive";
};

const emptyForm: FormState = { title: "", content: "", status: "active" };

export default function AdminNotificationsManager() {
  const [tab, setTab] = useState(1); // ברירת מחדל: רשימה
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications);

  const nextId = useMemo(() => (items.length ? Math.max(...items.map((x) => x.id)) + 1 : 1), [items]);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const validate = (f: FormState) => {
    const e: Record<string, string> = {};
    if (!f.title.trim()) e.title = "כותרת חובה";
    else if (f.title.trim().length < 2) e.title = "כותרת קצרה מדי";
    if (!f.content.trim()) e.content = "תוכן הודעה חובה";
    else if (f.content.trim().length < 5) e.content = "תוכן קצר מדי";
    return { ok: Object.keys(e).length === 0, errors: e };
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
  };

  const createNotification = () => {
    const res = validate(form);
    setErrors(res.errors);
    if (!res.ok) return;

    const { createdAt, time } = nowStamp();
    const newItem: NotificationItem = {
      id: nextId,
      title: form.title.trim(),
      content: form.content.trim(),
      status: form.status,
      createdAt,
      time,
    };

    setItems((p) => [newItem, ...p]);
    setSnack({ open: true, message: "ההודעה פורסמה" });
    resetForm();
    setTab(1); // אחרי שמירה -> לרשימה
  };

  const openEdit = (n: NotificationItem) => {
    setEditId(n.id);
    setEditForm({ title: n.title, content: n.content, status: n.status });
    setEditErrors({});
  };

  const saveEdit = () => {
    if (editId == null) return;
    const res = validate(editForm);
    setEditErrors(res.errors);
    if (!res.ok) return;

    setItems((p) =>
      p.map((x) =>
        x.id !== editId
          ? x
          : { ...x, title: editForm.title.trim(), content: editForm.content.trim(), status: editForm.status }
      )
    );
    setEditId(null);
    setSnack({ open: true, message: "ההודעה עודכנה" });
  };

  const doDelete = () => {
    if (deleteId == null) return;
    setItems((p) => p.filter((x) => x.id !== deleteId));
    setDeleteId(null);
    setSnack({ open: true, message: "ההודעה נמחקה" });
  };

  return (
    <Container maxWidth="lg" className={styles.page} dir="rtl">
      <Typography variant="h5" textAlign="center" className={styles.pageTitle}>
        המחלקה למדעי המחשב
      </Typography>

      <Typography variant="body2" textAlign="center" className={styles.pageSubtitle}>
        מערכת ניהול – הודעות
      </Typography>

      <Paper elevation={3} className={styles.tabsPaper}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          className={styles.tabs}
        >
          <Tab label="📢 יצירת הודעה חדשה" />
          <Tab label="📄 רשימת הודעות" />
        </Tabs>
      </Paper>

      {/* יצירה */}
      {tab === 0 && (
        <Paper elevation={3} className={styles.formPaper}>
          <Typography variant="h6" className={styles.formTitle}>
            יצירת הודעה חדשה
          </Typography>

          <Box className={styles.formStack}>
            <TextField
              fullWidth
              label="כותרת *"
              value={form.title}
              onChange={(e) => {
                setForm((p) => ({ ...p, title: e.target.value }));
                setErrors((p) => ({ ...p, title: "" }));
              }}
              error={!!errors.title}
              helperText={errors.title}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="תוכן ההודעה *"
              value={form.content}
              onChange={(e) => {
                setForm((p) => ({ ...p, content: e.target.value }));
                setErrors((p) => ({ ...p, content: "" }));
              }}
              error={!!errors.content}
              helperText={errors.content}
            />

            <TextField
              fullWidth
              label="סטטוס"
              select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as "active" | "inactive" }))}
            >
              <MenuItem value="active">פעיל</MenuItem>
              <MenuItem value="inactive">לא פעיל</MenuItem>
            </TextField>

            <Box className={styles.formActions}>
              <Button variant="text" color="success" onClick={() => setTab(1)}>
                ⬅ חזרה לרשימת הודעות
              </Button>

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={resetForm}>
                  ביטול
                </Button>
                <Button variant="contained" color="success" onClick={createNotification}>
                  שמירה
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>
      )}

      {/* רשימה */}
      {tab === 1 && (
        <Paper elevation={3} className={styles.listPaper}>
          <Box className={styles.listHeader}>
            <Button variant="contained" startIcon={<AddIcon />} color="success" onClick={() => setTab(0)}>
              יצירת הודעה
            </Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>פעולות</TableCell>
                <TableCell>סטטוס</TableCell>
                <TableCell>שעה</TableCell>
                <TableCell>תאריך יצירה</TableCell>
                <TableCell>כותרת</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={() => openEdit(n)}
                      >
                        עריכה
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                        onClick={() => setDeleteId(n.id)}
                      >
                        מחיקה
                      </Button>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    {n.status === "active" ? (
                      <Chip label="פעיל" color="success" size="small" />
                    ) : (
                      <Chip label="לא פעיל" size="small" />
                    )}
                  </TableCell>

                  <TableCell>{n.time}</TableCell>
                  <TableCell>{n.createdAt}</TableCell>
                  <TableCell>{n.title}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* עריכה */}
      <Dialog open={editId != null} onClose={() => setEditId(null)} fullWidth maxWidth="md">
        <DialogTitle>עריכת הודעה</DialogTitle>
        <DialogContent>
          <Box className={styles.dialogForm}>
            <TextField
              fullWidth
              label="כותרת *"
              value={editForm.title}
              onChange={(e) => {
                setEditForm((p) => ({ ...p, title: e.target.value }));
                setEditErrors((p) => ({ ...p, title: "" }));
              }}
              error={!!editErrors.title}
              helperText={editErrors.title}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="תוכן *"
              value={editForm.content}
              onChange={(e) => {
                setEditForm((p) => ({ ...p, content: e.target.value }));
                setEditErrors((p) => ({ ...p, content: "" }));
              }}
              error={!!editErrors.content}
              helperText={editErrors.content}
            />

            <TextField
              fullWidth
              label="סטטוס"
              select
              value={editForm.status}
              onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as "active" | "inactive" }))}
            >
              <MenuItem value="active">פעיל</MenuItem>
              <MenuItem value="inactive">לא פעיל</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditId(null)} variant="outlined">
            ביטול
          </Button>
          <Button onClick={saveEdit} variant="contained" color="success">
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      {/* מחיקה */}
      <Dialog open={deleteId != null} onClose={() => setDeleteId(null)}>
        <DialogTitle>מחיקת הודעה</DialogTitle>
        <DialogContent>האם למחוק את ההודעה?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} variant="outlined">
            ביטול
          </Button>
          <Button onClick={doDelete} variant="contained" color="error">
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={2000}
        onClose={() => setSnack({ open: false, message: "" })}
        message={snack.message}
      />
    </Container>
  );
}



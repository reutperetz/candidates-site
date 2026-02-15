// src/pages/AdminUsersNewPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import styles from "./AdminUsersNewPage.module.css";
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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, getSecondaryAuth } from "../firebase";

type UserRole = "admin" | "secretary" | "courses_manager";
type UserStatus = "active" | "blocked";

type SystemUser = {
  docId: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  updatedAt?: Timestamp;
};

type FormState = {
  fullName: string;
  email: string;
  role: string;
  status: string;
};

const emptyForm: FormState = {
  fullName: "",
  email: "",
  role: "",
  status: "",
};

const formatDateTimeIL = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getAuthCreateErrorMessage = (code: string) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "כתובת האימייל כבר קיימת ב-Authentication.";
    case "auth/operation-not-allowed":
      return "יש להפעיל התחברות עם אימייל/סיסמה ב-Firebase Authentication.";
    case "auth/invalid-email":
      return "האימייל שהוזן לא תקין.";
    case "auth/unauthorized-domain":
      return "הדומיין לא מורשה ב-Firebase Authentication.";
    case "auth/network-request-failed":
      return "בעיה ברשת. נסי שוב.";
    default:
      return `שגיאה ביצירת משתמש ב-Authentication (${code || "unknown"}). נסי שוב.`;
  }
};

const generateTempPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${out}!`;
};

const roleLabel = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "מנהל";
    case "secretary":
      return "מזכירות";
    case "courses_manager":
      return "רכז/ת קורסים";
    default:
      return role;
  }
};

const statusChip = (status: UserStatus) =>
  status === "active" ? (
    <Chip label="פעיל" color="success" size="small" />
  ) : (
    <Chip label="חסום" color="error" size="small" />
  );

const AdminUsersNewPage = () => {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [editTouched, setEditTouched] = useState<Record<string, boolean>>({});

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SystemUser | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "system_users"),
      (snap) => {
        const items: SystemUser[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as Partial<SystemUser>;
          return {
            docId: docSnap.id,
            fullName: String(data.fullName ?? ""),
            email: String(data.email ?? ""),
            role: (data.role ?? "admin") as UserRole,
            status: (data.status ?? "active") as UserStatus,
            updatedAt: data.updatedAt as Timestamp | undefined,
          };
        });

        items.sort((a, b) => {
          const at = a.updatedAt?.toMillis?.() ?? 0;
          const bt = b.updatedAt?.toMillis?.() ?? 0;
          return bt - at;
        });

        setUsers(items);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        roleLabel(u.role).toLowerCase().includes(q)
      );
    });
  }, [users, query]);

  const onChangeForm =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setFormTouched((prev) => ({ ...prev, [field]: true }));
    };

  const onChangeEdit =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
      setEditTouched((prev) => ({ ...prev, [field]: true }));
    };

  const formErrors = useMemo(() => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    const fullName = form.fullName.trim();
    const email = form.email.trim();

    if (!fullName) errors.fullName = "שדה חובה";
    else if (fullName.split(/\s+/).length < 2)
      errors.fullName = "יש להזין שם פרטי + משפחה";

    if (!email) errors.email = "שדה חובה";
    else if (!EMAIL_REGEX.test(email)) errors.email = "אימייל לא תקין";
    else if (users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
      errors.email = "אימייל חייב להיות ייחודי";

    if (!form.role) errors.role = "שדה חובה";
    if (!form.status) errors.status = "שדה חובה";

    return errors;
  }, [form, users]);

  const editErrors = useMemo(() => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    const fullName = editForm.fullName.trim();
    const email = editForm.email.trim();

    if (!fullName) errors.fullName = "שדה חובה";
    else if (fullName.split(/\s+/).length < 2)
      errors.fullName = "יש להזין שם פרטי + משפחה";

    if (!email) errors.email = "שדה חובה";
    else if (!EMAIL_REGEX.test(email)) errors.email = "אימייל לא תקין";
    else if (
      users.some(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.docId !== editDocId
      )
    )
      errors.email = "אימייל חייב להיות ייחודי";

    if (!editForm.role) errors.role = "שדה חובה";
    if (!editForm.status) errors.status = "שדה חובה";

    return errors;
  }, [editForm, editDocId, users]);

  const canSave = Object.keys(formErrors).length === 0;
  const canSaveEdit = Object.keys(editErrors).length === 0;

  const handleAddUser = async () => {
    setFormTouched({ fullName: true, email: true, role: true, status: true });
    if (!canSave) return;

    try {
      const tempPassword = generateTempPassword();
      const secondaryAuth = getSecondaryAuth();
      await createUserWithEmailAndPassword(
        secondaryAuth,
        form.email.trim(),
        tempPassword
      );

      try {
        await addDoc(collection(db, "system_users"), {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          role: form.role as UserRole,
          status: form.status as UserStatus,
          updatedAt: serverTimestamp(),
        });
      } catch {
        setSnack({ open: true, msg: "שגיאה בשמירת המשתמש במסד הנתונים." });
        return;
      }

      setForm(emptyForm);
      setFormTouched({});
      setSnack({
        open: true,
        msg: `המשתמש נשמר ונוצר גם ב-Authentication. סיסמה זמנית: ${tempPassword}`,
      });
      setTab(0);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      console.error("Auth create user failed:", err);
      const msg = getAuthCreateErrorMessage(code);
      setSnack({ open: true, msg });
    }
  };

  const openEdit = (user: SystemUser) => {
    setEditDocId(user.docId);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setEditTouched({});
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editDocId) return;
    setEditTouched({ fullName: true, email: true, role: true, status: true });
    if (!canSaveEdit) return;

    try {
      await updateDoc(doc(db, "system_users", editDocId), {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        role: editForm.role as UserRole,
        status: editForm.status as UserStatus,
        updatedAt: serverTimestamp(),
      });
      setEditOpen(false);
      setSnack({ open: true, msg: "העדכון נשמר בהצלחה" });
    } catch {
      setSnack({ open: true, msg: "שגיאה בעדכון. נסי שוב." });
    }
  };

  const openDelete = (user: SystemUser) => {
    setDeleteTarget(user);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, "system_users", deleteTarget.docId));
      setDeleteOpen(false);
      setSnack({ open: true, msg: "המשתמש נמחק בהצלחה" });
    } catch {
      setSnack({ open: true, msg: "שגיאה במחיקה. נסי שוב." });
    }
  };

  return (
    <Box dir="rtl">
      <Container maxWidth="lg" className={styles.page}>
        <Typography variant="h6" align="center" className={styles.pageTitle}>
          המחלקה למדעי המחשב
        </Typography>
        <Typography variant="body2" align="center" className={styles.pageSubtitle}>
          מערכת ניהול – משתמשי מערכת
        </Typography>

        <Paper elevation={3} className={styles.panel}>
          {isLoading && <LinearProgress className={styles.loadingBar} />}
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            centered
            className={styles.tabs}
          >
            <Tab label="רשימת משתמשים" />
            <Tab label="הוספת משתמש חדש" />
          </Tabs>

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
                <Typography variant="h5" className={styles.listTitle}>
                  רשימת משתמשים
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    className={styles.addButton}
                    onClick={() => setTab(1)}
                  >
                    הוספת משתמש חדש
                  </Button>

                  <TextField
                    size="small"
                    placeholder="חיפוש לפי שם/אימייל/תפקיד"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Stack>
              </Box>

              <Typography variant="body2" className={styles.countText}>
                מספר המשתמשים במערכת: {filtered.length}
              </Typography>

              <Paper elevation={0} className={styles.tablePaper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>פעולות</TableCell>
                      <TableCell>סטטוס</TableCell>
                      <TableCell>עודכן</TableCell>
                      <TableCell>תפקיד</TableCell>
                      <TableCell>אימייל</TableCell>
                      <TableCell>שם מלא</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((u) => (
                      <TableRow key={u.docId}>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<EditIcon fontSize="small" />}
                              onClick={() => openEdit(u)}
                            >
                              עריכה
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineIcon fontSize="small" />}
                              onClick={() => openDelete(u)}
                            >
                              מחיקה
                            </Button>
                          </Stack>
                        </TableCell>
                        <TableCell>{statusChip(u.status)}</TableCell>
                        <TableCell>
                          {u.updatedAt?.toDate ? formatDateTimeIL(u.updatedAt.toDate()) : "—"}
                        </TableCell>
                        <TableCell>{roleLabel(u.role)}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.fullName}</TableCell>
                      </TableRow>
                    ))}

                    {filtered.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" className={styles.emptyText}>
                            לא נמצאו תוצאות
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <Typography variant="h5" className={styles.formTitle}>
                הוספת משתמש חדש
              </Typography>

              <Typography variant="body2" className={styles.formSubtitle}>
                שדות חובה: שם מלא, אימייל, תפקיד, סטטוס.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="שם מלא"
                    value={form.fullName}
                    onChange={onChangeForm("fullName")}
                    error={!!formErrors.fullName && !!formTouched.fullName}
                    helperText={formTouched.fullName ? formErrors.fullName : "לדוגמה: דנה כהן"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="אימייל"
                    value={form.email}
                    onChange={onChangeForm("email")}
                    error={!!formErrors.email && !!formTouched.email}
                    helperText={formTouched.email ? formErrors.email : "name@mail.com"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="תפקיד"
                    value={form.role}
                    onChange={onChangeForm("role")}
                    error={!!formErrors.role && !!formTouched.role}
                    helperText={formTouched.role ? formErrors.role : " "}
                  >
                    <MenuItem value="">בחרי</MenuItem>
                    <MenuItem value="admin">מנהל</MenuItem>
                    <MenuItem value="secretary">מזכירות</MenuItem>
                    <MenuItem value="courses_manager">רכז/ת קורסים</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="סטטוס"
                    value={form.status}
                    onChange={onChangeForm("status")}
                    error={!!formErrors.status && !!formTouched.status}
                    helperText={formTouched.status ? formErrors.status : " "}
                  >
                    <MenuItem value="">בחרי</MenuItem>
                    <MenuItem value="active">פעיל</MenuItem>
                    <MenuItem value="blocked">חסום</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {!canSave && (
                <Box className={styles.infoBox}>
                  <Alert severity="info">יש למלא שדות חובה לפני שמירה.</Alert>
                </Box>
              )}

              <Box className={styles.formActions}>
                <Button
                  variant="contained"
                  color="success"
                  className={styles.primaryButton}
                  onClick={handleAddUser}
                  disabled={!canSave}
                >
                  שמירה
                </Button>
                <Button
                  variant="outlined"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setForm(emptyForm);
                    setFormTouched({});
                  }}
                >
                  ניקוי שדות
                </Button>
                <Button variant="text" className={styles.textButton} onClick={() => setTab(0)}>
                  חזרה לרשימה
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle className={styles.dialogTitle}>עריכת משתמש</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className={styles.dialogGrid}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="שם מלא"
                value={editForm.fullName}
                onChange={onChangeEdit("fullName")}
                error={!!editErrors.fullName && !!editTouched.fullName}
                helperText={editTouched.fullName ? editErrors.fullName : " "}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="אימייל"
                value={editForm.email}
                onChange={onChangeEdit("email")}
                error={!!editErrors.email && !!editTouched.email}
                helperText={editTouched.email ? editErrors.email : " "}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                required
                label="תפקיד"
                value={editForm.role}
                onChange={onChangeEdit("role")}
                error={!!editErrors.role && !!editTouched.role}
                helperText={editTouched.role ? editErrors.role : " "}
              >
                <MenuItem value="">בחרי</MenuItem>
                <MenuItem value="admin">מנהל</MenuItem>
                <MenuItem value="secretary">מזכירות</MenuItem>
                <MenuItem value="courses_manager">רכז/ת קורסים</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                required
                label="סטטוס"
                value={editForm.status}
                onChange={onChangeEdit("status")}
                error={!!editErrors.status && !!editTouched.status}
                helperText={editTouched.status ? editErrors.status : " "}
              >
                <MenuItem value="">בחרי</MenuItem>
                <MenuItem value="active">פעיל</MenuItem>
                <MenuItem value="blocked">חסום</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className={styles.dialogActions}>
          <Button onClick={() => setEditOpen(false)}>ביטול</Button>
          <Button variant="contained" color="success" onClick={saveEdit} disabled={!canSaveEdit}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle className={styles.dialogTitle}>מחיקת משתמש</DialogTitle>
        <DialogContent>
          <Typography>
            למחוק את המשתמש <b>{deleteTarget?.fullName}</b>?
          </Typography>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button onClick={() => setDeleteOpen(false)}>ביטול</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={2200}
        onClose={() => setSnack({ open: false, msg: "" })}
        message={snack.msg}
      />
    </Box>
  );
};

export default AdminUsersNewPage;





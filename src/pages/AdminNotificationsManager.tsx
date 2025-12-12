// src/pages/AdminNotificationsManager.tsx
import { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";

interface NotificationItem {
  id: number;
  title: string;
  content: string;
  time: string;
  status: "active" | "inactive";
  createdAt: string;
}

const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "פתיחת סמסטר",
    content: "השיעורים יחלו בתאריך 1.12",
    time: "12:42",
    createdAt: "30/11/2025",
    status: "active",
  },
];

export default function AdminNotificationsManager() {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }} dir="rtl">
      <Typography variant="h5" textAlign="center" fontWeight={700} color="success.main">
        המחלקה למדעי המחשב
      </Typography>

      <Typography variant="body2" textAlign="center" mb={3} color="text.secondary">
        מערכת ניהול – הודעות
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 3, p: 2, mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          textColor="success"
          indicatorColor="success"
        >
          <Tab label="📢 יצירת הודעה חדשה" />
          <Tab label="📄 רשימת הודעות" />
        </Tabs>
      </Paper>

      {tab === 0 && <CreateNotificationForm />}
      {tab === 1 && <NotificationsList />}
    </Container>
  );
}

/* יצירת הודעה */
function CreateNotificationForm() {
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={3}>
        יצירת הודעה חדשה
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
        <TextField fullWidth label="כותרת *" />
        <TextField fullWidth multiline rows={4} label="תוכן ההודעה *" />

        <TextField fullWidth label="סטטוס" select SelectProps={{ native: true }}>
          <option value="active">פעיל</option>
          <option value="inactive">לא פעיל</option>
        </TextField>

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button variant="text" color="success">
            ⬅ חזרה לרשימת הודעות
          </Button>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined">ביטול</Button>
            <Button variant="contained" color="success">
              שמירה
            </Button>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}

/* רשימת הודעות */
function NotificationsList() {
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      <Box display="flex" justifyContent="flex-start" mb={3}>
        <Button variant="contained" startIcon={<AddIcon />} color="success">
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
          {mockNotifications.map((n) => (
            <TableRow key={n.id}>
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
  );
}

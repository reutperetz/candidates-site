// src/pages/AdminFaqManager.tsx
import { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type FaqStatus = "active" | "inactive";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  status: FaqStatus;
  createdAt: string;
}

// נתוני דמה – רק כדי שהטבלה תיראה כמו בדוגמא
const mockFaqs: FaqItem[] = [
  {
    id: 1,
    question: "איך אני יודע אם כל המסמכים התקבלו?",
    answer:
      "ניתן לבדוק את סטטוס ההרשמה בכל רגע מתוך אזור 'הוואר אישי' במערכת המועמדים.",
    status: "active",
    createdAt: "30/11/2025",
  },
];

const statusChip = (status: FaqStatus) =>
  status === "active" ? (
    <Chip label="פעיל" color="success" size="small" />
  ) : (
    <Chip label="לא פעיל" size="small" />
  );

export default function AdminFaqManager() {
  const [tab, setTab] = useState(0);

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
          מערכת ניהול – שאלות נפוצות
        </Typography>

        {/* טאבים */}
        <Paper elevation={3} sx={{ borderRadius: 3, p: 2, mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            centered
            textColor="success"
            indicatorColor="success"
            sx={{ "& .MuiTab-root": { fontWeight: 600 } }}
          >
            <Tab label="רשימת שאלות נפוצות" />
            <Tab label="יצירת שאלה נפוצה חדשה" />
          </Tabs>
        </Paper>

        {tab === 0 && <FaqList onAddClick={() => setTab(1)} />}
        {tab === 1 && <FaqCreateForm onBackClick={() => setTab(0)} />}
      </Container>
    </Box>
  );
}

/* -------- טאב רשימת שאלות -------- */

function FaqList({ onAddClick }: { onAddClick: () => void }) {
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Box
        mb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5" fontWeight={600}>
          רשימת שאלות נפוצות
        </Typography>

        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 999 }}
          onClick={onAddClick}
        >
          יצירת שאלה
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        מספר השאלות במערכת: {mockFaqs.length}
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
              <TableCell>תאריך יצירה</TableCell>
              <TableCell>תשובה</TableCell>
              <TableCell>שאלה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockFaqs.map((item) => (
              <TableRow key={item.id}>
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
                <TableCell>{statusChip(item.status)}</TableCell>
                <TableCell>{item.createdAt}</TableCell>
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
  );
}

/* -------- טאב יצירת שאלה -------- */

function FaqCreateForm({ onBackClick }: { onBackClick: () => void }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<FaqStatus>("active");

  const handleSave = () => {
    // כאן בעתיד אפשר להוסיף שמירה לשרת.
    console.log("save FAQ", { question, answer, status });
    onBackClick();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        יצירת שאלה נפוצה חדשה
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        מלאי את שאלתך והתשובה שתופיע למועמדים.
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
        <TextField
          label="שאלה *"
          multiline
          minRows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          fullWidth
        />

        <TextField
          label="תשובה *"
          multiline
          minRows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
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

        <Box
          mt={2}
          display="flex"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Button variant="text" color="success" onClick={onBackClick}>
            ⬅ חזרה לרשימת שאלות
          </Button>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined">ביטול</Button>
            <Button variant="contained" color="success" onClick={handleSave}>
              שמירה
            </Button>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}

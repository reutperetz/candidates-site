// src/pages/HelpPage.tsx
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  Button,
  Stack,
} from "@mui/material";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

type FaqItem = {
  docId: string;
  question: string;
  answer: string;
  status?: string;
};

type FaqDoc = Omit<FaqItem, "docId">;


function HelpPage() {
  // רשימת השאלות לדוגמא – אפשר לערוך טקסטים חופשי
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "faqs"));
        const items: FaqItem[] = snap.docs.map((d) => {
          const data = d.data() as Partial<FaqDoc>;
          return {
            docId: d.id,
            question: String(data.question ?? ""),
            answer: String(data.answer ?? ""),
            status: data.status ?? "active",
          };
        });
        const visible = items.filter((item) => item.status !== "inactive");
        if (active) setFaqs(visible);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);


  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }} dir="rtl">
      {/* כותרת עליונה */}
      <Box textAlign="center" mb={4}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: "success.main", fontWeight: 700, mb: 1 }}
        >
          עזרה למועמדים – Help
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 800, mx: "auto" }}>
          מסך זה מרכז שאלות ותשובות נפוצות לגבי תהליך ההרשמה, תנאי הקבלה
          ומבנה התואר. ניתן לפתוח כל שאלה לקבלת פירוט נוסף.
        </Typography>
      </Box>

      {/* כרטיס ראשי של שאלות נפוצות */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: 2,
          borderTop: "4px solid",
          borderTopColor: "success.main",
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <HelpOutlineIcon sx={{ color: "success.main" }} />
              <Typography variant="h6" fontWeight={600}>
                שאלות נפוצות למועמדים
              </Typography>
            </Box>

            <Chip
              label={`סה"כ ${faqs.length} שאלות`}
              size="small"
              sx={{ bgcolor: "success.light", color: "success.main" }}
            />
          </Box>

          {/* רשימת האקורדיונים של השאלות */}
          {faqs.map((faq, index) => (
            <Accordion
              key={faq.docId}
              disableGutters
              elevation={0}
              sx={{
                mb: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "success.main" }} />}
                sx={{
                  minHeight: 48,
                  "& .MuiAccordionSummary-content": {
                    alignItems: "center",
                    gap: 1.5,
                  },
                }}
              >
                {/* "עיגול" עם מספר השאלה, כמו בויירפריים */}
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: "success.light",
                    color: "success.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    ml: 1,
                  }}
                >
                  {index + 1}
                </Box>

                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 0, pb: 2, px: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* פס ירוק בתחתית: "לא מצאת תשובה?" */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: 4,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
          color: "success.contrastText",
          maxWidth: 900,
          mx: "auto",
          mt: 4,
        }}
      >
        <CardContent
          sx={{
            py: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box textAlign="right">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              לא מצאת תשובה?
            </Typography>
            <Typography variant="body2">
              ניתן לפנות למזכירות המחלקה בטלפון או במייל המופיעים באתר
              הרשמי של המכללה.
            </Typography>
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChatBubbleOutlineIcon sx={{ fontSize: 26 }} />
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          mt: 3,
          borderRadius: 3,
          boxShadow: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            קישורים מהירים
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            מעבר מהיר למסכים מרכזיים במערכת.
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button variant="contained" color="success" onClick={() => navigate("/forms")}>
              טפסים
            </Button>
            <Button variant="outlined" color="success" onClick={() => navigate("/admission-requirements")}>
              תנאי קבלה
            </Button>
            <Button variant="outlined" color="success" onClick={() => navigate("/courses")}>
              קורסים
            </Button>
            <Button variant="outlined" color="success" onClick={() => navigate("/study-tracks")}>
              מסלולי לימוד
            </Button>
          </Stack>

        </CardContent>
      </Card>
    </Container>
  );
}

export default HelpPage;

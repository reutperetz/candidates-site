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
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import styles from "./HelpPage.module.css";

type FaqItem = {
  docId: string;
  question: string;
  answer: string;
  status?: string;
};

type FaqDoc = Omit<FaqItem, "docId">;

function HelpPage() {
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
    <Container maxWidth="lg" className={styles.container} dir="rtl">
      <Box className={styles.hero}>
        <Typography variant="h4" component="h1" className={styles.heroTitle}>
          עזרה למועמדים – Help
        </Typography>
        <Typography variant="body1" className={styles.heroSubtitle}>
          מסך זה מרכז שאלות ותשובות נפוצות לגבי תהליך ההרשמה, תנאי הקבלה
          ומבנה התואר. ניתן לפתוח כל שאלה לקבלת פירוט נוסף.
        </Typography>
      </Box>

      <Card className={styles.faqCard}>
        <CardContent className={styles.faqCardContent}>
          {isLoading && <LinearProgress className={styles.progress} />}
          <Box className={styles.faqHeader}>
            <Box className={styles.faqHeaderLeft}>
              <HelpOutlineIcon className={styles.iconSuccess} />
              <Typography variant="h6" fontWeight={600}>
                שאלות נפוצות למועמדים
              </Typography>
            </Box>

            <Chip
              label={`סה"כ ${faqs.length} שאלות`}
              size="small"
              className={styles.chip}
            />
          </Box>

          {faqs.map((faq, index) => (
            <Accordion
              key={faq.docId}
              disableGutters
              elevation={0}
              className={styles.accordion}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon className={styles.iconSuccess} />}
                className={styles.accordionSummary}
              >
                <Box className={styles.questionIndex}>{index + 1}</Box>

                <Typography variant="body1" className={styles.questionText}>
                  {faq.question}
                </Typography>
              </AccordionSummary>

              <AccordionDetails className={styles.accordionDetails}>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      <Card className={styles.helpBanner}>
        <CardContent className={styles.helpBannerContent}>
          <Box className={styles.helpBannerText}>
            <Typography variant="h6" className={styles.helpBannerTitle}>
              לא מצאת תשובה?
            </Typography>
            <Typography variant="body2">
              ניתן לפנות למזכירות המחלקה בטלפון או במייל המופיעים באתר הרשמי
              של המכללה.
            </Typography>
          </Box>

          <Box className={styles.helpBannerIcon}>
            <ChatBubbleOutlineIcon className={styles.helpBannerChatIcon} />
          </Box>
        </CardContent>
      </Card>

      <Card className={styles.quickLinksCard}>
        <CardContent>
          <Typography variant="h6" className={styles.quickLinksTitle}>
            קישורים מהירים
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            className={styles.quickLinksSubtitle}
          >
            מעבר מהיר למסכים מרכזיים במערכת.
          </Typography>
          <Box className={styles.quickLinksButtons}>
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate("/forms")}
            >
              טפסים
            </Button>
            <Button
              variant="outlined"
              color="success"
              onClick={() => navigate("/admission-requirements")}
            >
              תנאי קבלה
            </Button>
            <Button
              variant="outlined"
              color="success"
              onClick={() => navigate("/courses")}
            >
              קורסים
            </Button>
            <Button
              variant="outlined"
              color="success"
              onClick={() => navigate("/study-tracks")}
            >
              מסלולי לימוד
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default HelpPage;

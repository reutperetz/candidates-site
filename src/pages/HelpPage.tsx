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
} from "@mui/material";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

function HelpPage() {
  // רשימת השאלות לדוגמא – אפשר לערוך טקסטים חופשי
  const faqs = [
    {
      id: 1,
      question: "מהו תהליך ההרשמה לתואר?",
      answer:
        "ממלאים טופס הרשמה באתר, מצרפים מסמכים רלוונטיים (תעודת זהות, גיליון ציונים וכו'), ומשלמים את אגרת ההרשמה. לאחר מכן מזכירות המחלקה תיצור קשר במידה ונדרש מידע נוסף.",
    },
    {
      id: 2,
      question: "מהם תנאי הקבלה העיקריים?",
      answer:
        "תנאי הקבלה מתבססים על ציון פסיכומטרי, ממוצע בגרות ויחידות לימוד במתמטיקה ובאנגלית. את הספים המדויקים ניתן לראות במסך 'תנאי קבלה' במערכת.",
    },
    {
      id: 3,
      question: "כמה זמן נמשך התואר?",
      answer:
        "משך הלימודים המלא הוא בדרך-כלל שלוש שנים אקדמיות (שישה סמסטרים), עם אפשרות להארכה במידת הצורך בהתאם לעומס הקורסים.",
    },
    {
      id: 4,
      question: "האם ניתן לעבוד במקביל ללימודים?",
      answer:
        "כן, חלק גדול מהסטודנטים משלב עבודה חלקית יחד עם הלימודים. מומלץ לתכנן מערכת שעות מאוזנת ולא לקחת עומס קורסים גבוה במיוחד בסמסטר הראשון.",
    },
    {
      id: 5,
      question: "האם קיים מסלול ערב?",
      answer:
        "במידה והמחלקה מציעה מסלול ערב – ניתן לראות פרטים מלאים, ימים ושעות במסך הקורסים ובמידע הרשמי של המכללה.",
    },
    {
      id: 6,
      question: "מה כוללת תכנית הלימודים?",
      answer:
        "הלימודים כוללים קורסי יסוד במתמטיקה ומדעי המחשב, קורסי תשתית נוספים, וקורסי בחירה בתחומים מתקדמים. פירוט מלא של כל קורס מופיע במסך הקורסים.",
    },
    {
      id: 7,
      question: "מתי מתחיל הסמסטר?",
      answer:
        "תאריכי פתיחת הסמסטרים משתנים משנה לשנה. ניתן לראות את התאריכים המעודכנים בלוח האקדמי של המכללה ובמסך ההודעות.",
    },
    {
      id: 8,
      question: "האם יש תמיכה לסטודנטים מתקשים?",
      answer:
        "כן. קיימים מרכזי תמיכה, תגבורים ושעות קבלה של המרצים. ניתן למצוא את הפרטים במסך העזרה או באתר הרשמי של המכללה.",
    },
    {
      id: 9,
      question: "האם אפשר לעבור ממסלול בוקר למסלול ערב?",
      answer:
        "ברוב המקרים ניתן להגיש בקשה לשינוי מסלול דרך מזכירות המחלקה, בכפוף למקום פנוי ולעמידה בדרישות האקדמיות.",
    },
    {
      id: 10,
      question: "כיצד מתבצעת בדיקת סיכויי הקבלה?",
      answer:
        "בדיקת סיכוי הקבלה מבוססת על הזנת ציונים אישיים במערכת, והשוואתם לספי הקבלה המעודכנים. הכלי מאפשר לקבל הערכה ראשונית בלבד ואינו מחליף תשובה רשמית ממדור הרישום.",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }} dir="rtl">
      {/* כותרת עליונה */}
      <Box textAlign="center" mb={4}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: "#2e7d32", fontWeight: 700, mb: 1 }}
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
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderTop: "4px solid #2e7d32",
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <HelpOutlineIcon sx={{ color: "#2e7d32" }} />
              <Typography variant="h6" fontWeight={600}>
                שאלות נפוצות למועמדים
              </Typography>
            </Box>

            <Chip
              label={`סה"כ ${faqs.length} שאלות`}
              size="small"
              sx={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}
            />
          </Box>

          {/* רשימת האקורדיונים של השאלות */}
          {faqs.map((faq) => (
            <Accordion
              key={faq.id}
              disableGutters
              elevation={0}
              sx={{
                mb: 1,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#2e7d32" }} />}
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
                    backgroundColor: "#e8f5e9",
                    color: "#2e7d32",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    ml: 1,
                  }}
                >
                  {faq.id}
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
          boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
          background: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
          color: "white",
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
    </Container>
  );
}

export default HelpPage;

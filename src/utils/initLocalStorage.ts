// src/utils/initLocalStorage.ts

export function initLocalStorage() {
  /* ===== מועמדים ===== */
  if (!localStorage.getItem("candidates")) {
    const candidates = Array.from({ length: 10 }, (_, i) => ({
      id: `30000000${i}`,
      fullName: `מועמד ${i + 1}`,
      psychometric: 600 + i * 5,
      bagrutAverage: 80 + i,
      preferredTrack: i % 2 === 0 ? "בוקר" : "ערב",
      status: "pending",
    }));
    localStorage.setItem("candidates", JSON.stringify(candidates));
  }

  /* ===== קורסים ===== */
  if (!localStorage.getItem("courses")) {
    const courses = Array.from({ length: 10 }, (_, i) => ({
      code: `CS10${i}`,
      name: `קורס דמה ${i + 1}`,
      type: i % 2 === 0 ? "חובה" : "בחירה",
      year: ["א", "ב", "ג"][i % 3],
      semester: ["א", "ב"][i % 2],
      points: 3,
      status: "active",
    }));
    localStorage.setItem("courses", JSON.stringify(courses));
  }

  /* ===== תנאי קבלה ===== */
  if (!localStorage.getItem("admissionRequirements")) {
    const requirements = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      track: `מסלול ${String.fromCharCode(65 + i)}`,
      minPsycho: 600 + i * 5,
      minAverage: 85,
      minMath: 80,
      status: "active",
    }));
    localStorage.setItem("admissionRequirements", JSON.stringify(requirements));
  }

  /* ===== הודעות ===== */
  if (!localStorage.getItem("notifications")) {
    const notifications = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `הודעה ${i + 1}`,
      content: "תוכן הודעת דמה",
      status: "active",
      createdAt: new Date().toLocaleDateString(),
      time: "12:00",
    }));
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }

  /* ===== שאלות נפוצות ===== */
  if (!localStorage.getItem("faqs")) {
    const faqs = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      question: `שאלה נפוצה ${i + 1}?`,
      answer: "זוהי תשובת דמה לשאלה.",
      status: "active",
      createdAt: new Date().toLocaleDateString(),
    }));
    localStorage.setItem("faqs", JSON.stringify(faqs));
  }
}

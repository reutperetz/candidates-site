# Candidates Site – Frontend Project

Frontend system for managing candidates and academic data  
for the Computer Science Department.

---

## Project Overview

The project is a frontend management system that allows administrators to manage:

- Courses
- Admission requirements
- FAQs
- Candidates

The system is implemented according to the course requirements and focuses on
clean architecture, usability, and integration with Firebase Firestore.

---

## Technologies

- React + TypeScript
- Vite
- Material UI (Theming)
- Firebase Firestore
- React Router

---

## Main Features

- Light / Dark mode implemented using Material UI ThemeProvider
- Responsive design
  - Admin screens are available on desktop only
  - A dedicated message is shown on smaller screens
- Full CRUD operations (Create, Read, Update, Delete) using Firestore
- No local data persistence (all data is managed via Firestore)
- Loading indicators (LinearProgress) during Firestore data fetching
- Direct routing using React Router and useParams

---

## Admin Routes

- `/admin/courses`
- `/admin/courses/:courseId`

Example:
http://localhost:5173/admin/courses/ckXHT1tqdQKD9ZWzMrtd

The `courseId` is read from the URL using `useParams`.  
If the ID does not exist, an appropriate error message is displayed.

---

## Environment Variables

The project uses environment variables for Firebase configuration.

Environment files:

- `.env.development`
- `.env.production`
- `.env.local`

Firebase configuration values are accessed using:
import.meta.env.VITE\_...

## Running the Project Locally

```bash
npm install
npm run dev

```

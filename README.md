# Gram-Suvidha AI 🌾

[![React 19](https://img.shields.io/badge/Frontend-React%2019-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js Express](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-forestgreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)

Gram-Suvidha AI is an intelligent, secure, full-stack smart governance web application designed to modernize rural governance. It streamlines Gram Panchayat administration, empowers rural citizens, and automates tracking and scheme applications under a beautiful, unified dark glassmorphic design system.

---

## 📌 Table of Contents
1. [Key Features](#-key-features)
2. [System Architecture](#%EF%B8%8F-system-architecture)
3. [Technology Stack](#%EF%B8%8F-technology-stack)
4. [Project Directory Structure](#-project-directory-structure)
5. [Database & Environment Variables Reference](#-database--environment-variables-reference)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Setup & Installation Guide](#%EF%B8%8F-setup--installation-guide)
8. [Authors & Contributors](#-authors--contributors)

---

## 🌟 Key Features

### 👤 Role-Based Access Control (RBAC) & Hardened Security
*   **Citizen Portal**: Verify registration credentials via secure OTPs, browse government schemes, test eligibility, register complaints, track resolution timelines, pay taxes, and view panchayat budget distributions.
*   **Administrative Portal**: Detailed visual analytics of panchayat status, village-specific citizen counts, priority-based complaint queues, scheme application approvals, tax ledger audits, and field worker task assignment.
*   **Secure Authentication**: Stripped out the developer sandbox bypass panel and removed dead password recovery links, locking user onboarding to validated routes.

### ✉️ Nodemailer Delivery & Test Account Fallback
*   Robust email verification flow via SMTP/Nodemailer using your custom credentials.
*   **Developer Fallback**: Automatically creates temporary **Ethereal Mail** SMTP test credentials if local SMTP configurations are missing. It sends the welcome cards and OTP links seamlessly, outputting the Ethereal message preview URL in the terminal console.
*   Panchayat budgets and meeting minute logs automatically broadcast email notifications to all registered citizen profiles.

### 📍 OpenStreetMap Geocoding
*   Reverse-geocoding coordinates directly into English addresses using Nominatim OpenStreetMap API on complaints.
*   Responsive OpenStreetMap map frames embedded on registration forms and admin details layout modals.

### 💎 Modern Glassmorphic Design System & Responsive Layouts
*   **Global Inputs Uniformity**: All input boxes (`text`, `number`, `tel`, `email`, `password`), textareas, and select tags are styled globally in `index.css` with a sleek dark glassmorphism theme (`bg-[#0F4B70]/30 border border-[#C4F8FF]/15 text-[#C4F8FF] rounded-xl`).
*   **Responsive Viewport Aligned Overlays**: The live community notifications dropdown is mobile-optimized to auto-align relative to the viewport window (`fixed top-16 left-4 right-4`) on small screens, preventing clips and scrolls, while folding back to clean absolute layouts on desktop.
*   **Icon Spacing & Column Grids**: Dashboard metrics cards use flexible, mobile-friendly columns (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4`). Profile icons align to the top of edit fields (`items-start pt-1`) for consistent alignment.
*   **Contiguous List Rendering**: Formats lines starting with `•` (like scheme rules and requirements) by grouping contiguous rows into a single `<ul>` element, preventing list bullet misalignments from CSS resets.

### ⚡ Route Lazy Loading & Bundle Performance
*   Optimized bundle delivery by refactoring core routers using `React.lazy` and `React.Suspense` fallback frames. This partitions page components into small chunks, slashing initial load times and eliminating transition lag.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Citizen[Citizen User] -->|1. Request OTP| API[Express API Server]
    API -->|2. Send Greeting OTP Email| SMTP[SMTP / Ethereal Fallback]
    Citizen -->|3. Register with OTP| API
    API -->|4. Save User| MongoDB[(MongoDB Atlas)]
    Citizen -->|5. Submit Complaint with GPS| API
    API -->|6. Geocoding / Address| OSM[OpenStreetMap API]
    API -->|7. Real-time Analytics| Admin[Admin Dashboard]
    API -->|8. Store Complaint| MongoDB
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, Tailwind CSS 3, Recharts, Lucide Icons, React Router 7 |
| **Backend** | Node.js, Express, Nodemailer, MongoDB Driver |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Deployment** | Vercel Serverless Configurations |

---

## 📂 Project Directory Structure

```
Gram/
├── README.md                 # Project documentation
├── backend/                  # Node.js / Express API Server
│   ├── server.js             # API entrypoint
│   ├── clear_db.js           # Database wipe database utility script
│   ├── package.json          # Node dependencies & start scripts
│   ├── routes/               # API route definitions (auth, complaints, schemes, budget, meetings, taxes)
│   ├── models/               # MongoDB models (User, Complaint, OTP, Scheme, Budget, Meeting, PropertyTax)
│   └── utils/                # Helper utilities (Nodemailer sendEmail)
└── frontend/                 # React SPA Client UI
    ├── package.json          # Vite configurations & plugins
    ├── vite.config.js        # Vite compilation configuration
    ├── index.html            # Main HTML wrapper
    └── src/
        ├── main.jsx          # Frontend entry point
        ├── App.jsx           # Lazy routing & Suspense configuration
        ├── components/       # Visual components (Sidebar, Chatbot)
        ├── context/          # State management (Language, Authentication)
        ├── layouts/          # Dashboards layout shell
        └── pages/            # Feature pages (CitizenDashboard, AdminDashboard, SignUp)
```

---

## 🔑 Database & Environment Variables Reference

### Backend Configurations (`backend/.env`)
Create a file named `.env` in the `backend/` directory:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for generating auth tokens | `f4d9f0d4d7c6b6f8c1f9e7a2b5d8e4f1a7...` |
| `SMTP_HOST` | Outgoing SMTP mail server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP connection port | `587` |
| `SMTP_USER` | Email username for verification mails | `example@gmail.com` |
| `SMTP_PASS` | App password (not regular account password) | `tcfg qnvp hbzm ldwp` |

---

## 🔌 API Endpoints Reference

### Authentication Routes (`/api/auth`)
*   `POST /send-otp` : Requests verification OTP.
*   `POST /register` : Registers user and checks OTP code.
*   `POST /login` : Authenticates users, returns JWT and user metadata.
*   `GET /profile` & `PUT /profile` : Views and updates user profile data.

### Complaints Routes (`/api/complaints`)
*   `POST /` : Submit a new complaint (saves coordinates, geocodes, assigns severity, saves to DB).
*   `GET /` : Fetch all complaints (Admin) or specific user complaints (Citizen).
*   `PUT /:id/status` : Update complaint status and assigned worker.

### Schemes Routes (`/api/schemes`)
*   `GET /` : Fetch all government scheme listings.
*   `POST /apply` : Submit a citizen scheme application with documents.
*   `GET /applications` : Fetch submitted scheme registry lists.

---

## 🚀 Setup & Installation Guide

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Git](https://git-scm.com/)

---

### 1. Database Wipe (Optional)
If you want to completely reset the database to a blank slate, run the database wipe script:
```bash
cd backend
node clear_db.js
```

### 2. Backend API Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Add your `.env` variables as specified in the [Environment Reference](#backend-configurations-backendenv).
4. Start the Express development server:
   ```bash
   npm start
   ```

---

### 3. Frontend App Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install client-side dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Access the web application at: **`http://localhost:5173`**

---

## 👥 Authors & Contributors

*   **Shreeraksha R Deshpande** - [@deshpande-shreeraksha](https://github.com/deshpande-shreeraksha)
*   **Ashwini Rati** - [@ashwini-rati](https://github.com/Ashwinirati)

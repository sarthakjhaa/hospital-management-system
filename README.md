# Hospital Management System (HMS)

> **Academic Demonstration Project** • B.Tech CSE 5th Semester • Software Engineering Laboratory Project (Practicals 1–6)

---

## 1. Executive Overview
The **Hospital Management System (HMS)** is a comprehensive, full-stack, multi-role web platform designed to digitize healthcare facilities. It seamlessly connects clinical operations, patient management, doctor scheduling, symptom matching, Electronic Health Records (EHR), digital prescriptions, pharmacy inventory, online medicine ordering, billing, safe DEMO payments, and administrative analytics.

---

## 2. Key Features

- **6 Role-Based Portals**: Scoped dashboards and permissions for `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PHARMACIST`, and `PATIENT`.
- **Smart Doctor Finder & Symptom Matcher**: Natural language symptom matching to recommend specialists and available time slots.
- **Appointment Scheduling**: Double-booking protection with atomic concurrency control using Prisma `$transaction`.
- **Electronic Health Records (EHR)**: Clinical diagnoses, treatment notes, lab results, and digital prescriptions.
- **Pharmacy & Stock Inventory**: Real-time inventory tracking, low-stock ($\le 30$) & near-expiry alerts, and online medicine orders.
- **Billing & Invoicing**: Automated consultation & pharmacy bill generation with itemized charges and 5% tax.
- **Safe DEMO Payment Gateway**: Simulated UPI (`student@demo`), Masked Card (`**** **** **** 1234`), and Wallet payments with server-side price authority and printable receipts.
- **Executive Telemetry & Reports**: Dynamic database-backed metrics, CSV export, and print capabilities.
- **Notification System**: DB-backed notification alert bell with unread counters and mark-read controls.

---

## 3. Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Server Route Handlers (`/api/...`)
- **Database**: MySQL (`hms_db`)
- **ORM**: Prisma ORM 5.22
- **Authentication**: Stateless JWT Cookies (`jose`) & bcrypt password hashing
- **Validation**: Zod Schemas (`lib/validations.ts`)

---

## 4. System User Roles & Demo Credentials

| Role | Name | Email | Password | Pre-filled Quick Login |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Executive Admin | `admin@hms.com` | `Password@123` | `/login?email=admin@hms.com` |
| **DOCTOR** | Dr. Sarah Jenkins | `sarah.jenkins@hms.com` | `Password@123` | `/login?email=sarah.jenkins@hms.com` |
| **NURSE** | Nurse Clara Barton | `nurse.clara@hms.com` | `Password@123` | `/login?email=nurse.clara@hms.com` |
| **RECEPTIONIST** | John Reception | `receptionist.john@hms.com` | `Password@123` | `/login?email=receptionist.john@hms.com` |
| **PHARMACIST** | Alex Pharmacist | `pharmacist.alex@hms.com` | `Password@123` | `/login?email=pharmacist.alex@hms.com` |
| **PATIENT** | Alice Smith | `patient.alice@hms.com` | `Password@123` | `/login?email=patient.alice@hms.com` |

---

## 5. Main Application Routes

### Public Routes
- `/`: Public landing page with Hero, Features, Workflow, Role Portals & Academic Disclaimer
- `/login`: Portal login page with Quick Role Switcher
- `/register`: Patient registration page
- `/unauthorized`: Access denial screen

### Patient Routes
- `/patient/dashboard`: Patient dashboard overview
- `/patient/doctors`: Doctor finder & symptom matching
- `/patient/appointments`: Appointment booking & status tracking
- `/patient/medical-records`: Electronic Health Records history
- `/patient/prescriptions`: Digital doctor prescriptions
- `/patient/pharmacy`: Medicine store & online cart
- `/patient/orders`: Medicine order history
- `/patient/bills` & `/patient/bills/[id]`: Invoices & detailed statement
- `/patient/payments`: Payment ledger & receipt printing

### Doctor & Clinical Routes
- `/doctor/dashboard`: Doctor schedule, consultation list, EHR creation & prescription builder
- `/nurse/dashboard`: In-patient ward beds & assigned patient status
- `/receptionist/dashboard`: Walk-in patient registration & desk billing

### Pharmacist Routes
- `/pharmacist/dashboard`: Inventory overview & order queue
- `/pharmacist/inventory`: Medicine catalog management & stock alerts
- `/pharmacist/orders`: Order processing & status fulfillment

### Administrative Routes
- `/admin/dashboard`: Real-time system telemetry
- `/admin/patients`: Patient management
- `/admin/doctors`: Doctor onboarding & specialty management
- `/admin/departments`: Department management
- `/admin/appointments`: Appointment management
- `/admin/medical-records`: EHR audit view
- `/admin/pharmacy`: Global inventory control
- `/admin/orders`: Medicine order overview
- `/admin/billing`: Invoicing control center
- `/admin/payments`: Transaction ledger
- `/admin/reports`: Executive reporting & CSV/Print exports
- `/admin/users`, `/admin/audit-logs`, `/admin/settings`, `/admin/profile`

---

## 6. Installation & Local Setup

### Prerequisites
- Node.js (v18+ or v20+)
- MySQL Server (v8.0+)

### Step 1: Clone & Install Dependencies
```bash
cd hospital-management-system
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env` and configure your local MySQL credentials:
```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
DATABASE_URL="mysql://root:YourPassword@localhost:3306/hms_db"
JWT_SECRET="hms_super_secret_jwt_key_btech_cse_2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Database Schema Migration & Seeding
```bash
# Push schema to local MySQL
npx prisma db push

# Seed academic demo dataset
npx prisma db seed
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 7. Production Build & Verification Commands

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run Next.js production build
npx next build --webpack

# Start production server
npm run start
```

---

## 8. Security Architecture & Protections

- **Server-Side RBAC**: Route handlers enforce `requireRole()` and session role checks server-side.
- **IDOR Prevention**: Server validates resource ownership (`patientId === session.patientProfileId`) directly from authenticated session tokens.
- **Atomic Concurrency**: Transactions (`$transaction`) lock doctor schedules and medicine stock during concurrent requests.
- **Sensitive Data Masking**: Credit card numbers and CVV codes are never stored in the database or logs.

---

## 9. Comprehensive Documentation Index

For detailed technical references, refer to the `docs/` folder:
- [System Architecture](docs/ARCHITECTURE.md) (`docs/ARCHITECTURE.md`)
- [Database Schema & ERD](docs/DATABASE.md) (`docs/DATABASE.md`)
- [Verification & Testing Report](docs/TESTING.md) (`docs/TESTING.md`)
- [College Lab Demo Guide](docs/DEMO.md) (`docs/DEMO.md`)
- [Viva Voce Q&A Guide](docs/VIVA.md) (`docs/VIVA.md`)

---

## 10. Academic Disclaimer
*This Hospital Management System is an academic demonstration project. Medical information, prescriptions, payments and records shown in the system are fictional/demo data and should not be used for real medical decisions. Software Engineering Laboratory Project.*

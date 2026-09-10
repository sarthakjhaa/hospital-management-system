# Hospital Management System (HMS) — Viva Voce Preparation & Q&A Guide

## 1. Core Project Overview

### Q1: What is this project and what problem does it solve?
**Answer**: This project is a full-stack **Hospital Management System (HMS)** built for B.Tech CSE 5th Semester Software Engineering Laboratory. It digitizes hospital operations across 6 distinct user roles (`ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PHARMACIST`, `PATIENT`). It solves clinical workflow fragmentation by unifying patient registration, doctor scheduling, symptom-based doctor matching, appointment booking, Electronic Health Records (EHR), digital prescriptions, pharmacy stock inventory, automated invoicing, simulated payments, and executive analytics into a single database-backed platform.

### Q2: What technology stack is used in this application?
**Answer**: 
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons
- **Backend**: Next.js Server API Route Handlers (`/api/...`)
- **Database**: MySQL (`hms_db`)
- **ORM**: Prisma ORM 5.22
- **Authentication**: Stateless JWT Cookie Sessions (`jose`)
- **Validation**: Zod schema validation (`lib/validations.ts`)

---

## 2. Architecture & Tech Choice Justifications

### Q3: Why did you choose Next.js App Router?
**Answer**: Next.js App Router provides a unified full-stack architecture where frontend client components and backend API route handlers co-exist cleanly in TypeScript. It offers built-in server-side rendering (SSR), static page generation, automatic code splitting, layout nesting (`layout.tsx`), and robust API routing without needing a separate Express server setup.

### Q4: Why did you choose MySQL and Prisma ORM?
**Answer**: Healthcare applications require strong relational data integrity, foreign key constraints, and ACID transactions (e.g., preventing double-booked appointments or negative medicine stock). MySQL provides a reliable relational database engine, while Prisma ORM provides type-safe database queries, automated schema migrations, relation modeling, and declarative `$transaction` blocks.

---

## 3. Security, Auth & RBAC

### Q5: How is authentication implemented in the system?
**Answer**: Authentication is handled via stateless HTTP-only JWT cookies (`hms_token`). Upon login (`/api/auth/login`), the server verifies the email and bcrypt password hash, signs a JWT containing the user's `id`, `email`, `role`, and profile IDs using `jose`, and sets an HTTP-only cookie. On subsequent requests, `getSessionUser()` in `lib/auth.ts` decodes and verifies the token server-side.

### Q6: What is Role-Based Access Control (RBAC) and how is it enforced?
**Answer**: RBAC restricts route and API access based on assigned user roles (`ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PHARMACIST`, `PATIENT`). In our application, RBAC is enforced **server-side** using `requireRole()` in `lib/rbac.ts` and role guards inside API route handlers. Even if a user manually navigates to `/admin/reports` on the frontend, the server API rejects unauthorized requests with a `403 Forbidden` response.

### Q7: What is IDOR (Insecure Direct Object Reference) and how did you prevent it?
**Answer**: IDOR occurs when an application exposes a reference to an internal implementation object (like `/patient/bills/[id]`) without validating whether the authenticated user owns that resource. We prevented IDOR by enforcing **server-side ownership verification**:
```ts
if (session.role === Role.PATIENT && session.patientProfileId !== bill.patientId) {
  return NextResponse.json({ error: 'Access denied: You do not have authorization' }, { status: 403 });
}
```
The server derives the requester's identity directly from the authenticated session, never trusting user IDs sent in request bodies or URL parameters.

---

## 4. Clinical Features & Business Logic

### Q8: How does appointment booking work and how is double-booking prevented?
**Answer**: Appointment booking uses doctor weekly schedule definitions (`DoctorSchedule`) to calculate 30-minute available time slots (`lib/availability.ts`). To prevent double-booking under concurrent user access, `POST /api/appointments` wraps slot verification and creation in an **atomic database transaction** (`prisma.$transaction`). It checks whether an active appointment already exists for `(doctorId, date, timeSlot)`. If a conflict exists, the transaction aborts and returns `409 Conflict`.

### Q9: How does the Smart Symptom Matcher work? Is it a real medical diagnosis system?
**Answer**: The symptom matcher (`/api/doctors/recommend`) parses patient symptom text against a keyword-to-specialty mapping matrix (e.g., *"chest pain"* $\rightarrow$ Cardiology, *"skin rash"* $\rightarrow$ Dermatology, *"cough"* $\rightarrow$ Pulmonology). It ranks matching medical departments and recommends available doctors. It is strictly an academic demonstration tool and includes explicit disclaimers that it is not a certified diagnostic engine.

### Q10: How are Electronic Health Records (EHR) and prescriptions stored?
**Answer**: When a doctor completes a consultation, a `MedicalRecord` entity is created linked to `Appointment`, `PatientProfile`, and `DoctorProfile`. If medications are prescribed, a `Prescription` entity is created with itemized `PrescriptionItem` entries linked to the `Medicine` inventory table. The appointment status automatically transitions to `COMPLETED`.

---

## 5. Pharmacy, Billing & Payments

### Q11: How is pharmacy stock consistency maintained during order placement and cancellation?
**Answer**: Pharmacy order placement (`POST /api/orders`) uses Prisma `$transaction` to atomically verify medicine stock, create `MedicineOrder` and `MedicineOrderItem` records, auto-generate an invoice bill, and decrement inventory stock (`stock: { decrement: quantity }`). If an order is cancelled (`PATCH /api/orders/[id]`), another `$transaction` restores the exact medicine stock (`stock: { increment: quantity }`).

### Q12: How does billing and the DEMO payment gateway work?
**Answer**:
- **Consultation Invoices**: Auto-generated when an appointment is booked based on `DoctorProfile.consultationFee`.
- **Pharmacy Invoices**: Auto-generated when a medicine order is placed with itemized charges + 5% tax.
- **DEMO Payment Gateway**: Simulates payment via UPI (`student@demo`), Card (`**** **** **** 1234`), or Wallet. Payment amounts are re-calculated server-side to prevent price tampering. Upon successful simulation, `Bill.paymentStatus` updates to `PAID`, `MedicineOrder.status` updates to `DISPENSED`, and a printable receipt with a unique transaction ID (`TXN-DEMO-XXXXXX`) is generated.

---

## 6. Security, Testing & Future Improvements

### Q13: What security measures were taken for sensitive payment data?
**Answer**: Full credit card numbers and CVV codes are NEVER stored in the MySQL database, server logs, or JWT sessions. Card numbers are masked in the UI (`**** **** **** 1234`). All payment gateway flows are clearly marked as academic simulations.

### Q14: What future improvements could be added to this project?
**Answer**:
1. Integration with real payment gateway sandbox APIs (e.g. Razorpay/Stripe test mode).
2. Telemedicine video consultation links via WebRTC.
3. Automated email/SMS notification dispatch via SendGrid/Twilio.
4. Exporting medical records directly to PDF format using PDFKit/Puppeteer.

---

## 7. Academic Disclaimer
*This Hospital Management System is an academic demonstration project. Medical information, prescriptions, payments and records shown in the system are fictional/demo data and should not be used for real medical decisions. Software Engineering Laboratory Project.*

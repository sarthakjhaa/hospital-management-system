# Hospital Management System (HMS) — College Laboratory Demonstration Guide

## 1. Executive Demo Overview
This guide outlines a **step-by-step 10-minute presentation walkthrough** for evaluating the Hospital Management System in a college laboratory setting.

---

## 2. Seeded Demo User Credentials

| Role | Name | Email | Password | Pre-filled Quick Link |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Executive Admin | `admin@hms.com` | `Password@123` | `/login?email=admin@hms.com` |
| **DOCTOR** | Dr. Sarah Jenkins | `sarah.jenkins@hms.com` | `Password@123` | `/login?email=sarah.jenkins@hms.com` |
| **NURSE** | Nurse Clara Barton | `nurse.clara@hms.com` | `Password@123` | `/login?email=nurse.clara@hms.com` |
| **RECEPTIONIST** | John Reception | `receptionist.john@hms.com` | `Password@123` | `/login?email=receptionist.john@hms.com` |
| **PHARMACIST** | Alex Pharmacist | `pharmacist.alex@hms.com` | `Password@123` | `/login?email=pharmacist.alex@hms.com` |
| **PATIENT** | Alice Smith | `patient.alice@hms.com` | `Password@123` | `/login?email=patient.alice@hms.com` |

---

## 3. Step-by-Step Demonstration Flow

### Step 1: Public Landing Page (`/`)
1. Open `http://localhost:3000`.
2. Highlight the Hero section ("Smart, secure and efficient hospital management.").
3. Show the **System Features**, **6-Step Workflow**, and **Built for Every Hospital Role** sections.
4. Point out the clear **Academic Disclaimer Footer**.

### Step 2: Patient Journey — Doctor Search & Booking
1. Click **Patient Portal** card or navigate to `/login` (pre-filled with `patient.alice@hms.com`).
2. Log in and arrive at **Patient Dashboard** (`/patient/dashboard`).
3. Click **"Book Appointment"** or navigate to `/patient/appointments`.
4. Demonstrate **Smart Doctor Symptom Matching**:
   - Enter symptoms (e.g. *"Chest discomfort, shortness of breath"*).
   - Click **"Find Matching Specialist"**. System recommends **Cardiology / Dr. Sarah Jenkins**.
5. Select appointment date (e.g. `2026-09-15`) and click time slot `10:00 AM`.
6. Confirm booking. Point out the instant consultation fee bill (`INV-XXXX`) generation.

### Step 3: Doctor Clinical Journey — EHR & Prescriptions
1. Log out and log in as **DOCTOR** (`sarah.jenkins@hms.com`).
2. Arrive at **Doctor Dashboard** (`/doctor/dashboard`).
3. View **Today's Scheduled Appointments**. Locate Alice Smith's appointment.
4. Click **"Create EHR Record"**:
   - Enter Diagnosis: *"Acute Bronchitis & mild fever"*
   - Enter Treatment Plan: *"Prescribed antipyretic & antibiotic therapy. Advised 3 days rest."*
   - Add Prescribed Medicine: `Paracetamol 500mg` (Qty: `10`), `Amoxicillin 500mg` (Qty: `6`).
5. Save record. System marks appointment as `COMPLETED` and dispatches notification.

### Step 4: Patient Journey — EHR, Pharmacy Order & DEMO Payment
1. Log back in as **PATIENT** (`patient.alice@hms.com`).
2. View **Notification Bell** in top navbar — note *"New Medical Record Added"* alert.
3. Open **Medical History** (`/patient/medical-records`) to inspect the clinical record.
4. Open **Prescriptions** (`/patient/prescriptions`) and click **"Order Prescribed Medicines"**.
5. Cart pre-fills automatically. Confirm order placement — status set to `PENDING`.
6. Navigate to **Invoices & Bills** (`/patient/bills`).
7. Click **"Pay Now (DEMO)"** on the unpaid invoice:
   - Select **UPI Demo** (`student@demo`) or **Card Demo** (`**** **** **** 1234`).
   - Click **"Confirm Demo Payment"**.
8. View **Payment Successful** confirmation with Transaction ID `TXN-DEMO-XXXXXX`.
9. Click **"Print Receipt"** to demonstrate browser print modal.

### Step 5: Admin Analytics & Reports
1. Log in as **ADMIN** (`admin@hms.com`).
2. Arrive at **Admin Dashboard** (`/admin/dashboard`). Show 11 database metric cards.
3. Open **Administrative Reports** (`/admin/reports`):
   - Filter telemetry by period (**This Month**).
   - Open **Revenue Report** (`/admin/reports/revenue`) — show consultation vs. pharmacy breakdown.
   - Click **"Export CSV"** to demonstrate downloadable report file.
4. Attempt unauthorized cross-role access to demonstrate RBAC server-side block.

---

## 4. Academic Disclaimer
*This Hospital Management System is an academic demonstration project. Medical information, prescriptions, payments and records shown in the system are fictional/demo data and should not be used for real medical decisions. Software Engineering Laboratory Project.*

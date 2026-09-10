import { z } from 'zod';
import { Role, AppointmentStatus, OrderStatus, PaymentMethod } from '@prisma/client';

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  age: z.number().int().min(1).max(120),
  gender: z.enum(['Male', 'Female', 'Other']),
  address: z.string().min(5, 'Address is required'),
  emergencyContact: z.string().min(5, 'Emergency contact is required'),
  bloodGroup: z.string().optional(),
  medicalHistory: z.string().optional(),
});

export const CreateDoctorSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  departmentId: z.string().min(1, 'Department is required'),
  specialty: z.string().min(2, 'Specialty is required'),
  consultationFee: z.number().min(0, 'Consultation fee cannot be negative'),
  bio: z.string().optional(),
  availability: z.string().min(3, 'Availability schedule required'),
});

export const BookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Please select a doctor'),
  patientId: z.string().optional(), // Will default to current patient if logged in
  date: z.string().min(1, 'Please select appointment date'),
  timeSlot: z.string().min(1, 'Please select time slot'),
  reason: z.string().min(3, 'Please specify reason for visit'),
  symptoms: z.string().optional(),
});

export const CreateMedicalRecordSchema = z.object({
  appointmentId: z.string().optional(),
  patientId: z.string().min(1, 'Patient ID is required'),
  diagnosis: z.string().min(3, 'Diagnosis details required'),
  treatment: z.string().min(3, 'Treatment details required'),
  labResults: z.string().optional(),
  prescriptionNotes: z.string().optional(),
  medicines: z
    .array(
      z.object({
        medicineId: z.string().min(1),
        dosage: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .optional(),
});

export const CreateMedicineSchema = z.object({
  name: z.string().min(2, 'Medicine name required'),
  category: z.string().min(2, 'Category required'),
  price: z.number().positive('Price must be greater than zero'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  expiryDate: z.string().min(1, 'Expiry date required'),
  supplier: z.string().min(2, 'Supplier required'),
  description: z.string().optional(),
});

export const CreateMedicineOrderSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  items: z
    .array(
      z.object({
        medicineId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, 'At least one medicine must be selected'),
});

export const CreateBillSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  appointmentId: z.string().optional(),
  orderId: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1),
      amount: z.number().min(0),
    })
  ),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
});

export const ProcessDemoPaymentSchema = z.object({
  billId: z.string().min(1, 'Bill ID is required'),
  amount: z.number().positive('Payment amount must be positive'),
  method: z.nativeEnum(PaymentMethod),
  // Simulated parameters
  cardHolderName: z.string().optional(),
  cardNumber: z.string().optional(),
  upiId: z.string().optional(),
  walletName: z.string().optional(),
});

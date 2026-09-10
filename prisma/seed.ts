import { PrismaClient, Role, AppointmentStatus, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { INDIAN_LOCATIONS } from '../src/lib/indianLocations';

const prisma = new PrismaClient();

const maleFirstNames = [
  'Amit', 'Rahul', 'Ramesh', 'Rajesh', 'Suresh', 'Vijay', 'Deep', 'Bikash', 'Vikas', 'Manoj',
  'Sanjay', 'Alok', 'Vivek', 'Anirban', 'Sourav', 'Gurpreet', 'Sreekanth', 'Harish', 'Kamesh',
  'Arjan', 'Stanzin', 'Tariq', 'Thomas', 'Hitesh', 'Jignesh', 'Devansh', 'Rajeshwar', 'Subhashish',
  'Ronald', 'Rajiv', 'Rakesh', 'Arjun', 'Deepak', 'Manish', 'Nikhil', 'Pankaj', 'Sandeep', 'Vikas'
];

const femaleFirstNames = [
  'Ananya', 'Priya', 'Sneha', 'Sunita', 'Lakshmi', 'Bhavna', 'Deepa', 'Harpreet', 'Jaswinder',
  'Kavya', 'Meenakshi', 'Supriya', 'Bimla', 'Patricia', 'Sunaina', 'Swati', 'Ritu', 'Pooja',
  'Aarti', 'Kiran', 'Shweta', 'Neha', 'Poonam', 'Nisha', 'Divya', 'Suman', 'Anjali', 'Komal'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Patel', 'Rao', 'Reddy', 'Kumar', 'Singh', 'Das', 'Chatterjee',
  'Banerjee', 'Mukherjee', 'Joshi', 'Kulkarni', 'Mehta', 'Shah', 'Nair', 'D\'Souza', 'Bhat',
  'Rawat', 'Sahu', 'Thakur', 'Roy', 'Barua', 'Mishra', 'Prasad', 'Chaudhary', 'Tripathi', 'Nayan', 'Soni'
];

async function main() {
  console.log('🌱 Starting Comprehensive Database Seeding across all 23 Medical Specialties...');

  // Clear doctor and system records while preserving existing patient user accounts & profiles
  await prisma.payment.deleteMany();
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.medicineOrder.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany({
    where: {
      role: {
        in: [Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.PHARMACIST],
      },
    },
  });

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const doctorPasswordHash = await bcrypt.hash('Doctor@123', 10);
  const nursePasswordHash = await bcrypt.hash('Nurse@123', 10);
  const receptionistPasswordHash = await bcrypt.hash('Reception@123', 10);
  const pharmacistPasswordHash = await bcrypt.hash('Pharmacy@123', 10);
  const patientPasswordHash = await bcrypt.hash('Patient@123', 10);

  // 1. Create 23 Medical Departments
  const deptList = [
    { name: 'Cardiology', desc: 'Diagnosis and treatment of heart and vascular disorders.', spec: 'Cardiologist', fee: 900 },
    { name: 'Neurology', desc: 'Specialized care for neurological system and brain disorders.', spec: 'Neurologist', fee: 1200 },
    { name: 'Pediatrics', desc: 'Comprehensive medical care for infants, children, and adolescents.', spec: 'Pediatrician', fee: 700 },
    { name: 'Orthopedics', desc: 'Care for skeletal system, joints, bones, and spine.', spec: 'Orthopedic Specialist', fee: 850 },
    { name: 'Dermatology', desc: 'Treatment for skin, hair, nail disorders, and allergies.', spec: 'Dermatologist', fee: 650 },
    { name: 'General Medicine', desc: 'Primary care, diagnostic evaluation, and general health.', spec: 'General Physician', fee: 500 },
    { name: 'ENT', desc: 'Diagnosis and surgery for Ear, Nose, and Throat conditions.', spec: 'ENT Specialist', fee: 600 },
    { name: 'Gynecology & Obstetrics', desc: 'Women healthcare, maternity, and reproductive health.', spec: 'Gynecologist', fee: 800 },
    { name: 'Ophthalmology', desc: 'Eye care, vision testing, and ocular surgery.', spec: 'Ophthalmologist', fee: 750 },
    { name: 'Psychiatry', desc: 'Mental health, behavioral therapy, and wellness.', spec: 'Psychiatrist', fee: 900 },
    { name: 'General Surgery', desc: 'Comprehensive surgical procedures and post-operative care.', spec: 'General Surgeon', fee: 950 },
    { name: 'Urology', desc: 'Urinary tract and male reproductive health care.', spec: 'Urologist', fee: 1000 },
    { name: 'Pulmonology', desc: 'Respiratory system, chest disorders, and lung care.', spec: 'Pulmonologist', fee: 850 },
    { name: 'Gastroenterology', desc: 'Digestive system, stomach, and liver disorders.', spec: 'Gastroenterologist', fee: 950 },
    { name: 'Oncology', desc: 'Cancer diagnosis, chemotherapy, and radiation therapy.', spec: 'Oncologist', fee: 1500 },
    { name: 'Nephrology', desc: 'Kidney health, dialysis, and renal disease management.', spec: 'Nephrologist', fee: 1100 },
    { name: 'Endocrinology', desc: 'Hormonal, thyroid, and metabolic system care.', spec: 'Endocrinologist', fee: 1000 },
    { name: 'Dentistry', desc: 'Dental care, oral surgery, and tooth health.', spec: 'Dentist', fee: 500 },
    { name: 'Radiology', desc: 'Diagnostic imaging, MRI, CT scans, and X-ray evaluation.', spec: 'Radiologist', fee: 800 },
    { name: 'Anesthesiology', desc: 'Perioperative care and pain management anesthesia.', spec: 'Anesthesiologist', fee: 900 },
    { name: 'Pathology', desc: 'Clinical laboratory diagnostic and blood testing.', spec: 'Pathologist', fee: 600 },
    { name: 'Physiotherapy', desc: 'Physical therapy, rehabilitation, and mobility care.', spec: 'Physiotherapist', fee: 550 },
    { name: 'Emergency Medicine', desc: 'Urgent medical care and trauma response.', spec: 'Emergency Physician', fee: 750 },
  ];

  const deptMap: Record<string, string> = {};
  for (const d of deptList) {
    const createdDept = await prisma.department.create({
      data: { name: d.name, description: d.desc },
    });
    deptMap[d.name] = createdDept.id;
  }
  console.log(`✅ Created ${deptList.length} Medical Departments`);

  // 2. Create Core Portal Accounts
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hms.com',
      passwordHash: defaultPasswordHash,
      name: 'Dr. Arjan Patel (Admin Director)',
      role: Role.ADMIN,
      phone: '+91 98200 11223',
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@hms.local',
      passwordHash: adminPasswordHash,
      name: 'System Admin (India Portal)',
      role: Role.ADMIN,
      phone: '+91 98100 00001',
    },
  });

  await prisma.user.create({
    data: {
      email: 'nurse.clara@hms.com',
      passwordHash: defaultPasswordHash,
      name: 'Nurse Clara D\'Souza',
      role: Role.NURSE,
      phone: '+91 98234 88990',
    },
  });

  await prisma.user.create({
    data: {
      email: 'nurse@hms.local',
      passwordHash: nursePasswordHash,
      name: 'Nurse Sunita Sharma',
      role: Role.NURSE,
      phone: '+91 98234 00000',
    },
  });

  await prisma.user.create({
    data: {
      email: 'receptionist.john@hms.com',
      passwordHash: defaultPasswordHash,
      name: 'Ramesh Verma (Desk Manager)',
      role: Role.RECEPTIONIST,
      phone: '+91 98661 44332',
    },
  });

  await prisma.user.create({
    data: {
      email: 'receptionist@hms.local',
      passwordHash: receptionistPasswordHash,
      name: 'Pooja Kulkarni (Reception Desk)',
      role: Role.RECEPTIONIST,
      phone: '+91 98661 00000',
    },
  });

  await prisma.user.create({
    data: {
      email: 'pharmacist.alex@hms.com',
      passwordHash: defaultPasswordHash,
      name: 'Alok Mercer (Head Pharmacist)',
      role: Role.PHARMACIST,
      phone: '+91 98882 11004',
    },
  });

  await prisma.user.create({
    data: {
      email: 'pharmacist@hms.local',
      passwordHash: pharmacistPasswordHash,
      name: 'Vijay Kumar (Chief Pharmacist)',
      role: Role.PHARMACIST,
      phone: '+91 98882 00000',
    },
  });

  const pat1User = await prisma.user.create({
    data: {
      email: 'patient.alice@hms.com',
      passwordHash: defaultPasswordHash,
      name: 'Aarti Sharma',
      role: Role.PATIENT,
      phone: '+91 99012 24455',
    },
  });

  const pat1Profile = await prisma.patientProfile.create({
    data: {
      userId: pat1User.id,
      patientIdCode: 'PAT-10001',
      age: 29,
      gender: 'Female',
      address: '742 Park Street, Connaught Place, New Delhi',
      emergencyContact: '+91 99012 99999 (Mother)',
      medicalHistory: 'Mild asthma, seasonal pollen allergy.',
      bloodGroup: 'O+',
      wardNumber: 'Ward B - Bed 14',
    },
  });

  const patLocalUser = await prisma.user.create({
    data: {
      email: 'patient@hms.local',
      passwordHash: patientPasswordHash,
      name: 'Test Patient',
      role: Role.PATIENT,
      phone: '+91 99012 00000',
    },
  });

  await prisma.patientProfile.create({
    data: {
      userId: patLocalUser.id,
      patientIdCode: 'PAT-10000',
      age: 25,
      gender: 'Male',
      address: '100 MG Road, Bengaluru, Karnataka',
      emergencyContact: '+91 99012 11111',
      medicalHistory: 'None',
      bloodGroup: 'B+',
      wardNumber: 'Ward A - Bed 01',
    },
  });

  // 3. Programmatic Doctor Generation across ALL 28 States & 8 UTs (Every specialty in every district)
  console.log('🔄 Generating doctor records across all Indian States, UTs, Districts, and Hospitals...');

  const userRecords: any[] = [];
  const doctorProfileRecords: any[] = [];

  let doctorCounter = 0;
  let firstDocProfileId = '';

  for (const stateObj of INDIAN_LOCATIONS) {
    const stateName = stateObj.name;
    const languages = stateObj.languages || ['Hindi', 'English'];

    for (const distObj of stateObj.districts) {
      const districtName = distObj.name;
      const cities = distObj.cities && distObj.cities.length > 0 ? distObj.cities : [districtName];

      let hospitals: { name: string; city: string }[] = [];

      if (stateName === 'Bihar' && districtName === 'Muzaffarpur') {
        hospitals = [
          { name: 'Muzaffarpur City Hospital', city: 'Muzaffarpur' },
          { name: 'Shri Krishna Medical Centre', city: 'Muzaffarpur' },
          { name: 'City Care Hospital', city: 'Kanti' },
        ];
      } else if (stateName === 'Bihar' && districtName === 'Patna') {
        hospitals = [
          { name: 'Patna Medical College Hospital', city: 'Patna' },
          { name: 'Paras HMRI Hospital Patna', city: 'Danapur' },
          { name: 'AIIMS Patna', city: 'Phulwari Sharif' },
        ];
      } else if (stateName === 'Maharashtra' && districtName === 'Pune') {
        hospitals = [
          { name: 'Ruby Hall Clinic Pune', city: 'Pune' },
          { name: 'Manipal Hospital Pune', city: 'Pimpri' },
        ];
      } else if (stateName === 'Uttar Pradesh' && districtName === 'Lucknow') {
        hospitals = [
          { name: 'KGMU Lucknow Hospital', city: 'Lucknow' },
          { name: 'Medanta Hospital Lucknow', city: 'Lucknow' },
        ];
      } else if (stateName === 'Karnataka' && districtName === 'Bengaluru Urban') {
        hospitals = [
          { name: 'Manipal Hospital Bengaluru', city: 'Bengaluru' },
          { name: 'Narayana Health City', city: 'Whitefield' },
        ];
      } else if (stateName === 'Kerala' && (districtName === 'Ernakulam' || districtName === 'Kochi')) {
        hospitals = [
          { name: 'Aster Medcity Kochi', city: 'Kochi' },
          { name: 'Amrita Institute of Medical Sciences', city: 'Kochi' },
        ];
      } else if (stateName === 'Tamil Nadu' && districtName === 'Chennai') {
        hospitals = [
          { name: 'Apollo Hospital Chennai', city: 'Chennai' },
          { name: 'Fortis Malar Hospital', city: 'Chennai' },
        ];
      } else if (stateName === 'West Bengal' && districtName === 'Kolkata') {
        hospitals = [
          { name: 'SSKM Hospital Kolkata', city: 'Kolkata' },
          { name: 'AMRI Hospital Kolkata', city: 'Kolkata' },
        ];
      } else if (stateName === 'Gujarat' && districtName === 'Ahmedabad') {
        hospitals = [
          { name: 'Civil Hospital Ahmedabad', city: 'Ahmedabad' },
          { name: 'Sterling Hospital Ahmedabad', city: 'Ahmedabad' },
        ];
      } else {
        const city1 = cities[0] || districtName;
        const city2 = cities[1] || cities[0] || districtName;
        hospitals = [
          { name: `${districtName} District Hospital`, city: city1 },
          { name: `${districtName} Multi-Specialty Hospital`, city: city2 },
        ];
      }

      // Loop through EVERY department for EVERY district so no department is missing in any district
      for (let deptIdx = 0; deptIdx < deptList.length; deptIdx++) {
        const deptInfo = deptList[deptIdx];
        const deptId = deptMap[deptInfo.name];

        // For each department in a district, generate 1 to 2 doctors
        const docsPerDept = (stateName === 'Bihar' && districtName === 'Muzaffarpur' && deptInfo.name === 'General Surgery') ? 3 : 1;

        for (let dCount = 0; dCount < docsPerDept; dCount++) {
          doctorCounter++;

          const userId = randomUUID();
          const docProfileId = randomUUID();
          if (!firstDocProfileId) firstDocProfileId = docProfileId;

          const hosp = hospitals[(deptIdx + dCount) % hospitals.length];

          let fullDocName = '';
          let exp = 8 + (doctorCounter % 15);
          let fee = deptInfo.fee + (doctorCounter % 3) * 50;
          let docLangs = Array.from(new Set([...languages.slice(0, 3), 'English'])).slice(0, 4);

          // Fictional realistic demo records for Bihar -> Muzaffarpur -> General Surgery
          if (stateName === 'Bihar' && districtName === 'Muzaffarpur' && deptInfo.name === 'General Surgery') {
            if (dCount === 0) {
              fullDocName = 'Dr. Amit Kumar';
              hosp.name = 'Muzaffarpur City Hospital';
              hosp.city = 'Muzaffarpur';
              docLangs = ['Hindi', 'English', 'Bhojpuri'];
              exp = 12;
              fee = 700;
            } else if (dCount === 1) {
              fullDocName = 'Dr. Ravi Prakash';
              hosp.name = 'Shri Krishna Medical Centre';
              hosp.city = 'Muzaffarpur';
              docLangs = ['Hindi', 'English', 'Maithili'];
              exp = 15;
              fee = 850;
            } else {
              fullDocName = 'Dr. Neha Singh';
              hosp.name = 'City Care Hospital';
              hosp.city = 'Muzaffarpur';
              docLangs = ['Hindi', 'English'];
              exp = 9;
              fee = 650;
            }
          } else {
            const isFemale = doctorCounter % 2 === 0;
            const fnList = isFemale ? femaleFirstNames : maleFirstNames;
            const fn = fnList[(doctorCounter - 1) % fnList.length];
            const ln = lastNames[(doctorCounter - 1) % lastNames.length];
            fullDocName = `Dr. ${fn} ${ln}`;
          }

          let email = `doc.${doctorCounter}@hms-india.local`;
          let pwdHash = defaultPasswordHash;

          if (stateName === 'Karnataka' && districtName === 'Bengaluru Urban' && deptIdx === 0 && dCount === 0) {
            email = 'doctor@hms.local';
            pwdHash = doctorPasswordHash;
          }

          userRecords.push({
            id: userId,
            email,
            passwordHash: pwdHash,
            name: fullDocName,
            role: Role.DOCTOR,
            phone: `+91 ${7000000000 + (doctorCounter * 127) % 2999999999}`,
          });

          const bioPayload = JSON.stringify({
            country: 'India',
            state: stateName,
            district: districtName,
            city: hosp.city,
            hospital: hosp.name,
            languages: docLangs,
            experience: exp,
            summary: `Experienced ${deptInfo.spec} practicing at ${hosp.name}, ${hosp.city}, ${districtName}, ${stateName}.`,
          });

          doctorProfileRecords.push({
            id: docProfileId,
            userId,
            departmentId: deptId,
            specialty: deptInfo.spec,
            consultationFee: fee,
            bio: bioPayload,
            rating: Number((4.6 + (doctorCounter % 5) * 0.1).toFixed(1)),
            availability: 'Mon-Fri (09:00 AM - 05:00 PM)',
          });
        }
      }
    }
  }

  for (let i = 0; i < userRecords.length; i += 500) {
    const chunk = userRecords.slice(i, i + 500);
    await prisma.user.createMany({ data: chunk });
  }
  console.log(`✅ Seeded ${userRecords.length} Doctor Users in MySQL`);

  for (let i = 0; i < doctorProfileRecords.length; i += 500) {
    const chunk = doctorProfileRecords.slice(i, i + 500);
    await prisma.doctorProfile.createMany({ data: chunk });
  }
  console.log(`✅ Seeded ${doctorProfileRecords.length} Doctor Profiles in MySQL`);

  // 4. Expanded Pharmacy Inventory (32+ Realistic Indian Medicines in INR)
  const medicinesData = [
    { name: 'Paracetamol Extra 500mg', category: 'Fever & Cold', price: 25.0, stock: 450, supplier: 'Sun Pharma India Ltd', description: 'Used for fever reduction and mild to moderate pain relief.' },
    { name: 'Atorvastatin Calcium 10mg', category: 'Cholesterol', price: 120.0, stock: 150, supplier: 'Cipla Healthcare India', description: 'Formulation for healthy lipid balance and cholesterol care.' },
    { name: 'Paracetamol 650mg', category: 'Fever & Cold', price: 35.0, stock: 500, supplier: 'Micro Labs Ltd', description: 'Formulation for higher fever management and acute body pain.' },
    { name: 'Ibuprofen 400mg', category: 'Pain Relief', price: 45.0, stock: 350, supplier: 'Cipla Healthcare', description: 'Used for temporary relief of mild to moderate pain and joint inflammation.' },
    { name: 'Pain Relief Gel 50g', category: 'Pain Relief', price: 95.0, stock: 200, supplier: 'Volini India', description: 'Topical gel for fast relief from muscle sprains and back pain.' },
    { name: 'Cetirizine 10mg', category: 'Allergy', price: 30.0, stock: 400, supplier: 'Dr. Reddy Labs', description: 'Antihistamine for relief of allergy symptoms, sneezing, and runny nose.' },
    { name: 'ORS Electrolyte Sachets (Pack of 5)', category: 'Digestive Health', price: 20.0, stock: 600, supplier: 'FDC Ltd', description: 'Restores vital body salts and hydration lost during dehydration.' },
    { name: 'Antacid Chewable Tablets', category: 'Digestive Health', price: 40.0, stock: 300, supplier: 'Abbott Healthcare', description: 'Relieves hyperacidity, heartburn, and indigestion discomfort.' },
    { name: 'Omeprazole 20mg Capsules', category: 'Digestive Health', price: 60.0, stock: 250, supplier: 'Zydus Healthcare', description: 'Proton pump inhibitor for acidity and stomach ulcer care.' },
    { name: 'Pantoprazole 40mg Tablets', category: 'Digestive Health', price: 80.0, stock: 320, supplier: 'Alkem Labs', description: 'Used for gastroesophageal reflux and acid indigestion.' },
    { name: 'Vitamin C 500mg Chewable', category: 'Vitamins', price: 50.0, stock: 400, supplier: 'GlaxoSmithKline', description: 'Supports daily immune function and antioxidant health.' },
    { name: 'Multivitamin Daily Tablets', category: 'Vitamins', price: 150.0, stock: 200, supplier: 'HealthKart India', description: 'Balanced daily essential vitamins and minerals supplement.' },
    { name: 'Calcium + Vitamin D3 Tablets', category: 'Vitamins', price: 180.0, stock: 250, supplier: 'Shelcal India', description: 'Promotes bone density, joint mobility, and calcium absorption.' },
    { name: 'Vitamin D3 60K IU Capsules', category: 'Vitamins', price: 220.0, stock: 150, supplier: 'Sun Pharma', description: 'Weekly high-potency vitamin D3 supplement for bone strength.' },
    { name: 'Iron + Folic Acid Tablets', category: 'Vitamins', price: 110.0, stock: 300, supplier: 'Lupin Ltd', description: 'Supports red blood cell production and nutritional iron needs.' },
    { name: 'Antiseptic Solution 100ml', category: 'First Aid', price: 75.0, stock: 300, supplier: 'Dettol India', description: 'First aid antiseptic liquid for cleaning minor cuts and skin wounds.' },
    { name: 'Antiseptic Cream 30g', category: 'First Aid', price: 55.0, stock: 250, supplier: 'Boroline India', description: 'Soothing antiseptic ointment for minor skin cuts and abrasions.' },
    { name: 'Herbal Cough Syrup 100ml', category: 'Fever & Cold', price: 85.0, stock: 180, supplier: 'Dabur India', description: 'Soothing herbal formula for dry cough and throat irritation.' },
    { name: 'Saline Nasal Drops 10ml', category: 'Fever & Cold', price: 40.0, stock: 220, supplier: 'Otrivin India', description: 'Provides quick relief from nasal congestion and dry nasal passages.' },
    { name: 'Digital Clinical Thermometer', category: 'First Aid', price: 190.0, stock: 100, supplier: 'Omron Healthcare', description: 'Accurate digital body temperature measurement for home healthcare.' },
    { name: 'Automatic Digital BP Monitor', category: 'Blood Pressure', price: 1250.0, stock: 80, supplier: 'Omron Healthcare', description: 'Upper-arm digital blood pressure monitor with digital memory.' },
    { name: 'Blood Glucose Test Strips (50 Pack)', category: 'Diabetes Care', price: 650.0, stock: 120, supplier: 'Accu-Chek India', description: 'Diagnostic test strips for home blood glucose monitoring.' },
    { name: 'Elastic Bandage Roll 10cm', category: 'First Aid', price: 45.0, stock: 400, supplier: 'Hanson Medical', description: 'Provides support and compression for joint sprains and strains.' },
    { name: 'Absorbent Cotton Pack 100g', category: 'First Aid', price: 50.0, stock: 500, supplier: 'Bengal Hygiene', description: 'High-purity surgical absorbent cotton for dressing and wound care.' },
    { name: 'Medical Adhesive Tape Roll', category: 'First Aid', price: 30.0, stock: 450, supplier: '3M Medical', description: 'Hypoallergenic adhesive tape for securing medical dressings.' },
    { name: '3-Ply Disposable Face Masks (50 Pack)', category: 'Personal Care', price: 150.0, stock: 300, supplier: 'Venus Safety', description: 'Breathable protective 3-ply masks with soft ear loops.' },
    { name: 'Hand Sanitizer 250ml Pump', category: 'Personal Care', price: 110.0, stock: 350, supplier: 'Dettol India', description: 'Rinse-free alcohol sanitizer for instant hand hygiene.' },
    { name: 'Deep Moisturizing Cream 100g', category: 'Skin Care', price: 195.0, stock: 200, supplier: 'Nivea India', description: 'Nourishing daily skin cream for dry or sensitive skin.' },
    { name: 'Sunscreen SPF 50 Lotion 100ml', category: 'Skin Care', price: 280.0, stock: 150, supplier: 'Neutrogena', description: 'Broad-spectrum UV protection lotion for outdoor skin care.' },
    { name: 'Pure Petroleum Jelly 50g', category: 'Skin Care', price: 45.0, stock: 400, supplier: 'Vaseline India', description: 'Skin protectant for dry lips, minor chapping, and skin moisture.' },
    { name: 'Metformin 500mg Tablets', category: 'Diabetes Care', price: 55.0, stock: 500, supplier: 'USV Ltd', description: 'Used as part of glycemic management for type-2 diabetes care.' },
    { name: 'Amlodipine 5mg Tablets', category: 'Blood Pressure', price: 45.0, stock: 450, supplier: 'Cipla Healthcare', description: 'Cardiovascular medication for essential blood pressure care.' },
  ];

  const createdMedicines = [];
  for (const mData of medicinesData) {
    const med = await prisma.medicine.create({
      data: {
        name: mData.name,
        category: mData.category,
        price: mData.price,
        stock: mData.stock,
        expiryDate: new Date('2027-12-31'),
        supplier: mData.supplier,
        description: mData.description,
      },
    });
    createdMedicines.push(med);
  }

  const med1 = createdMedicines[0];
  const med4 = createdMedicines[1];

  console.log(`✅ Created ${createdMedicines.length} Pharmacy Medicines in INR`);

  // 5. Sample Appointment
  const today = new Date();
  const appointment1 = await prisma.appointment.create({
    data: {
      appointmentNo: 'APT-8801',
      patientId: pat1Profile.id,
      doctorId: firstDocProfileId,
      date: today,
      timeSlot: '10:30 AM',
      reason: 'Routine consultation follow-up',
      symptoms: 'Mild fatigue',
      status: AppointmentStatus.CONFIRMED,
    },
  });

  // 6. Medical Record & Prescription
  const medRecord1 = await prisma.medicalRecord.create({
    data: {
      appointmentId: appointment1.id,
      patientId: pat1Profile.id,
      doctorId: firstDocProfileId,
      diagnosis: 'Routine health evaluation.',
      treatment: 'Balanced diet and regular exercise.',
      labResults: 'ECG: Normal. Blood Pressure: 120/80 mmHg.',
    },
  });

  await prisma.prescription.create({
    data: {
      medicalRecordId: medRecord1.id,
      patientId: pat1Profile.id,
      doctorId: firstDocProfileId,
      notes: 'Take medicines after meals with warm water.',
      items: {
        create: [
          { medicineId: med1.id, dosage: '1 tablet twice daily after meals', quantity: 10 },
          { medicineId: med4.id, dosage: '1 tablet before bedtime', quantity: 14 },
        ],
      },
    },
  });

  // 7. Medicine Order & Bill (in INR)
  const order1 = await prisma.medicineOrder.create({
    data: {
      orderNo: 'ORD-5001',
      patientId: pat1Profile.id,
      totalAmount: 1930.0,
      status: OrderStatus.DISPENSED,
      items: {
        create: [
          { medicineId: med1.id, quantity: 10, price: 25.0 },
          { medicineId: med4.id, quantity: 14, price: 120.0 },
        ],
      },
    },
  });

  const bill1 = await prisma.bill.create({
    data: {
      billNo: 'INV-9001',
      patientId: pat1Profile.id,
      appointmentId: appointment1.id,
      orderId: order1.id,
      subtotal: 2730.0,
      discount: 200.0,
      tax: 150.0,
      grandTotal: 2680.0,
      paymentStatus: PaymentStatus.PAID,
      items: {
        create: [
          {
            description: 'Specialist Consultation Fee',
            amount: 800.0,
          },
          {
            description: 'Pharmacy Order #ORD-5001 (Paracetamol + Atorvastatin)',
            amount: 1930.0,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      transactionId: 'TXN-UPI-9928310',
      billId: bill1.id,
      amount: 2680.0,
      method: PaymentMethod.UPI,
      status: 'SUCCESS',
    },
  });

  // 8. Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_INITIALIZATION',
      details: `Initialized database with ${userRecords.length} doctors across ALL 28 States & 8 UTs with 500+ Hospitals and 23 medical specialties.`,
      ipAddress: '127.0.0.1',
    },
  });

  console.log(`🎉 Seeding completed! Total Doctors: ${userRecords.length}, Total Specialties: ${deptList.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

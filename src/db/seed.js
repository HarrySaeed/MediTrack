// src/db/seed.js
// Run with: netlify dev:exec node src/db/seed.js

import { neon } from "@netlify/neon";

const sql = neon();

async function seed() {
  console.log("🌱 Seeding database...");

  const HASH = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

  // ── Staff ──────────────────────────────────────────────
  await sql`
    INSERT INTO staff (full_name, email, password_hash, role, department, phone) VALUES
      ('Admin User',       'admin@meditrack.com',    ${HASH}, 'admin',      'Administration',   '+1-555-0100'),
      ('Dr. Sarah Chen',   'doctor@meditrack.com',   ${HASH}, 'doctor',     'General Medicine', '+1-555-0101'),
      ('Dr. James Okafor', 'doctor2@meditrack.com',  ${HASH}, 'doctor',     'Cardiology',       '+1-555-0102'),
      ('Alex Rivera',      'pharmacy@meditrack.com', ${HASH}, 'pharmacist', 'Pharmacy',         '+1-555-0103')
    ON CONFLICT (email) DO NOTHING
  `;
  console.log("✅ Staff seeded");

  const staffRows = await sql`SELECT id, email FROM staff`;
  const d1 = staffRows.find(s => s.email === "doctor@meditrack.com");
  const d2 = staffRows.find(s => s.email === "doctor2@meditrack.com");

  // ── Patients ───────────────────────────────────────────
  await sql`
    INSERT INTO patients (mrn, full_name, date_of_birth, gender, blood_type, phone, allergies, registered_by) VALUES
      ('MRN-00001', 'Emily Johnson',  '1985-03-22', 'female', 'A+', '+1-555-1001', 'Penicillin',  ${d1.id}),
      ('MRN-00002', 'Michael Torres', '1972-11-08', 'male',   'O+', '+1-555-1002',  NULL,          ${d1.id}),
      ('MRN-00003', 'Priya Patel',    '1990-07-14', 'female', 'B-', '+1-555-1003', 'Sulfa drugs', ${d2.id})
    ON CONFLICT (mrn) DO NOTHING
  `;
  console.log("✅ Patients seeded");

  const pRows = await sql`SELECT id, mrn FROM patients`;
  const p1 = pRows.find(p => p.mrn === "MRN-00001");
  const p2 = pRows.find(p => p.mrn === "MRN-00002");
  const p3 = pRows.find(p => p.mrn === "MRN-00003");

  // ── Medical History ────────────────────────────────────
  await sql`INSERT INTO medical_history (patient_id, condition, notes, recorded_by) VALUES (${p1.id}, 'Type 2 Diabetes', 'Diagnosed 2018, managed with diet and medication', ${d1.id})`;
  await sql`INSERT INTO medical_history (patient_id, condition, notes, recorded_by) VALUES (${p1.id}, 'Hypertension', 'BP consistently above 140/90', ${d1.id})`;
  await sql`INSERT INTO medical_history (patient_id, condition, notes, recorded_by) VALUES (${p2.id}, 'Asthma', 'Mild intermittent, seasonal triggers', ${d2.id})`;
  console.log("✅ Medical history seeded");

  // ── Visits ─────────────────────────────────────────────
  await sql`INSERT INTO visits (patient_id, doctor_id, chief_complaint, notes) VALUES (${p1.id}, ${d1.id}, 'Routine checkup', 'Patient reports improved energy levels')`;
  await sql`INSERT INTO visits (patient_id, doctor_id, chief_complaint, notes) VALUES (${p2.id}, ${d2.id}, 'Shortness of breath', 'Ordered chest X-ray, no acute findings')`;
  await sql`INSERT INTO visits (patient_id, doctor_id, chief_complaint, notes) VALUES (${p3.id}, ${d1.id}, 'Fever and sore throat', 'Suspected viral pharyngitis')`;
  console.log("✅ Visits seeded");

  const vRows = await sql`SELECT id, patient_id FROM visits`;
  const v1 = vRows.find(v => v.patient_id === p1.id);
  const v2 = vRows.find(v => v.patient_id === p2.id);
  const v3 = vRows.find(v => v.patient_id === p3.id);

  // ── Diagnoses ──────────────────────────────────────────
  await sql`INSERT INTO diagnoses (patient_id, visit_id, doctor_id, condition, icd_code, status, notes) VALUES (${p1.id}, ${v1.id}, ${d1.id}, 'Type 2 Diabetes Mellitus', 'E11', 'chronic', 'Continue current regimen')`;
  await sql`INSERT INTO diagnoses (patient_id, visit_id, doctor_id, condition, icd_code, status, notes) VALUES (${p2.id}, ${v2.id}, ${d2.id}, 'Asthma mild intermittent', 'J45.20', 'active', 'Increase inhaler use as needed')`;
  await sql`INSERT INTO diagnoses (patient_id, visit_id, doctor_id, condition, icd_code, status, notes) VALUES (${p3.id}, ${v3.id}, ${d1.id}, 'Viral Pharyngitis', 'J02.9', 'active', 'Rest, fluids, OTC analgesics')`;
  console.log("✅ Diagnoses seeded");

  // ── Prescriptions ──────────────────────────────────────
  await sql`INSERT INTO prescriptions (patient_id, visit_id, doctor_id, drug_name, dosage, frequency, duration, instructions, status) VALUES (${p1.id}, ${v1.id}, ${d1.id}, 'Metformin', '500mg', 'Twice daily', '3 months', 'Take with meals', 'pending')`;
  await sql`INSERT INTO prescriptions (patient_id, visit_id, doctor_id, drug_name, dosage, frequency, duration, instructions, status) VALUES (${p1.id}, ${v1.id}, ${d1.id}, 'Lisinopril', '10mg', 'Once daily', '3 months', 'Take in the morning', 'filled')`;
  await sql`INSERT INTO prescriptions (patient_id, visit_id, doctor_id, drug_name, dosage, frequency, duration, instructions, status) VALUES (${p2.id}, ${v2.id}, ${d2.id}, 'Albuterol', '90mcg', 'As needed', 'Ongoing', 'Use for acute symptoms', 'pending')`;
  await sql`INSERT INTO prescriptions (patient_id, visit_id, doctor_id, drug_name, dosage, frequency, duration, instructions, status) VALUES (${p3.id}, ${v3.id}, ${d1.id}, 'Ibuprofen', '400mg', 'Every 6 hours', '5 days', 'Take with food', 'pending')`;
  console.log("✅ Prescriptions seeded");

  console.log("🎉 Database seeded successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
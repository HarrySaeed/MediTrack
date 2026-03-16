// delete-test-patients.js
// Run with: netlify dev:exec node delete-test-patients.js
// Deletes ALL patients and their related records (visits, diagnoses, prescriptions, history)

import { neon } from "@netlify/neon";
const sql = neon();

// Show patients before deleting
const patients = await sql`SELECT id, full_name, mrn, cnic FROM patients ORDER BY id`;
console.log("\nPatients found:");
patients.forEach(p => console.log(`  [${p.id}] ${p.full_name} — ${p.mrn} — ${p.cnic || "no CNIC"}`));

if (patients.length === 0) {
  console.log("No patients to delete.");
  process.exit(0);
}

// Delete all related records first (cascade order)
await sql`DELETE FROM prescriptions WHERE patient_id IN (SELECT id FROM patients)`;
await sql`DELETE FROM diagnoses WHERE patient_id IN (SELECT id FROM patients)`;
await sql`DELETE FROM medical_history WHERE patient_id IN (SELECT id FROM patients)`;
await sql`DELETE FROM visits WHERE patient_id IN (SELECT id FROM patients)`;
await sql`DELETE FROM patients`;

console.log(`\n✅ Deleted ${patients.length} patient(s) and all their records.`);
process.exit(0);
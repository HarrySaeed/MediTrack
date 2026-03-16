// netlify/functions/patients.js

import { neon } from "@netlify/neon";
import jwt from "jsonwebtoken";

const sql = neon();
const JWT_SECRET = Netlify.env.get("JWT_SECRET") || "meditrack-secret-key";

function verifyToken(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try { return jwt.verify(auth.split(" ")[1], JWT_SECRET); } catch { return null; }
}

function unauthorized() { return Response.json({ error: "Unauthorized" }, { status: 401 }); }
function forbidden()    { return Response.json({ error: "Forbidden"    }, { status: 403 }); }

export default async (req) => {
  const user = verifyToken(req);
  if (!user) return unauthorized();
  if (!["doctor", "admin"].includes(user.role)) return forbidden();

  const url      = new URL(req.url);
  const pathname = url.pathname;
  const method   = req.method;

  // ── GET /api/patients ─────────────────────────────────
  if (method === "GET" && pathname === "/api/patients") {
    const search = url.searchParams.get("search") || "";
    const rows = search
      ? await sql`
          SELECT p.*, s.full_name AS registered_by_name
          FROM patients p LEFT JOIN staff s ON s.id = p.registered_by
          WHERE p.full_name ILIKE ${"%" + search + "%"} OR p.mrn ILIKE ${"%" + search + "%"}
          ORDER BY p.created_at DESC`
      : await sql`
          SELECT p.*, s.full_name AS registered_by_name
          FROM patients p LEFT JOIN staff s ON s.id = p.registered_by
          ORDER BY p.created_at DESC`;
    return Response.json(rows);
  }

  // ── POST /api/patients ────────────────────────────────
  if (method === "POST" && pathname === "/api/patients") {
    const { fullName, dateOfBirth, gender, bloodType, phone, address, emergencyContactName, emergencyContactPhone, allergies } = await req.json();
    if (!fullName || !dateOfBirth || !gender) {
      return Response.json({ error: "Full name, date of birth and gender are required" }, { status: 400 });
    }
    const countRows = await sql`SELECT COUNT(*) AS count FROM patients`;
    const mrn       = "MRN-" + String(parseInt(countRows[0].count) + 1).padStart(5, "0");
    const rows = await sql`
      INSERT INTO patients (mrn, full_name, date_of_birth, gender, blood_type, phone, address, emergency_contact_name, emergency_contact_phone, allergies, registered_by)
      VALUES (${mrn}, ${fullName}, ${dateOfBirth}, ${gender}, ${bloodType || null}, ${phone || null}, ${address || null}, ${emergencyContactName || null}, ${emergencyContactPhone || null}, ${allergies || null}, ${user.id})
      RETURNING *`;
    return Response.json(rows[0], { status: 201 });
  }

  // ── POST /api/patients/:id/diagnoses ──────────────────
  const matchDiagnoses = pathname.match(/^\/api\/patients\/(\d+)\/diagnoses$/);
  if (method === "POST" && matchDiagnoses) {
    const patientId = parseInt(matchDiagnoses[1]);
    const { condition, icdCode, status, notes } = await req.json();
    if (!condition) return Response.json({ error: "Condition is required" }, { status: 400 });
    const rows = await sql`
      INSERT INTO diagnoses (patient_id, doctor_id, condition, icd_code, status, notes)
      VALUES (${patientId}, ${user.id}, ${condition}, ${icdCode || null}, ${status || "active"}, ${notes || null})
      RETURNING *`;
    return Response.json(rows[0], { status: 201 });
  }

  // ── POST /api/patients/:id/prescriptions ──────────────
  const matchPrescriptions = pathname.match(/^\/api\/patients\/(\d+)\/prescriptions$/);
  if (method === "POST" && matchPrescriptions) {
    const patientId = parseInt(matchPrescriptions[1]);
    const { drugName, dosage, frequency, duration, instructions } = await req.json();
    if (!drugName || !dosage || !frequency) {
      return Response.json({ error: "Drug name, dosage and frequency are required" }, { status: 400 });
    }
    const rows = await sql`
      INSERT INTO prescriptions (patient_id, doctor_id, drug_name, dosage, frequency, duration, instructions, status)
      VALUES (${patientId}, ${user.id}, ${drugName}, ${dosage}, ${frequency}, ${duration || null}, ${instructions || null}, 'pending')
      RETURNING *`;
    return Response.json(rows[0], { status: 201 });
  }

  // ── POST /api/patients/:id/history ────────────────────
  const matchHistory = pathname.match(/^\/api\/patients\/(\d+)\/history$/);
  if (method === "POST" && matchHistory) {
    const patientId = parseInt(matchHistory[1]);
    const { condition, notes } = await req.json();
    if (!condition) return Response.json({ error: "Condition is required" }, { status: 400 });
    const rows = await sql`
      INSERT INTO medical_history (patient_id, condition, notes, recorded_by)
      VALUES (${patientId}, ${condition}, ${notes || null}, ${user.id})
      RETURNING *`;
    return Response.json(rows[0], { status: 201 });
  }

  // ── GET /api/patients/:id ─────────────────────────────
  const matchId = pathname.match(/^\/api\/patients\/(\d+)$/);
  if (method === "GET" && matchId) {
    const id = parseInt(matchId[1]);
    const patientRows = await sql`
      SELECT p.*, s.full_name AS registered_by_name
      FROM patients p LEFT JOIN staff s ON s.id = p.registered_by
      WHERE p.id = ${id}`;
    if (!patientRows[0]) return Response.json({ error: "Patient not found" }, { status: 404 });

    const [history, visits, diagnoses, prescriptions] = await Promise.all([
      sql`SELECT mh.*, s.full_name AS recorded_by_name FROM medical_history mh LEFT JOIN staff s ON s.id = mh.recorded_by WHERE mh.patient_id = ${id} ORDER BY mh.recorded_at DESC`,
      sql`SELECT v.*, s.full_name AS doctor_name FROM visits v LEFT JOIN staff s ON s.id = v.doctor_id WHERE v.patient_id = ${id} ORDER BY v.visited_at DESC`,
      sql`SELECT d.*, s.full_name AS doctor_name FROM diagnoses d LEFT JOIN staff s ON s.id = d.doctor_id WHERE d.patient_id = ${id} ORDER BY d.diagnosed_at DESC`,
      sql`SELECT pr.*, s.full_name AS doctor_name FROM prescriptions pr LEFT JOIN staff s ON s.id = pr.doctor_id WHERE pr.patient_id = ${id} ORDER BY pr.prescribed_at DESC`,
    ]);
    return Response.json({ ...patientRows[0], history, visits, diagnoses, prescriptions });
  }

  // ── PUT /api/patients/:id ─────────────────────────────
  const matchUpdate = pathname.match(/^\/api\/patients\/(\d+)$/);
  if (method === "PUT" && matchUpdate) {
    const id = parseInt(matchUpdate[1]);
    const { fullName, dateOfBirth, gender, bloodType, phone, address, emergencyContactName, emergencyContactPhone, allergies } = await req.json();
    const rows = await sql`
      UPDATE patients SET
        full_name = ${fullName}, date_of_birth = ${dateOfBirth}, gender = ${gender},
        blood_type = ${bloodType || null}, phone = ${phone || null}, address = ${address || null},
        emergency_contact_name = ${emergencyContactName || null}, emergency_contact_phone = ${emergencyContactPhone || null},
        allergies = ${allergies || null}, updated_at = NOW()
      WHERE id = ${id} RETURNING *`;
    if (!rows[0]) return Response.json({ error: "Patient not found" }, { status: 404 });
    return Response.json(rows[0]);
  }

  return Response.json({ error: "Not found" }, { status: 404 });
};

export const config = {
  path: ["/api/patients", "/api/patients/*"],
};
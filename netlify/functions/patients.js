// netlify/functions/patients.js

import { neon } from "@netlify/neon";
import jwt from "jsonwebtoken";

const sql = neon();
const JWT_SECRET = Netlify.env.get("JWT_SECRET") || "meditrack-secret-key";

// ── Auth helper ────────────────────────────────────────────
function verifyToken(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.split(" ")[1], JWT_SECRET);
  } catch {
    return null;
  }
}

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}

export default async (req) => {
  const user = verifyToken(req);
  if (!user) return unauthorized();
  if (!["doctor", "admin"].includes(user.role)) return forbidden();

  const url      = new URL(req.url);
  const pathname = url.pathname;
  const method   = req.method;

  // ── GET /api/patients — list + search ─────────────────
  if (method === "GET" && pathname === "/api/patients") {
    const search = url.searchParams.get("search") || "";

    let rows;
    if (search) {
      rows = await sql`
        SELECT p.*, s.full_name AS registered_by_name
        FROM patients p
        LEFT JOIN staff s ON s.id = p.registered_by
        WHERE
          p.full_name ILIKE ${"%" + search + "%"}
          OR p.mrn    ILIKE ${"%" + search + "%"}
        ORDER BY p.created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT p.*, s.full_name AS registered_by_name
        FROM patients p
        LEFT JOIN staff s ON s.id = p.registered_by
        ORDER BY p.created_at DESC
      `;
    }

    return Response.json(rows);
  }

  // ── POST /api/patients — register new patient ──────────
  if (method === "POST" && pathname === "/api/patients") {
    const body = await req.json();
    const {
      fullName, dateOfBirth, gender, bloodType,
      phone, address, emergencyContactName,
      emergencyContactPhone, allergies,
    } = body;

    if (!fullName || !dateOfBirth || !gender) {
      return Response.json({ error: "Full name, date of birth and gender are required" }, { status: 400 });
    }

    // Generate MRN
    const countRows = await sql`SELECT COUNT(*) AS count FROM patients`;
    const count     = parseInt(countRows[0].count);
    const mrn       = "MRN-" + String(count + 1).padStart(5, "0");

    const rows = await sql`
      INSERT INTO patients
        (mrn, full_name, date_of_birth, gender, blood_type, phone, address,
         emergency_contact_name, emergency_contact_phone, allergies, registered_by)
      VALUES
        (${mrn}, ${fullName}, ${dateOfBirth}, ${gender}, ${bloodType || null},
         ${phone || null}, ${address || null}, ${emergencyContactName || null},
         ${emergencyContactPhone || null}, ${allergies || null}, ${user.id})
      RETURNING *
    `;

    return Response.json(rows[0], { status: 201 });
  }

  // ── GET /api/patients/:id — single patient with full details
  const matchId = pathname.match(/^\/api\/patients\/(\d+)$/);
  if (method === "GET" && matchId) {
    const id = parseInt(matchId[1]);

    const patientRows = await sql`
      SELECT p.*, s.full_name AS registered_by_name
      FROM patients p
      LEFT JOIN staff s ON s.id = p.registered_by
      WHERE p.id = ${id}
    `;

    if (!patientRows[0]) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    const [history, visits, diagnoses, prescriptions] = await Promise.all([
      sql`SELECT * FROM medical_history WHERE patient_id = ${id} ORDER BY recorded_at DESC`,
      sql`
        SELECT v.*, s.full_name AS doctor_name
        FROM visits v
        LEFT JOIN staff s ON s.id = v.doctor_id
        WHERE v.patient_id = ${id}
        ORDER BY v.visited_at DESC
      `,
      sql`
        SELECT d.*, s.full_name AS doctor_name
        FROM diagnoses d
        LEFT JOIN staff s ON s.id = d.doctor_id
        WHERE d.patient_id = ${id}
        ORDER BY d.diagnosed_at DESC
      `,
      sql`
        SELECT pr.*, s.full_name AS doctor_name
        FROM prescriptions pr
        LEFT JOIN staff s ON s.id = pr.doctor_id
        WHERE pr.patient_id = ${id}
        ORDER BY pr.prescribed_at DESC
      `,
    ]);

    return Response.json({
      ...patientRows[0],
      history,
      visits,
      diagnoses,
      prescriptions,
    });
  }

  // ── PUT /api/patients/:id — update patient ─────────────
  const matchUpdate = pathname.match(/^\/api\/patients\/(\d+)$/);
  if (method === "PUT" && matchUpdate) {
    const id   = parseInt(matchUpdate[1]);
    const body = await req.json();
    const {
      fullName, dateOfBirth, gender, bloodType,
      phone, address, emergencyContactName,
      emergencyContactPhone, allergies,
    } = body;

    const rows = await sql`
      UPDATE patients SET
        full_name               = ${fullName},
        date_of_birth           = ${dateOfBirth},
        gender                  = ${gender},
        blood_type              = ${bloodType || null},
        phone                   = ${phone || null},
        address                 = ${address || null},
        emergency_contact_name  = ${emergencyContactName || null},
        emergency_contact_phone = ${emergencyContactPhone || null},
        allergies               = ${allergies || null},
        updated_at              = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!rows[0]) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    return Response.json(rows[0]);
  }

  // ── POST /api/patients/:id/history ────────────────────
  const matchHistory = pathname.match(/^\/api\/patients\/(\d+)\/history$/);
  if (method === "POST" && matchHistory) {
    const id   = parseInt(matchHistory[1]);
    const body = await req.json();

    const rows = await sql`
      INSERT INTO medical_history (patient_id, condition, notes, recorded_by)
      VALUES (${id}, ${body.condition}, ${body.notes || null}, ${user.id})
      RETURNING *
    `;

    return Response.json(rows[0], { status: 201 });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
};

export const config = {
  path: ["/api/patients", "/api/patients/*"],
};
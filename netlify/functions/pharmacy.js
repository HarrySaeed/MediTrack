// netlify/functions/pharmacy.js

import { neon } from "@netlify/neon";
import jwt from "jsonwebtoken";

const sql = neon();
const JWT_SECRET = Netlify.env.get("JWT_SECRET") || "meditrack-secret-key";

function verifyToken(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try { return jwt.verify(auth.split(" ")[1], JWT_SECRET); } catch { return null; }
}

export default async (req) => {
  const user = verifyToken(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "pharmacist") return Response.json({ error: "Forbidden" }, { status: 403 });

  const url      = new URL(req.url);
  const pathname = url.pathname;
  const method   = req.method;

  // GET /api/pharmacy/stats
  if (method === "GET" && pathname === "/api/pharmacy/stats") {
    const [pending, filledToday, cancelled, allergyAlerts] = await Promise.all([
      sql`SELECT COUNT(*) AS count FROM prescriptions WHERE status = 'pending'`,
      sql`SELECT COUNT(*) AS count FROM prescriptions WHERE status = 'filled' AND DATE(filled_at) = CURRENT_DATE`,
      sql`SELECT COUNT(*) AS count FROM prescriptions WHERE status = 'cancelled' AND DATE(filled_at) = CURRENT_DATE`,
      sql`SELECT COUNT(DISTINCT p.id) AS count FROM prescriptions pr JOIN patients p ON p.id = pr.patient_id WHERE pr.status = 'pending' AND p.allergies IS NOT NULL AND p.allergies != '' AND LOWER(p.allergies) != 'none'`,
    ]);
    return Response.json({
      pending:      parseInt(pending[0].count),
      filledToday:  parseInt(filledToday[0].count),
      cancelled:    parseInt(cancelled[0].count),
      allergyAlerts: parseInt(allergyAlerts[0].count),
    });
  }

  // GET /api/pharmacy/pending
  if (method === "GET" && pathname === "/api/pharmacy/pending") {
    const rows = await sql`
      SELECT
        pr.*,
        p.full_name  AS patient_name,
        p.mrn        AS patient_mrn,
        p.allergies  AS patient_allergies,
        s.full_name  AS doctor_name
      FROM prescriptions pr
      JOIN patients p ON p.id = pr.patient_id
      JOIN staff    s ON s.id = pr.doctor_id
      WHERE pr.status = 'pending'
      ORDER BY pr.prescribed_at DESC
    `;
    return Response.json(rows);
  }

  // GET /api/pharmacy/patients/:id
  const matchPatient = pathname.match(/^\/api\/pharmacy\/patients\/(\d+)$/);
  if (method === "GET" && matchPatient) {
    const id = parseInt(matchPatient[1]);

    const patients = await sql`
      SELECT id, full_name, mrn, allergies, date_of_birth, gender
      FROM patients
      WHERE id = ${id} OR mrn = ${matchPatient[1]}
    `;

    if (!patients[0]) return Response.json({ error: "Patient not found" }, { status: 404 });

    const patient = patients[0];
    const prescriptions = await sql`
      SELECT pr.*, s.full_name AS doctor_name
      FROM prescriptions pr
      JOIN staff s ON s.id = pr.doctor_id
      WHERE pr.patient_id = ${patient.id}
      ORDER BY pr.prescribed_at DESC
    `;

    return Response.json({ ...patient, prescriptions });
  }

  // PATCH /api/pharmacy/prescriptions/:id/fill
  const matchFill = pathname.match(/^\/api\/pharmacy\/prescriptions\/(\d+)\/(fill|cancel)$/);
  if (method === "PATCH" && matchFill) {
    const id     = parseInt(matchFill[1]);
    const action = matchFill[2];
    const status = action === "fill" ? "filled" : "cancelled";

    const rows = await sql`
      UPDATE prescriptions
      SET
        status        = ${status},
        pharmacist_id = ${user.id},
        filled_at     = ${action === "fill" ? new Date().toISOString() : null}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!rows[0]) return Response.json({ error: "Prescription not found" }, { status: 404 });
    return Response.json(rows[0]);
  }

  return Response.json({ error: "Not found" }, { status: 404 });
};

export const config = {
  path: [
    "/api/pharmacy/stats",
    "/api/pharmacy/pending",
    "/api/pharmacy/patients/*",
    "/api/pharmacy/prescriptions/*",
  ],
};
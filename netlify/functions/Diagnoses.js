// netlify/functions/diagnoses.js

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
  if (user.role !== "doctor") return Response.json({ error: "Forbidden" }, { status: 403 });

  const url      = new URL(req.url);
  const match    = url.pathname.match(/^\/api\/patients\/(\d+)\/(diagnoses|prescriptions)$/);
  if (!match) return Response.json({ error: "Not found" }, { status: 404 });

  const patientId = parseInt(match[1]);
  const type      = match[2];

  if (req.method === "POST" && type === "diagnoses") {
    const { condition, icdCode, status, notes } = await req.json();
    if (!condition) return Response.json({ error: "Condition is required" }, { status: 400 });

    const rows = await sql`
      INSERT INTO diagnoses (patient_id, doctor_id, condition, icd_code, status, notes)
      VALUES (${patientId}, ${user.id}, ${condition}, ${icdCode || null}, ${status || "active"}, ${notes || null})
      RETURNING *
    `;
    return Response.json(rows[0], { status: 201 });
  }

  if (req.method === "POST" && type === "prescriptions") {
    const { drugName, dosage, frequency, duration, instructions } = await req.json();
    if (!drugName || !dosage || !frequency) {
      return Response.json({ error: "Drug name, dosage and frequency are required" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO prescriptions (patient_id, doctor_id, drug_name, dosage, frequency, duration, instructions, status)
      VALUES (${patientId}, ${user.id}, ${drugName}, ${dosage}, ${frequency}, ${duration || null}, ${instructions || null}, 'pending')
      RETURNING *
    `;
    return Response.json(rows[0], { status: 201 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config = {
  path: ["/api/patients/*/diagnoses", "/api/patients/*/prescriptions"],
};
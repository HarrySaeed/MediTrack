// netlify/functions/admin.js

import { neon } from "@netlify/neon";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sql = neon();
const JWT_SECRET = Netlify.env.get("JWT_SECRET") || "meditrack-secret-key";

function verifyToken(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try { return jwt.verify(auth.split(" ")[1], JWT_SECRET); } catch { return null; }
}

// Generate a random temp password like "Temp@4829"
function generateTempPassword() {
  const chars = "abcdefghijkmnpqrstuvwxyz";
  const nums  = "23456789";
  const rand  = (s) => s[Math.floor(Math.random() * s.length)];
  return "Temp@" + rand(nums) + rand(nums) + rand(chars) + rand(chars) + rand(nums) + rand(chars);
}

export default async (req) => {
  const user = verifyToken(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url      = new URL(req.url);
  const pathname = url.pathname;
  const method   = req.method;

  // ── GET /api/admin/stats ─────────────────────────────
  if (method === "GET" && pathname === "/api/admin/stats") {
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const [patients, staff, diagnoses, prescriptions] = await Promise.all([
      sql`SELECT COUNT(*) AS count FROM patients`,
      sql`SELECT COUNT(*) AS count FROM staff WHERE is_active = true`,
      sql`SELECT COUNT(*) AS count FROM diagnoses WHERE status = 'active'`,
      sql`SELECT COUNT(*) AS count FROM prescriptions WHERE status = 'pending'`,
    ]);

    return Response.json({
      totalPatients:        parseInt(patients[0].count),
      activeStaff:          parseInt(staff[0].count),
      activeDiagnoses:      parseInt(diagnoses[0].count),
      pendingPrescriptions: parseInt(prescriptions[0].count),
    });
  }

  // ── GET /api/admin/staff ─────────────────────────────
  if (method === "GET" && pathname === "/api/admin/staff") {
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const rows = await sql`
      SELECT id, full_name, email, role, department, phone, is_active, created_at
      FROM staff
      ORDER BY role, full_name
    `;
    return Response.json(rows);
  }

  // ── POST /api/admin/staff — create staff ─────────────
  if (method === "POST" && pathname === "/api/admin/staff") {
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { fullName, email, role, department, phone } = await req.json();

    if (!fullName || !email || !role) {
      return Response.json({ error: "Full name, email and role are required" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM staff WHERE email = ${email.toLowerCase()}`;
    if (existing[0]) {
      return Response.json({ error: "Email already exists" }, { status: 409 });
    }

    const tempPassword = generateTempPassword();
    const hash         = await bcrypt.hash(tempPassword, 10);

    const rows = await sql`
      INSERT INTO staff (full_name, email, password_hash, role, department, phone, must_change_password)
      VALUES (${fullName}, ${email.toLowerCase()}, ${hash}, ${role}, ${department || null}, ${phone || null}, true)
      RETURNING id, full_name, email, role, department, phone, is_active, created_at
    `;

    // Return temp password once — admin must share it with the staff member
    return Response.json({ ...rows[0], tempPassword }, { status: 201 });
  }

  // ── PATCH /api/admin/staff/:id/toggle — activate/deactivate
  const matchToggle = pathname.match(/^\/api\/admin\/staff\/(\d+)\/toggle$/);
  if (method === "PATCH" && matchToggle) {
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const id   = parseInt(matchToggle[1]);
    const rows = await sql`
      UPDATE staff SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, full_name, email, role, is_active
    `;

    if (!rows[0]) return Response.json({ error: "Staff not found" }, { status: 404 });
    return Response.json(rows[0]);
  }

  return Response.json({ error: "Not found" }, { status: 404 });
};

export const config = {
  path: ["/api/admin/stats", "/api/admin/staff", "/api/admin/staff/*"],
};

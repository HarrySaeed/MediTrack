// netlify/functions/change-password.js

import { neon } from "@netlify/neon";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sql = neon();
const JWT_SECRET = Netlify.env.get("JWT_SECRET") || "meditrack-secret-key";

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET);
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return Response.json({ error: "Current and new password are required" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return Response.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  // Get current password hash
  const rows = await sql`SELECT id, password_hash FROM staff WHERE id = ${decoded.id}`;
  if (!rows[0]) return Response.json({ error: "User not found" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) return Response.json({ error: "Current password is incorrect" }, { status: 401 });

  const newHash = await bcrypt.hash(newPassword, 10);

  await sql`
    UPDATE staff
    SET password_hash = ${newHash}, must_change_password = false, updated_at = NOW()
    WHERE id = ${decoded.id}
  `;

  return Response.json({ message: "Password changed successfully" });
};

export const config = {
  path: "/api/auth/change-password",
};

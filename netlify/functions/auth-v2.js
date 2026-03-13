// netlify/functions/auth.js

import { neon } from "@netlify/neon";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sql = neon();
const JWT_SECRET = Netlify.env.get("JWT_SECRET") || "meditrack-secret-key";

export default async (req) => {
  const url = new URL(req.url);

  // POST /api/auth/login
  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    try {
      const { email, password } = await req.json();
      if (!email || !password) return Response.json({ error: "Email and password are required" }, { status: 400 });

      const rows = await sql`
        SELECT id, full_name, email, password_hash, role, department, phone, is_active, must_change_password
        FROM staff WHERE email = ${email.toLowerCase()}
      `;

      const user = rows[0];
      if (!user)            return Response.json({ error: "Invalid email or password" }, { status: 401 });
      if (!user.is_active)  return Response.json({ error: "Account deactivated. Contact admin." }, { status: 403 });

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return Response.json({ error: "Invalid email or password" }, { status: 401 });

      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "8h" });

      return Response.json({
        token,
        user: {
          id:                 user.id,
          name:               user.full_name,
          email:              user.email,
          role:               user.role,
          department:         user.department,
          phone:              user.phone,
          mustChangePassword: user.must_change_password,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  // GET /api/auth/me
  if (req.method === "GET" && url.pathname === "/api/auth/me") {
    try {
      const auth = req.headers.get("authorization");
      if (!auth?.startsWith("Bearer ")) return Response.json({ error: "No token" }, { status: 401 });

      const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET);
      const rows    = await sql`
        SELECT id, full_name, email, role, department, phone, must_change_password
        FROM staff WHERE id = ${decoded.id} AND is_active = true
      `;

      const user = rows[0];
      if (!user) return Response.json({ error: "User not found" }, { status: 404 });

      return Response.json({
        id: user.id, name: user.full_name, email: user.email,
        role: user.role, department: user.department, phone: user.phone,
        mustChangePassword: user.must_change_password,
      });
    } catch {
      return Response.json({ error: "Invalid or expired token" }, { status: 401 });
    }
  }

  return Response.json({ error: "Not found" }, { status: 404 });
};

export const config = {
  path: ["/api/auth/login", "/api/auth/me"],
};
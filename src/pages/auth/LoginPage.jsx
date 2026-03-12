/* ─────────────────────────────────────────────────────────
   FILE: src/pages/auth/LoginPage.jsx
   ───────────────────────────────────────────────────────── */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/common/UI";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "doctor")     navigate("/doctor");
      else if (user.role === "pharmacist") navigate("/pharmacist");
      else if (user.role === "admin") navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", background: "var(--ink)",
      fontFamily: "var(--font-body)",
    }}>
      {/* Left decorative panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px", borderRight: "1px solid rgba(255,255,255,.07)",
        background: "linear-gradient(135deg, #0D1117 0%, #1a1f2e 100%)",
      }}>
        <div style={{ maxWidth: 420 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--indigo)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏥</div>
            <span style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>MediTrack</span>
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: 42, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 16 }}>
            Hospital<br />Management<br />System
          </h1>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 15, lineHeight: 1.7 }}>
            Unified platform for doctors, pharmacists, and administrators to manage patient care seamlessly.
          </p>

          {/* Role chips */}
          <div style={{ display: "flex", gap: 8, marginTop: 36, flexWrap: "wrap" }}>
            {[["🩺", "Doctors"], ["💊", "Pharmacists"], ["🔒", "Admins"]].map(([icon, label]) => (
              <div key={label} style={{
                padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.09)", color: "rgba(255,255,255,.5)",
                fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
              }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div style={{
        width: 480, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "60px 52px", background: "#fff",
      }}>
        <div style={{ width: "100%" }} className="animate-fade">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--ink)", marginBottom: 6, letterSpacing: "-0.02em" }}>Sign in</h2>
          <p style={{ fontSize: 14, color: "var(--ink-faint)", marginBottom: 32 }}>Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@hospital.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />

            {error && (
              <div style={{ padding: "10px 14px", background: "var(--red-bg)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--red)", borderLeft: "3px solid var(--red)" }}>
                {error}
              </div>
            )}

            <Button type="submit" size="lg" fullWidth loading={loading} style={{ marginTop: 4 }}>
              Sign in
            </Button>
          </form>

          {/* Demo hint */}
          <div style={{ marginTop: 28, padding: "14px 16px", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Demo accounts</p>
            {[
              ["doctor@meditrack.com",    "Doctor"],
              ["pharmacy@meditrack.com",  "Pharmacist"],
              ["admin@meditrack.com",     "Admin"],
            ].map(([email, role]) => (
              <div key={role} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>{email}</span>
                <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{role}</span>
              </div>
            ))}
            <p style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 6 }}>Password: <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>Password123!</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
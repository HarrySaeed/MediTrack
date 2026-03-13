import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext-v2";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "doctor")          navigate("/doctor");
      else if (user.role === "pharmacist") navigate("/pharmacist");
      else if (user.role === "admin")      navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 12px", fontSize: 14,
    border: "1.5px solid #d1d5db", borderRadius: 8,
    outline: "none", color: "#111", background: "#fff",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "#374151", marginBottom: 5,
    textTransform: "uppercase", letterSpacing: "0.05em",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px", background: "linear-gradient(135deg, #0D1117 0%, #1a1f2e 100%)",
      }}>
        <div style={{ maxWidth: 420 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏥</div>
            <span style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>MediTrack</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
            Hospital<br />Management<br />System
          </h1>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: 15, lineHeight: 1.7 }}>
            Unified platform for doctors, pharmacists, and administrators to manage patient care seamlessly.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 36, flexWrap: "wrap" }}>
            {[["🩺", "Doctors"], ["💊", "Pharmacists"], ["🔒", "Admins"]].map(([icon, label]) => (
              <div key={label} style={{
                padding: "6px 14px", borderRadius: 20,
                background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                color: "rgba(255,255,255,.6)", fontSize: 12, display: "flex", alignItems: "center", gap: 6,
              }}>
                {icon} {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        width: 480, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "60px 52px", background: "#fff",
      }}>
        <div style={{ width: "100%" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 6 }}>Sign in</h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 32 }}>Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <div>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                placeholder="you@hospital.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={inputStyle}
                required
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 14px", background: "#FEF2F2",
                borderRadius: 8, fontSize: 13, color: "#DC2626",
                borderLeft: "3px solid #DC2626",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px", fontSize: 15, fontWeight: 600,
                background: loading ? "#818CF8" : "#4F46E5", color: "#fff",
                border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
                marginTop: 4,
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{
            marginTop: 28, padding: "14px 16px",
            background: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB",
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Demo accounts
            </p>
            {[
              ["doctor@meditrack.com",   "Doctor"],
              ["pharmacy@meditrack.com", "Pharmacist"],
              ["admin@meditrack.com",    "Admin"],
            ].map(([email, role]) => (
              <div key={role} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#374151", fontFamily: "monospace" }}>{email}</span>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{role}</span>
              </div>
            ))}
            <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
              Password: <code style={{ fontFamily: "monospace", fontSize: 11, color: "#374151" }}>Password123!</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
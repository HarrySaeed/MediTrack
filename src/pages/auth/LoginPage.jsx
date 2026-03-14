// src/Pages/Auth/Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext-v2";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]         = useState({ email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

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

  return (
    <div className="login-page">

      {/* ── Left panel ── */}
      <div className="login-left">
        <div style={{ maxWidth: 420 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="sidebar-logo-icon">🏥</div>
            <span className="text-white font-black text-lg">MediTrack</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 40, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
            Hospital<br />Management<br />System
          </h1>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: 15, lineHeight: 1.7 }}>
            Unified platform for doctors, pharmacists, and administrators to manage patient care seamlessly.
          </p>
          <div className="flex gap-2 mt-6 flex-wrap">
            {[["🩺", "Doctors"], ["💊", "Pharmacists"], ["🔒", "Admins"]].map(([icon, label]) => (
              <div key={label} style={{
                padding: "6px 14px", borderRadius: 20,
                background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                color: "rgba(255,255,255,.6)", fontSize: 12,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {icon} {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-right">
        <div className="login-form-wrap">
          <h2 className="login-title">Sign in</h2>
          <p className="login-subtitle">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@hospital.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ paddingRight: 44 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    cursor: "pointer", fontSize: 16,
                    color: "#9CA3AF", padding: 2,
                    lineHeight: 1,
                  }}
                  title={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-full mt-2"
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="login-demo-box mt-6">
            <p className="text-xs text-upper text-faint mb-2">Demo accounts</p>
            {[
              ["doctor@meditrack.com",   "Doctor"],
              ["pharmacy@meditrack.com", "Pharmacist"],
              ["admin@meditrack.com",    "Admin"],
            ].map(([email, role]) => (
              <div key={role} className="flex justify-between mb-1">
                <span className="text-sm text-mono" style={{ color: "#374151" }}>{email}</span>
                <span className="text-xs text-faint">{role}</span>
              </div>
            ))}
            <p className="text-xs text-faint mt-2">
              Password: <code className="text-mono" style={{ color: "#374151" }}>Password123!</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// src/pages/auth/ChangePasswordPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [form, setForm]  = useState({ current: "", newPass: "", confirm: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.newPass !== form.confirm) { setError("New passwords do not match"); return; }
    if (form.newPass.length < 8)       { setError("Password must be at least 8 characters"); return; }
    if (form.newPass === form.current)  { setError("New password must be different from current password"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("mt_token")}` },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      const stored = JSON.parse(localStorage.getItem("mt_user") || "{}");
      stored.mustChangePassword = false;
      localStorage.setItem("mt_user", JSON.stringify(stored));

      if (user.role === "doctor")          navigate("/doctor");
      else if (user.role === "pharmacist") navigate("/pharmacist");
      else if (user.role === "admin")      navigate("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle}
      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF", padding: 2, lineHeight: 1 }}>
      {show ? "🙈" : "👁️"}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3F4F6", fontFamily: "sans-serif" }}>
      <div style={{ width: 440, background: "#fff", borderRadius: 12, padding: "40px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>🔐</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 6 }}>Set your password</h2>
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            Welcome, <strong>{user?.name}</strong>! You must set a new password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Temporary Password *</label>
            <div style={{ position: "relative" }}>
              <input className="form-input" type={showCurrent ? "text" : "password"}
                placeholder="Enter your temporary password"
                value={form.current} onChange={e => setForm(p => ({ ...p, current: e.target.value }))}
                style={{ paddingRight: 44 }} required />
              {eyeBtn(showCurrent, () => setShowCurrent(p => !p))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">New Password *</label>
            <div style={{ position: "relative" }}>
              <input className="form-input" type={showNew ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.newPass} onChange={e => setForm(p => ({ ...p, newPass: e.target.value }))}
                style={{ paddingRight: 44 }} required minLength={8} />
              {eyeBtn(showNew, () => setShowNew(p => !p))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password *</label>
            <div style={{ position: "relative" }}>
              <input className="form-input" type={showConfirm ? "text" : "password"}
                placeholder="Repeat new password"
                value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                style={{ paddingRight: 44 }} required minLength={8} />
              {eyeBtn(showConfirm, () => setShowConfirm(p => !p))}
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-full mt-2">
            {loading ? <span className="spinner" /> : null}
            {loading ? "Saving..." : "Set New Password"}
          </button>
        </form>

        <button onClick={logout} style={{ width: "100%", marginTop: 12, padding: "10px", fontSize: 13, background: "transparent", color: "#9CA3AF", border: "none", cursor: "pointer" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
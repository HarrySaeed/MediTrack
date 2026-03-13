// src/Pages/Auth/ChangePasswordPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext-v2";

export default function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ current: "", newPass: "", confirm: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.newPass !== form.confirm) {
      setError("New passwords do not match"); return;
    }
    if (form.newPass.length < 8) {
      setError("Password must be at least 8 characters"); return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${localStorage.getItem("mt_token")}`,
        },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPass }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      // Update stored user to remove must_change_password flag
      const stored = JSON.parse(localStorage.getItem("mt_user") || "{}");
      stored.mustChangePassword = false;
      localStorage.setItem("mt_user", JSON.stringify(stored));

      // Redirect to their dashboard
      if (user.role === "doctor")          navigate("/doctor");
      else if (user.role === "pharmacist") navigate("/pharmacist");
      else if (user.role === "admin")      navigate("/admin");

    } catch (err) {
      setError("Something went wrong. Please try again.");
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
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F3F4F6", fontFamily: "sans-serif",
    }}>
      <div style={{
        width: 440, background: "#fff", borderRadius: 12,
        padding: "40px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, background: "#EEF2FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 16px",
          }}>🔐</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 6 }}>
            Set your password
          </h2>
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            Welcome, <strong>{user?.name}</strong>! You must set a new password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Temporary password</label>
            <input
              type="password" placeholder="Enter your temporary password"
              value={form.current}
              onChange={e => setForm(p => ({ ...p, current: e.target.value }))}
              style={inputStyle} required
            />
          </div>

          <div>
            <label style={labelStyle}>New password</label>
            <input
              type="password" placeholder="Min. 8 characters"
              value={form.newPass}
              onChange={e => setForm(p => ({ ...p, newPass: e.target.value }))}
              style={inputStyle} required
            />
          </div>

          <div>
            <label style={labelStyle}>Confirm new password</label>
            <input
              type="password" placeholder="Repeat new password"
              value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
              style={inputStyle} required
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
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: "12px", fontSize: 15, fontWeight: 600,
              background: loading ? "#818CF8" : "#4F46E5", color: "#fff",
              border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4,
            }}
          >
            {loading ? "Saving..." : "Set new password"}
          </button>
        </form>

        <button
          onClick={logout}
          style={{
            width: "100%", marginTop: 12, padding: "10px", fontSize: 13,
            background: "transparent", color: "#9CA3AF", border: "none",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// src/Pages/admin/AddStaff.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../Components/Layout/AppLayout";

const token = () => localStorage.getItem("mt_token");
const hdr   = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

const INITIAL = { fullName: "", email: "", role: "", department: "", phone: "" };

export default function AddStaff() {
  const navigate          = useNavigate();
  const [form, setForm]   = useState(INITIAL);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);

  function setF(k) { return e => setForm(p => ({ ...p, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/admin/staff", {
        method: "POST", headers: hdr(), body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create staff member"); return; }
      setCreated(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ─────────────────────────────────────
  if (created) return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Staff Created ✅</h1>
            <p className="page-subtitle">Share the credentials below with the new staff member</p>
          </div>
        </div>

        <div className="card card-pad-lg" style={{ maxWidth: 560 }}>

          {/* Staff summary */}
          <div className="flex items-center gap-4 mb-6">
            <div className="avatar avatar-lg" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
              {created.full_name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{created.full_name}</div>
              <div className="flex gap-2">
                <span className={`badge ${created.role === "doctor" ? "badge-blue" : created.role === "pharmacist" ? "badge-green" : "badge-amber"}`} style={{ textTransform: "capitalize" }}>
                  {created.role}
                </span>
                {created.department && <span className="badge badge-gray">{created.department}</span>}
              </div>
            </div>
          </div>

          {/* Credentials box */}
          <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "20px 24px", border: "1px solid #E5E7EB", marginBottom: 20 }}>
            <p className="text-xs text-upper text-faint mb-4">Login Credentials</p>
            <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: "1px solid #E5E7EB" }}>
              <span className="text-sm text-muted font-semi">Email</span>
              <span className="text-mono text-base text-dark">{created.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted font-semi">Temporary Password</span>
              <span className="text-mono text-xl font-bold text-primary">{created.tempPassword}</span>
            </div>
          </div>

          <div className="alert alert-warning mb-6">
            ⚠ Copy this password now — it will <strong>not</strong> be shown again. The staff member must change it on first login.
          </div>

          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={() => navigate("/admin/staff")}>
              View All Staff
            </button>
            <button className="btn btn-secondary" onClick={() => { setCreated(null); setForm(INITIAL); }}>
              Add Another
            </button>
          </div>

        </div>
      </div>
    </AppLayout>
  );

  // ── Form ───────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="page">

        <div className="page-header">
          <div>
            <h1 className="page-title">Add Staff Member</h1>
            <p className="page-subtitle">Create a new account for a doctor, pharmacist or admin</p>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card card-pad-lg" style={{ maxWidth: 680 }}>

            {/* Personal */}
            <div className="form-section">
              <div className="form-section-title">Staff Details</div>
              <div className="form-grid-2" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="e.g. Dr. Sarah Chen"
                    value={form.fullName} onChange={setF("fullName")} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" placeholder="sarah@hospital.com"
                    value={form.email} onChange={setF("email")} required />
                </div>
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select className="form-select" value={form.role} onChange={setF("role")} required>
                    <option value="">Select role</option>
                    <option value="doctor">Doctor</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" placeholder="e.g. Cardiology"
                    value={form.department} onChange={setF("department")} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="+1-555-0000"
                    value={form.phone} onChange={setF("phone")} />
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="alert alert-info mb-6">
              ℹ A temporary password will be auto-generated. Share it with the staff member — they'll be prompted to change it on first login.
            </div>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <div className="flex justify-end gap-3">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : null}
                {loading ? "Creating..." : "Create Staff Member"}
              </button>
            </div>

          </div>
        </form>

      </div>
    </AppLayout>
  );
}
// src/Pages/admin/StaffManangement.jsx

import { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";

const token = () => localStorage.getItem("mt_token");
const hdr   = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

const ROLE_BADGE = {
  doctor:     "badge-blue",
  pharmacist: "badge-green",
  admin:      "badge-amber",
};

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

// ── Add Staff Modal ────────────────────────────────────────
function AddStaffModal({ onClose, onCreated }) {
  const [form, setForm]       = useState({ fullName: "", email: "", role: "", department: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [created, setCreated] = useState(null); // shows temp password

  function setF(k) { return e => setForm(p => ({ ...p, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/admin/staff", { method: "POST", headers: hdr(), body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create staff"); return; }
      setCreated(data);
      onCreated();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Show temp password screen after creation
  if (created) return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Staff Created ✅</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="alert alert-success">
            <strong>{created.full_name}</strong> has been added successfully.
          </div>
          <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "20px 24px", border: "1px solid #E5E7EB" }}>
            <p className="text-sm text-faint text-upper mb-3">Share these credentials with the new staff member</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted font-semi">Email</span>
              <span className="text-mono text-base text-dark">{created.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted font-semi">Temp Password</span>
              <span className="text-mono text-lg font-bold text-primary">{created.tempPassword}</span>
            </div>
          </div>
          <div className="alert alert-warning">
            ⚠ Copy this password now — it won't be shown again. The staff member must change it on first login.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add Staff Member</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="e.g. Dr. John Smith"
                  value={form.fullName} onChange={setF("fullName")} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" placeholder="john@hospital.com"
                  value={form.email} onChange={setF("email")} required />
              </div>
            </div>
            <div className="form-grid-2">
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
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+1-555-0000"
                value={form.phone} onChange={setF("phone")} />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? "Creating..." : "Create Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function StaffManagement() {
  const [staff, setStaff]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter]   = useState("all");

  useEffect(() => { loadStaff(); }, []);

  async function loadStaff() {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/staff", { headers: hdr() });
      const data = await res.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleToggle(id) {
    setToggling(id);
    try {
      await fetch(`/api/admin/staff/${id}/toggle`, { method: "PATCH", headers: hdr() });
      await loadStaff();
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
  }

  const filtered = staff.filter(s => filter === "all" || s.role === filter);

  return (
    <AppLayout>
      <div className="page">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Staff Management</h1>
            <p className="page-subtitle">{staff.length} staff member{staff.length !== 1 ? "s" : ""} total</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Staff
          </button>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="tabs">
          {[
            { key: "all",        label: `All (${staff.length})` },
            { key: "doctor",     label: `Doctors (${staff.filter(s => s.role === "doctor").length})` },
            { key: "pharmacist", label: `Pharmacists (${staff.filter(s => s.role === "pharmacist").length})` },
            { key: "admin",      label: `Admins (${staff.filter(s => s.role === "admin").length})` },
          ].map(t => (
            <button key={t.key} className={`tab${filter === t.key ? " active" : ""}`} onClick={() => setFilter(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Staff Table ── */}
        <div className="card">
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ borderColor: "#E5E7EB", borderTopColor: "#4F46E5", width: 28, height: 28 }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <div className="empty-title">No staff found</div>
              <div className="empty-desc">Add a staff member using the button above</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">{getInitials(s.full_name)}</div>
                          <span className="td-primary">{s.full_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${ROLE_BADGE[s.role] || "badge-gray"}`} style={{ textTransform: "capitalize" }}>
                          {s.role}
                        </span>
                      </td>
                      <td className="td-muted">{s.department || "—"}</td>
                      <td className="td-muted">{s.email}</td>
                      <td className="td-muted">{s.phone || "—"}</td>
                      <td>
                        <span className={`badge ${s.is_active ? "badge-green" : "badge-gray"}`}>
                          {s.is_active ? "● Active" : "○ Inactive"}
                        </span>
                      </td>
                      <td className="td-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${s.is_active ? "btn-danger" : "btn-success"}`}
                          disabled={toggling === s.id}
                          onClick={() => handleToggle(s.id)}
                        >
                          {toggling === s.id
                            ? <span className="spinner" />
                            : s.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── Add Staff Modal ── */}
      {showModal && (
        <AddStaffModal
          onClose={() => setShowModal(false)}
          onCreated={loadStaff}
        />
      )}

    </AppLayout>
  );
}
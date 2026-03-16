// src/pages/doctors/RegisterPatient.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../Components/Layout/AppLayout";

const token = () => localStorage.getItem("mt_token");

const INITIAL = {
  fullName: "", dateOfBirth: "", gender: "", bloodType: "",
  cnic: "", phone: "", address: "",
  emergencyContactName: "", emergencyContactPhone: "",
  allergies: "",
};

function formatCNIC(value) {
  // Auto-format as user types: XXXXX-XXXXXXX-X
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length <= 5)  return digits;
  if (digits.length <= 12) return digits.slice(0,5) + "-" + digits.slice(5);
  return digits.slice(0,5) + "-" + digits.slice(5,12) + "-" + digits.slice(12,13);
}

export default function RegisterPatient() {
  const navigate          = useNavigate();
  const [form, setForm]   = useState(INITIAL);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to register patient"); return; }
      navigate(`/doctor/patients/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="page">

        <div className="page-header">
          <div>
            <h1 className="page-title">Register Patient</h1>
            <p className="page-subtitle">All fields are required</p>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card card-pad-lg">

            {/* ── Personal Information ── */}
            <div className="form-section">
              <div className="form-section-title">Personal Information</div>
              <div className="form-grid-2" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="e.g. John Smith"
                    value={form.fullName} onChange={set("fullName")} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input className="form-input" type="date"
                    value={form.dateOfBirth} onChange={set("dateOfBirth")} required />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">CNIC *</label>
                <input className="form-input" placeholder="e.g. 35404-5658770-1"
                  value={form.cnic}
                  onChange={e => setForm(p => ({ ...p, cnic: formatCNIC(e.target.value) }))}
                  maxLength={15} required />
                <span className="form-hint">Pakistani National Identity Card number (XXXXX-XXXXXXX-X)</span>
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select className="form-select" value={form.gender} onChange={set("gender")} required>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Type *</label>
                  <select className="form-select" value={form.bloodType} onChange={set("bloodType")} required>
                    <option value="">Select blood type</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" placeholder="+1-555-0000"
                    value={form.phone} onChange={set("phone")} required />
                </div>
              </div>
            </div>

            {/* ── Address ── */}
            <div className="form-section">
              <div className="form-section-title">Address</div>
              <div className="form-group">
                <label className="form-label">Home Address *</label>
                <textarea className="form-textarea" placeholder="Street, City, State, ZIP"
                  value={form.address} onChange={set("address")} style={{ minHeight: 72 }} required />
              </div>
            </div>

            {/* ── Emergency Contact ── */}
            <div className="form-section">
              <div className="form-section-title">Emergency Contact</div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Contact Name *</label>
                  <input className="form-input" placeholder="e.g. Jane Smith"
                    value={form.emergencyContactName} onChange={set("emergencyContactName")} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
                  <input className="form-input" placeholder="+1-555-0000"
                    value={form.emergencyContactPhone} onChange={set("emergencyContactPhone")} required />
                </div>
              </div>
            </div>

            {/* ── Medical Notes ── */}
            <div className="form-section" style={{ marginBottom: 0 }}>
              <div className="form-section-title">Medical Notes</div>
              <div className="form-group">
                <label className="form-label">Known Allergies *</label>
                <textarea className="form-textarea"
                  placeholder="e.g. Penicillin, Sulfa drugs (write 'None' if no allergies)"
                  value={form.allergies} onChange={set("allergies")} style={{ minHeight: 72 }} required />
              </div>
            </div>

            {error && <div className="alert alert-danger mt-4">{error}</div>}

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : null}
                {loading ? "Registering..." : "Register Patient"}
              </button>
            </div>

          </div>
        </form>

      </div>
    </AppLayout>
  );
}
// src/Pages/pharmacist/PatientsLook.jsx

import { useState } from "react";
import AppLayout from "../../Components/layout/AppLayout";

const token = () => localStorage.getItem("mt_token");
const hdr   = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

export default function PatientLookup() {
  const [query, setQuery]     = useState("");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing]   = useState(null);
  const [error, setError]     = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setError(""); setPatient(null); setLoading(true);
    try {
      const res  = await fetch(`/api/pharmacy/patients/${query.trim()}`, { headers: hdr() });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Patient not found"); return; }
      setPatient(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id, action) {
    setActing(id);
    try {
      await fetch(`/api/pharmacy/prescriptions/${id}/${action}`, { method: "PATCH", headers: hdr() });
      // Reload patient to refresh prescription statuses
      const res  = await fetch(`/api/pharmacy/patients/${query.trim()}`, { headers: hdr() });
      const data = await res.json();
      setPatient(data);
    } catch (e) { console.error(e); }
    finally { setActing(null); }
  }

  function calcAge(dob) {
    if (!dob) return "—";
    return Math.floor((Date.now() - new Date(dob)) / (1000 * 60 * 60 * 24 * 365.25)) + " yrs";
  }

  const pending = patient?.prescriptions?.filter(rx => rx.status === "pending") || [];
  const history = patient?.prescriptions?.filter(rx => rx.status !== "pending") || [];

  return (
    <AppLayout>
      <div className="page">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Patient Lookup</h1>
            <p className="page-subtitle">Search by patient ID to view prescriptions</p>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="card card-pad mb-6">
          <form onSubmit={handleSearch} className="flex gap-3 items-center">
            <div className="form-group flex-1" style={{ marginBottom: 0 }}>
              <input
                className="form-input"
                placeholder="Enter Patient ID"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : "🔍"}
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
          {error && <div className="alert alert-danger mt-4">{error}</div>}
        </div>

        {/* ── Patient Found ── */}
        {patient && (
          <>
            {/* Patient Info Card */}
            <div className="card card-pad mb-6">
              <div className="flex items-center gap-4">
                <div className="avatar avatar-lg">{patient.full_name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}</div>
                <div className="flex-1">
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 6 }}>{patient.full_name}</h2>
                  <div className="flex gap-3 items-center flex-wrap">
                    <span className="td-mono">{patient.mrn}</span>
                    <span className="badge badge-blue" style={{ textTransform: "capitalize" }}>{patient.gender}</span>
                    <span className="badge badge-gray">{calcAge(patient.date_of_birth)}</span>
                    {patient.allergies && <span className="badge badge-amber">⚠ {patient.allergies}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="text-sm text-faint mb-1">Pending</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: pending.length > 0 ? "#D97706" : "#059669" }}>
                    {pending.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Prescriptions */}
            {pending.length > 0 && (
              <div className="card mb-6">
                <div className="card-header">
                  <span className="card-title">Pending Prescriptions</span>
                  <span className="badge badge-amber">{pending.length} pending</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Drug</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th><th>Doctor</th><th>Date</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {pending.map(rx => (
                        <tr key={rx.id}>
                          <td className="td-primary">{rx.drug_name}</td>
                          <td>{rx.dosage}</td>
                          <td>{rx.frequency}</td>
                          <td>{rx.duration || "—"}</td>
                          <td className="td-muted">{rx.instructions || "—"}</td>
                          <td className="td-muted">{rx.doctor_name}</td>
                          <td className="td-muted">{new Date(rx.prescribed_at).toLocaleDateString()}</td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-success btn-sm"
                                disabled={acting === rx.id}
                                onClick={() => handleAction(rx.id, "fill")}
                              >
                                {acting === rx.id ? <span className="spinner" /> : "✓ Fill"}
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={acting === rx.id}
                                onClick={() => handleAction(rx.id, "cancel")}
                              >
                                ✕ Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Prescription History */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Prescription History</span>
                <span className="badge badge-gray">{history.length} records</span>
              </div>
              {history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-title">No history yet</div>
                  <div className="empty-desc">Filled or cancelled prescriptions will appear here</div>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Drug</th><th>Dosage</th><th>Frequency</th><th>Status</th><th>Doctor</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {history.map(rx => (
                        <tr key={rx.id}>
                          <td className="td-primary">{rx.drug_name}</td>
                          <td>{rx.dosage}</td>
                          <td>{rx.frequency}</td>
                          <td>
                            <span className={`badge ${rx.status === "filled" ? "badge-green" : "badge-gray"}`}>
                              {rx.status}
                            </span>
                          </td>
                          <td className="td-muted">{rx.doctor_name}</td>
                          <td className="td-muted">{new Date(rx.prescribed_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Empty state before search ── */}
        {!patient && !loading && !error && (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div className="empty-icon">🔍</div>
            <div className="empty-title">Search for a patient</div>
            <div className="empty-desc">Enter a patient ID above to view their prescriptions</div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
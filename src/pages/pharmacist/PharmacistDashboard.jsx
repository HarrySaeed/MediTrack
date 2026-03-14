// src/Pages/pharmacist/PharmacistDashboard.jsx

import { useState, useEffect } from "react";
import AppLayout from "../../Components/Layout/AppLayout";

const token = () => localStorage.getItem("mt_token");
const hdr   = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

export default function PharmacistDashboard() {
  const [pending, setPending]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState(null); // prescription id being acted on

  useEffect(() => { loadPending(); }, []);

  async function loadPending() {
    setLoading(true);
    try {
      const res  = await fetch("/api/pharmacy/pending", { headers: hdr() });
      const data = await res.json();
      setPending(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleAction(id, action) {
    setActing(id);
    try {
      await fetch(`/api/pharmacy/prescriptions/${id}/${action}`, { method: "PATCH", headers: hdr() });
      await loadPending();
    } catch (e) { console.error(e); }
    finally { setActing(null); }
  }

  function calcAge(dob) {
    if (!dob) return "—";
    return Math.floor((Date.now() - new Date(dob)) / (1000 * 60 * 60 * 24 * 365.25)) + " yrs";
  }

  return (
    <AppLayout>
      <div className="page">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Pharmacy Dashboard</h1>
            <p className="page-subtitle">Review and fulfil pending prescriptions</p>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-amber">💊</div>
            <div>
              <div className="stat-value">{loading ? "—" : pending.length}</div>
              <div className="stat-label">Pending Prescriptions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">👥</div>
            <div>
              <div className="stat-value">{loading ? "—" : new Set(pending.map(p => p.patient_id)).size}</div>
              <div className="stat-label">Patients Waiting</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">✅</div>
            <div>
              <div className="stat-value">—</div>
              <div className="stat-label">Filled Today</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-red">⚠️</div>
            <div>
              <div className="stat-value">{loading ? "—" : pending.filter(p => p.patient_allergies).length}</div>
              <div className="stat-label">Allergy Alerts</div>
            </div>
          </div>
        </div>

        {/* ── Pending Queue ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pending Prescriptions</span>
            <button className="btn btn-ghost btn-sm" onClick={loadPending}>↻ Refresh</button>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ borderColor: "#E5E7EB", borderTopColor: "#4F46E5", width: 28, height: 28 }} />
            </div>
          ) : pending.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <div className="empty-title">All caught up!</div>
              <div className="empty-desc">No pending prescriptions at the moment</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Drug</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Doctor</th>
                    <th>Prescribed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map(rx => (
                    <tr key={rx.id}>
                      <td>
                        <div className="td-primary">{rx.patient_name}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="td-mono" style={{ fontSize: 11 }}>{rx.patient_mrn}</span>
                          {rx.patient_allergies && (
                            <span className="badge badge-amber" style={{ fontSize: 10 }}>⚠ {rx.patient_allergies}</span>
                          )}
                        </div>
                      </td>
                      <td className="td-primary">{rx.drug_name}</td>
                      <td>{rx.dosage}</td>
                      <td>{rx.frequency}</td>
                      <td>{rx.duration || "—"}</td>
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
          )}
        </div>

      </div>
    </AppLayout>
  );
}
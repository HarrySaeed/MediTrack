// src/pages/doctors/PatientDetail.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../../components/Layout/AppLayout";

const token = () => localStorage.getItem("mt_token");
const hdr   = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

// ── Modal ──────────────────────────────────────────────────
function Modal({ title, onClose, onSubmit, loading, children }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PatientDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [visitId, setVisitId] = useState(null); // current visit for this session
  const [tab, setTab]         = useState("visits");
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({});

  useEffect(() => {
    loadPatient();
    startVisit();
  }, [id]);

  async function loadPatient() {
    setLoading(true);
    try {
      const res  = await fetch(`/api/patients/${id}`, { headers: hdr() });
      const data = await res.json();
      setPatient(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  // Auto-create or retrieve today's visit
  async function startVisit() {
    try {
      const res  = await fetch(`/api/patients/${id}/visit`, { method: "POST", headers: hdr() });
      const data = await res.json();
      setVisitId(data.visitId);
    } catch (e) { console.error(e); }
  }

  function openModal(type) { setForm({}); setModal(type); }
  function closeModal()    { setModal(null); setForm({}); }
  function setF(k)         { return e => setForm(p => ({ ...p, [k]: e.target.value })); }

  async function submitDiagnosis(e) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`/api/patients/${id}/diagnoses`, {
        method: "POST", headers: hdr(),
        body: JSON.stringify({ ...form, visitId }),
      });
      if (res.ok) { closeModal(); await loadPatient(); }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function submitPrescription(e) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`/api/patients/${id}/prescriptions`, {
        method: "POST", headers: hdr(),
        body: JSON.stringify({ ...form, visitId }),
      });
      if (res.ok) { closeModal(); await loadPatient(); }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function submitHistory(e) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`/api/patients/${id}/history`, {
        method: "POST", headers: hdr(),
        body: JSON.stringify(form),
      });
      if (res.ok) { closeModal(); await loadPatient(); }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  function calcAge(dob) {
    if (!dob) return "—";
    return Math.floor((Date.now() - new Date(dob)) / (1000 * 60 * 60 * 24 * 365.25)) + " yrs";
  }

  function getInitials(name = "") {
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  }

  function formatDate(d) {
    return d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
  }

  if (loading) return (
    <AppLayout>
      <div className="page">
        <div className="empty-state">
          <div className="spinner" style={{ borderColor: "#E5E7EB", borderTopColor: "#4F46E5", width: 32, height: 32 }} />
        </div>
      </div>
    </AppLayout>
  );

  if (!patient) return (
    <AppLayout>
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <div className="empty-title">Patient not found</div>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="page">

        {/* ── Header ── */}
        <div className="page-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
          <div className="flex gap-3">
            <button className="btn btn-secondary btn-sm" onClick={() => openModal("history")}>+ History</button>
            <button className="btn btn-secondary btn-sm" onClick={() => openModal("diagnosis")}>+ Diagnosis</button>
            <button className="btn btn-primary btn-sm"   onClick={() => openModal("prescription")}>+ Prescription</button>
          </div>
        </div>

        {/* ── Patient Card ── */}
        <div className="card card-pad mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="avatar avatar-lg">{getInitials(patient.full_name)}</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 6 }}>{patient.full_name}</h2>
              <div className="flex gap-3 items-center flex-wrap">
                <span className="td-mono">{patient.mrn}</span>
                <span className="badge badge-blue" style={{ textTransform: "capitalize" }}>{patient.gender}</span>
                {patient.blood_type && <span className="badge badge-red">{patient.blood_type}</span>}
                {patient.allergies  && <span className="badge badge-amber">⚠ {patient.allergies}</span>}
                {visitId && <span className="badge badge-green">● Active Visit</span>}
              </div>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Age</div>
              <div className="info-value">{calcAge(patient.date_of_birth)}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Date of Birth</div>
              <div className="info-value">{formatDate(patient.date_of_birth)}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Phone</div>
              <div className="info-value">{patient.phone || "—"}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Address</div>
              <div className="info-value">{patient.address || "—"}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Emergency Contact</div>
              <div className="info-value">{patient.emergency_contact_name || "—"}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Emergency Phone</div>
              <div className="info-value">{patient.emergency_contact_phone || "—"}</div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tabs">
          {[
            { key: "visits",        label: `Visits (${patient.visits?.length || 0})`               },
            { key: "diagnoses",     label: `All Diagnoses (${patient.diagnoses?.length || 0})`     },
            { key: "prescriptions", label: `All Prescriptions (${patient.prescriptions?.length || 0})` },
            { key: "history",       label: `Medical History (${patient.history?.length || 0})`     },
          ].map(t => (
            <button key={t.key} className={`tab${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Visits Tab ── */}
        {tab === "visits" && (
          <div>
            {!patient.visits?.length ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon">🗓️</div>
                  <div className="empty-title">No visits yet</div>
                  <div className="empty-desc">A visit is automatically created when you open this page</div>
                </div>
              </div>
            ) : (
              patient.visits.map(v => (
                <div key={v.id} className="card mb-4">
                  <div className="card-header">
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: 20 }}>🗓️</span>
                      <div>
                        <div className="card-title">{formatDate(v.visited_at)}</div>
                        <div className="text-sm text-muted">Dr. {v.doctor_name} · {v.chief_complaint || "Routine visit"}</div>
                      </div>
                    </div>
                    {v.id === visitId && <span className="badge badge-green">● Today</span>}
                  </div>

                  <div style={{ padding: "16px 24px" }}>
                    {/* Visit diagnoses */}
                    {v.diagnoses?.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-upper text-faint mb-3">Diagnoses</div>
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr><th>Condition</th><th>ICD Code</th><th>Status</th><th>Notes</th></tr>
                            </thead>
                            <tbody>
                              {v.diagnoses.map(d => (
                                <tr key={d.id}>
                                  <td className="td-primary">{d.condition}</td>
                                  <td><span className="td-mono">{d.icd_code || "—"}</span></td>
                                  <td>
                                    <span className={`badge ${d.status === "active" ? "badge-amber" : d.status === "chronic" ? "badge-red" : "badge-green"}`}>
                                      {d.status}
                                    </span>
                                  </td>
                                  <td className="td-muted">{d.notes || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Visit prescriptions */}
                    {v.prescriptions?.length > 0 && (
                      <div>
                        <div className="text-xs text-upper text-faint mb-3">Prescriptions</div>
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr><th>Drug</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                              {v.prescriptions.map(rx => (
                                <tr key={rx.id}>
                                  <td className="td-primary">{rx.drug_name}</td>
                                  <td>{rx.dosage}</td>
                                  <td>{rx.frequency}</td>
                                  <td>{rx.duration || "—"}</td>
                                  <td>
                                    <span className={`badge ${rx.status === "pending" ? "badge-amber" : rx.status === "filled" ? "badge-green" : "badge-gray"}`}>
                                      {rx.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {!v.diagnoses?.length && !v.prescriptions?.length && (
                      <div className="text-sm text-faint text-center" style={{ padding: "12px 0" }}>
                        No diagnoses or prescriptions recorded for this visit
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── All Diagnoses Tab ── */}
        {tab === "diagnoses" && (
          <div className="card">
            {!patient.diagnoses?.length ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-title">No diagnoses yet</div>
                <div className="empty-desc">Click "+ Diagnosis" to add one</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Condition</th><th>ICD Code</th><th>Status</th><th>Doctor</th><th>Date</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {patient.diagnoses.map(d => (
                      <tr key={d.id}>
                        <td className="td-primary">{d.condition}</td>
                        <td><span className="td-mono">{d.icd_code || "—"}</span></td>
                        <td>
                          <span className={`badge ${d.status === "active" ? "badge-amber" : d.status === "chronic" ? "badge-red" : "badge-green"}`}>
                            {d.status}
                          </span>
                        </td>
                        <td>{d.doctor_name}</td>
                        <td className="td-muted">{formatDate(d.diagnosed_at)}</td>
                        <td className="td-muted">{d.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── All Prescriptions Tab ── */}
        {tab === "prescriptions" && (
          <div className="card">
            {!patient.prescriptions?.length ? (
              <div className="empty-state">
                <div className="empty-icon">💊</div>
                <div className="empty-title">No prescriptions yet</div>
                <div className="empty-desc">Click "+ Prescription" to add one</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Drug</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Status</th><th>Doctor</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {patient.prescriptions.map(rx => (
                      <tr key={rx.id}>
                        <td className="td-primary">{rx.drug_name}</td>
                        <td>{rx.dosage}</td>
                        <td>{rx.frequency}</td>
                        <td>{rx.duration || "—"}</td>
                        <td>
                          <span className={`badge ${rx.status === "pending" ? "badge-amber" : rx.status === "filled" ? "badge-green" : "badge-gray"}`}>
                            {rx.status}
                          </span>
                        </td>
                        <td>{rx.doctor_name}</td>
                        <td className="td-muted">{formatDate(rx.prescribed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Medical History Tab ── */}
        {tab === "history" && (
          <div className="card">
            {!patient.history?.length ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <div className="empty-title">No medical history yet</div>
                <div className="empty-desc">Click "+ History" to add a record</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Condition</th><th>Notes</th><th>Recorded By</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {patient.history.map(h => (
                      <tr key={h.id}>
                        <td className="td-primary">{h.condition}</td>
                        <td className="td-muted">{h.notes || "—"}</td>
                        <td>{h.recorded_by_name || "—"}</td>
                        <td className="td-muted">{formatDate(h.recorded_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Add Diagnosis Modal ── */}
      {modal === "diagnosis" && (
        <Modal title="Add Diagnosis" onClose={closeModal} onSubmit={submitDiagnosis} loading={saving}>
          <div className="form-group">
            <label className="form-label">Condition *</label>
            <input className="form-input" placeholder="e.g. Type 2 Diabetes Mellitus" onChange={setF("condition")} required />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">ICD Code</label>
              <input className="form-input" placeholder="e.g. E11" onChange={setF("icdCode")} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" onChange={setF("status")}>
                <option value="active">Active</option>
                <option value="chronic">Chronic</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Additional notes..." onChange={setF("notes")} />
          </div>
        </Modal>
      )}

      {/* ── Add Prescription Modal ── */}
      {modal === "prescription" && (
        <Modal title="Add Prescription" onClose={closeModal} onSubmit={submitPrescription} loading={saving}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Drug Name *</label>
              <input className="form-input" placeholder="e.g. Metformin" onChange={setF("drugName")} required />
            </div>
            <div className="form-group">
              <label className="form-label">Dosage *</label>
              <input className="form-input" placeholder="e.g. 500mg" onChange={setF("dosage")} required />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Frequency *</label>
              <input className="form-input" placeholder="e.g. Twice daily" onChange={setF("frequency")} required />
            </div>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input className="form-input" placeholder="e.g. 3 months" onChange={setF("duration")} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Instructions</label>
            <textarea className="form-textarea" placeholder="e.g. Take with meals" onChange={setF("instructions")} />
          </div>
        </Modal>
      )}

      {/* ── Add History Modal ── */}
      {modal === "history" && (
        <Modal title="Add Medical History" onClose={closeModal} onSubmit={submitHistory} loading={saving}>
          <div className="form-group">
            <label className="form-label">Condition *</label>
            <input className="form-input" placeholder="e.g. Asthma" onChange={setF("condition")} required />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Additional details..." onChange={setF("notes")} />
          </div>
        </Modal>
      )}

    </AppLayout>
  );
}
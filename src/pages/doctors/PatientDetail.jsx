/* ─────────────────────────────────────────────────────────
   FILE: src/pages/doctor/PatientDetail.jsx
   ───────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { Button, Card, Badge, Modal, Input, Select, Textarea, FormGrid, Spinner, EmptyState } from "../../components/common/UI";
import { patientService } from "../../services/patients.service";

function calcAge(dob) {
  return Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
}
const fmt = d => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

/* ── Add Diagnosis Modal ─────────────────────────────────── */
function AddDiagnosisModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ condition: "", icd_code: "", status: "active", notes: "" });
  const [loading, setLoading] = useState(false);
  const f = patch => setForm(p => ({ ...p, ...patch }));

  async function submit() {
    if (!form.condition) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
    setForm({ condition: "", icd_code: "", status: "active", notes: "" });
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Diagnosis">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FormGrid cols={2}>
          <Input label="Condition *" placeholder="e.g. Type 2 Diabetes" value={form.condition} onChange={e => f({ condition: e.target.value })} />
          <Input label="ICD Code" placeholder="e.g. E11" value={form.icd_code} onChange={e => f({ icd_code: e.target.value })} />
        </FormGrid>
        <Select label="Status" value={form.status} onChange={e => f({ status: e.target.value })}>
          <option value="active">Active</option>
          <option value="chronic">Chronic</option>
          <option value="resolved">Resolved</option>
        </Select>
        <Textarea label="Clinical Notes" placeholder="Additional notes…" value={form.notes} onChange={e => f({ notes: e.target.value })} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading} disabled={!form.condition}>Save Diagnosis</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Add Prescription Modal ──────────────────────────────── */
function AddPrescriptionModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ drug_name: "", dosage: "", frequency: "", duration: "", instructions: "" });
  const [loading, setLoading] = useState(false);
  const f = patch => setForm(p => ({ ...p, ...patch }));

  async function submit() {
    if (!form.drug_name || !form.dosage || !form.frequency) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
    setForm({ drug_name: "", dosage: "", frequency: "", duration: "", instructions: "" });
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Prescription">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="Drug Name *" placeholder="e.g. Metformin" value={form.drug_name} onChange={e => f({ drug_name: e.target.value })} />
        <FormGrid cols={2}>
          <Input label="Dosage *"    placeholder="e.g. 500mg"       value={form.dosage}     onChange={e => f({ dosage: e.target.value })} />
          <Input label="Frequency *" placeholder="e.g. Twice daily" value={form.frequency}  onChange={e => f({ frequency: e.target.value })} />
        </FormGrid>
        <Input label="Duration" placeholder="e.g. 3 months" value={form.duration} onChange={e => f({ duration: e.target.value })} />
        <Textarea label="Instructions" placeholder="Special instructions for patient…" value={form.instructions} onChange={e => f({ instructions: e.target.value })} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading} disabled={!form.drug_name || !form.dosage || !form.frequency}>Save Prescription</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Add History Modal ───────────────────────────────────── */
function AddHistoryModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ condition: "", notes: "" });
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.condition) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
    setForm({ condition: "", notes: "" });
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Medical History">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="Condition *" placeholder="e.g. Childhood asthma" value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))} />
        <Textarea label="Notes" placeholder="Additional context…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading} disabled={!form.condition}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function PatientDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("diagnoses");
  const [modal, setModal]     = useState(null);

  async function load() {
    try {
      const r = await patientService.getById(id);
      setPatient(r.data);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);

  async function addDiagnosis(form) {
    await patientService.addDiagnosis(id, form);
    setModal(null); load();
  }
  async function addPrescription(form) {
    await patientService.addPrescription(id, form);
    setModal(null); load();
  }
  async function addHistory(form) {
    await patientService.addHistory(id, form);
    setModal(null); load();
  }

  if (loading) return <AppLayout><div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner /></div></AppLayout>;
  if (!patient) return <AppLayout><div style={{ padding: 40, color: "var(--ink-faint)" }}>Patient not found.</div></AppLayout>;

  const TABS = ["diagnoses", "prescriptions", "history"];

  return (
    <AppLayout>
      {/* Back */}
      <button onClick={() => navigate("/doctor/patients")} style={{ background: "none", border: "none", color: "var(--ink-faint)", fontSize: 13, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 4 }}>
        ← Back to patients
      </button>

      {/* Patient header */}
      <Card style={{ padding: "24px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--indigo-light)", color: "var(--indigo)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
            {patient.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{patient.full_name}</h1>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-faint)", background: "var(--bg)", padding: "2px 8px", borderRadius: 6, border: "1px solid var(--border)" }}>{patient.mrn}</span>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                ["Age", `${calcAge(patient.date_of_birth)} years`],
                ["DOB", fmt(patient.date_of_birth)],
                ["Gender", patient.gender],
                ["Blood Type", patient.blood_type || "—"],
                ["Phone", patient.phone || "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 1 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
              {patient.allergies && (
                <div>
                  <div style={{ fontSize: 10, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 1 }}>Allergies</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--red)" }}>⚠ {patient.allergies}</div>
                </div>
              )}
            </div>
          </div>
          {/* Quick stats */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              [patient.diagnoses?.length || 0, "Diagnoses"],
              [patient.prescriptions?.filter(p => p.status === "pending").length || 0, "Pending Rx"],
            ].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center", padding: "10px 16px", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--indigo)" }}>{n}</div>
                <div style={{ fontSize: 10, color: "var(--ink-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "#fff", padding: 4, borderRadius: 10, width: "fit-content", border: "1px solid var(--border)" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 600,
            background: tab === t ? "var(--indigo)" : "transparent",
            color: tab === t ? "#fff" : "var(--ink-faint)", cursor: "pointer", textTransform: "capitalize",
            transition: "all 0.15s",
          }}>{t}</button>
        ))}
      </div>

      {/* Diagnoses tab */}
      {tab === "diagnoses" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <Button variant="secondary" size="sm" onClick={() => setModal("diagnosis")}>+ Add Diagnosis</Button>
          </div>
          {patient.diagnoses?.length === 0 ? <EmptyState icon="🩺" message="No diagnoses recorded." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {patient.diagnoses.map(d => (
                <Card key={d.id} style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{d.condition}</span>
                        {d.icd_code && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", background: "var(--bg)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--border)" }}>{d.icd_code}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>Diagnosed {fmt(d.diagnosed_at)} · Dr. {d.doctor_name}</div>
                      {d.notes && <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-muted)", background: "var(--bg)", padding: "8px 12px", borderRadius: 8, borderLeft: "3px solid var(--border)" }}>{d.notes}</div>}
                    </div>
                    <Badge status={d.status} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prescriptions tab */}
      {tab === "prescriptions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <Button variant="secondary" size="sm" onClick={() => setModal("prescription")}>+ Add Prescription</Button>
          </div>
          {patient.prescriptions?.length === 0 ? <EmptyState icon="💊" message="No prescriptions recorded." /> : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {patient.prescriptions.map(rx => (
                <Card key={rx.id} style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{rx.drug_name}</span>
                    <Badge status={rx.status} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                    {[["Dose", rx.dosage], ["Frequency", rx.frequency], ["Duration", rx.duration || "—"], ["Doctor", rx.doctor_name]].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 10, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 1 }}>{k}</div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {rx.instructions && <div style={{ fontSize: 12, color: "var(--ink-muted)", background: "var(--bg)", padding: "6px 10px", borderRadius: 6 }}>{rx.instructions}</div>}
                  <div style={{ marginTop: 8, fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>Prescribed {fmt(rx.prescribed_at)}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <Button variant="secondary" size="sm" onClick={() => setModal("history")}>+ Add History</Button>
          </div>
          {patient.history?.length === 0 ? <EmptyState icon="📂" message="No medical history recorded." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {patient.history.map(h => (
                <Card key={h.id} style={{ padding: "14px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{h.condition}</div>
                  {h.notes && <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{h.notes}</div>}
                  <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 6, fontFamily: "var(--font-mono)" }}>Recorded {fmt(h.recorded_at)}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddDiagnosisModal    open={modal === "diagnosis"}    onClose={() => setModal(null)} onSave={addDiagnosis} />
      <AddPrescriptionModal open={modal === "prescription"} onClose={() => setModal(null)} onSave={addPrescription} />
      <AddHistoryModal      open={modal === "history"}      onClose={() => setModal(null)} onSave={addHistory} />
    </AppLayout>
  );
}
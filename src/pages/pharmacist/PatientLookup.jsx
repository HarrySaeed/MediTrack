/* ─────────────────────────────────────────────────────────
   FILE: src/pages/pharmacist/PatientLookup.jsx
   ───────────────────────────────────────────────────────── */

import { useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { PageHeader, Card, Button, Input, Badge, Spinner, EmptyState } from "../../components//common/UI";
import { pharmacyService } from "../../services/pharmacy.service";

const fmt = d => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function PatientLookup() {
  const [query, setQuery]     = useState("");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [filling, setFilling] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(""); setPatient(null);
    try {
      const r = await pharmacyService.lookup(query.trim());
      setPatient(r.data);
    } catch (err) {
      setError(err.response?.status === 404 ? "No patient found with that ID or MRN." : "Search failed. Please try again.");
    } finally { setLoading(false); }
  }

  async function handleFill(id) {
    setFilling(id);
    try {
      await pharmacyService.fillPrescription(id);
      const r = await pharmacyService.lookup(patient.id);
      setPatient(r.data);
    } finally { setFilling(null); }
  }

  async function handleCancel(id) {
    if (!confirm("Cancel this prescription?")) return;
    await pharmacyService.cancelPrescription(id);
    const r = await pharmacyService.lookup(patient.id);
    setPatient(r.data);
  }

  const pending = patient?.prescriptions?.filter(r => r.status === "pending") || [];
  const others  = patient?.prescriptions?.filter(r => r.status !== "pending") || [];

  return (
    <AppLayout>
      <PageHeader title="Patient Lookup" subtitle="Search by Patient ID or MRN to view prescriptions" />

      {/* Search */}
      <Card style={{ padding: "24px 28px", marginBottom: 24, maxWidth: 600 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Patient ID or MRN"
              placeholder="e.g. 42 or MRN-00001"
              value={query}
              onChange={e => setQuery(e.target.value)}
              icon={<span>🔍</span>}
            />
          </div>
          <Button type="submit" loading={loading} style={{ marginBottom: 0 }}>Search</Button>
        </form>
        {error && <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--red-bg)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--red)" }}>{error}</div>}
      </Card>

      {/* Results */}
      {patient && (
        <div className="animate-fade">
          {/* Patient info */}
          <Card style={{ padding: "20px 24px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--green-bg)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                {patient.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>{patient.full_name}</h2>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", background: "var(--bg)", padding: "2px 8px", borderRadius: 6, border: "1px solid var(--border)" }}>{patient.mrn}</span>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--ink-muted)" }}>
                  <span>DOB: {fmt(patient.date_of_birth)}</span>
                  {patient.allergies && <span style={{ color: "var(--red)", fontWeight: 600 }}>⚠ Allergies: {patient.allergies}</span>}
                </div>
              </div>
            </div>
          </Card>

          {/* Pending Rx */}
          {pending.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--amber)" }}>⏳ Pending Prescriptions ({pending.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pending.map(rx => (
                  <Card key={rx.id} style={{ padding: "16px 20px", borderLeft: "3px solid var(--amber)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{rx.drug_name}</div>
                        <div style={{ display: "flex", gap: 20, fontSize: 13, color: "var(--ink-muted)", flexWrap: "wrap" }}>
                          <span><strong>Dose:</strong> {rx.dosage}</span>
                          <span><strong>Frequency:</strong> {rx.frequency}</span>
                          {rx.duration && <span><strong>Duration:</strong> {rx.duration}</span>}
                          <span><strong>Doctor:</strong> {rx.doctor_name}</span>
                        </div>
                        {rx.instructions && <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-faint)", background: "var(--bg)", padding: "6px 10px", borderRadius: 6 }}>{rx.instructions}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 16 }}>
                        <Button size="sm" variant="success" loading={filling === rx.id} onClick={() => handleFill(rx.id)}>Fill ✓</Button>
                        <Button size="sm" variant="danger"  onClick={() => handleCancel(rx.id)}>Cancel</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* History Rx */}
          {others.length > 0 && (
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--ink-faint)" }}>📋 Prescription History</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {others.map(rx => (
                  <Card key={rx.id} style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{rx.drug_name}</span>
                        <span style={{ fontSize: 13, color: "var(--ink-faint)", marginLeft: 10 }}>{rx.dosage} · {rx.frequency}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>{fmt(rx.prescribed_at)}</span>
                        <Badge status={rx.status} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {patient.prescriptions?.length === 0 && <EmptyState icon="💊" message="No prescriptions for this patient." />}
        </div>
      )}
    </AppLayout>
  );
}
/* ─────────────────────────────────────────────────────────
   FILE: src/pages/pharmacist/PharmacistDashboard.jsx
   ───────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { PageHeader, Card, Button, Badge, Spinner, EmptyState, StatCard } from "../../components/common/UI";
import { pharmacyService } from "../../services/pharmacy.service";
import { useAuth } from "../../context/AuthContext";

const fmt = d => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function PharmacistDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [queue, setQueue]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filling, setFilling] = useState(null);

  async function load() {
    try {
      const r = await pharmacyService.getPending();
      setQueue(r.data);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleFill(id) {
    setFilling(id);
    try {
      await pharmacyService.fillPrescription(id);
      load();
    } finally { setFilling(null); }
  }

  async function handleCancel(id) {
    if (!confirm("Cancel this prescription?")) return;
    await pharmacyService.cancelPrescription(id);
    load();
  }

  return (
    <AppLayout>
      <PageHeader
        title={`Hello, ${user?.name?.split(" ")[0] || "Pharmacist"}`}
        subtitle="Manage and fill pending prescriptions"
        action={<Button variant="secondary" onClick={() => navigate("/pharmacist/lookup")}>🔍 Patient Lookup</Button>}
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard icon="⏳" label="Pending Rx"  value={loading ? "—" : queue.length}                                             color="var(--amber)" />
        <StatCard icon="✅" label="Filled Today" value="—" color="var(--green)" />
        <StatCard icon="👥" label="Unique Patients" value={loading ? "—" : new Set(queue.map(r => r.patient_id)).size}           color="var(--indigo)" />
      </div>

      {/* Pending queue */}
      <Card>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>Prescription Queue</h2>
          <button onClick={load} style={{ background: "none", border: "none", color: "var(--ink-faint)", fontSize: 13, cursor: "pointer" }}>↻ Refresh</button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 64 }}><Spinner /></div>
        ) : queue.length === 0 ? (
          <EmptyState icon="✅" message="No pending prescriptions. Queue is clear!" />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                {["Patient", "MRN", "Drug", "Dose / Frequency", "Prescribed By", "Date", ""].map(h => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map(rx => (
                <tr key={rx.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "13px 20px", fontSize: 14, fontWeight: 500 }}>{rx.patient_name}</td>
                  <td style={{ padding: "13px 20px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-faint)" }}>{rx.mrn}</td>
                  <td style={{ padding: "13px 20px" }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{rx.drug_name}</span>
                    {rx.instructions && <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{rx.instructions}</div>}
                  </td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "var(--ink-muted)" }}>{rx.dosage} · {rx.frequency}</td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "var(--ink-muted)" }}>Dr. {rx.doctor_name}</td>
                  <td style={{ padding: "13px 20px", fontSize: 12, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>{fmt(rx.prescribed_at)}</td>
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button size="sm" variant="success" loading={filling === rx.id} onClick={() => handleFill(rx.id)}>Fill ✓</Button>
                      <Button size="sm" variant="danger"  onClick={() => handleCancel(rx.id)}>Cancel</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </AppLayout>
  );
}
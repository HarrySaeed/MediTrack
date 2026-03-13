/* ─────────────────────────────────────────────────────────
   FILE: src/pages/doctor/DoctorDashboard.jsx
   ───────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { StatCard, Card, PageHeader, Button, Spinner, Badge } from "../../components/common/UI";
import { patientService } from "../../services/patients.service";
import { useAuth } from "../../context/AuthContext-v2";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    patientService.getAll().then(r => setPatients(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const recentPatients = patients.slice(0, 5);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <AppLayout>
      <PageHeader
        title={`Good morning, Dr. ${user?.name?.split(" ").pop() || "Doctor"}`}
        subtitle={today}
        action={<Button onClick={() => navigate("/doctor/patients/new")}>+ Register Patient</Button>}
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard icon="👥" label="Total Patients"     value={loading ? "—" : patients.length}                              color="var(--indigo)" />
        <StatCard icon="📋" label="Active Diagnoses"   value={loading ? "—" : patients.reduce((a, p) => a + (p.diagnoses?.filter(d => d.status === "active").length || 0), 0)} color="#D97706" />
        <StatCard icon="💊" label="Pending Rx"         value={loading ? "—" : patients.reduce((a, p) => a + (p.prescriptions?.filter(x => x.status === "pending").length || 0), 0)} color="var(--green)" />
      </div>

      {/* Recent patients */}
      <Card>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>Recent Patients</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/doctor/patients")}>View all</Button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><Spinner /></div>
        ) : recentPatients.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--ink-faint)", fontSize: 14 }}>No patients registered yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Patient", "MRN", "DOB", "Blood Type", ""].map(h => (
                  <th key={h} style={{ padding: "10px 22px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPatients.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "13px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--indigo-light)", color: "var(--indigo)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                        {p.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{p.full_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 22px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-faint)" }}>{p.mrn}</td>
                  <td style={{ padding: "13px 22px", fontSize: 13, color: "var(--ink-muted)" }}>{new Date(p.date_of_birth).toLocaleDateString()}</td>
                  <td style={{ padding: "13px 22px", fontSize: 13 }}>{p.blood_type || "—"}</td>
                  <td style={{ padding: "13px 22px" }}>
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/doctor/patients/${p.id}`)}>View →</Button>
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
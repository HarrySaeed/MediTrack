/* ─────────────────────────────────────────────────────────
   FILE: src/pages/doctor/PatientList.jsx
   ───────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { PageHeader, Button, Input, Card, Spinner, EmptyState } from "../../components/common/UI";
import { patientService } from "../../services/patients.service";

function calcAge(dob) {
  return Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
}

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  const load = useCallback((q = "") => {
    setLoading(true);
    patientService.getAll(q).then(r => setPatients(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search, load]);

  return (
    <AppLayout>
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} record${patients.length !== 1 ? "s" : ""}`}
        action={<Button onClick={() => navigate("/doctor/patients/new")}>+ Register Patient</Button>}
      />

      {/* Search */}
      <div style={{ marginBottom: 20, maxWidth: 380 }}>
        <Input
          placeholder="Search by name or MRN…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<span style={{ fontSize: 14 }}>🔍</span>}
        />
      </div>

      <Card>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 64 }}><Spinner /></div>
        ) : patients.length === 0 ? (
          <EmptyState icon="👥" message={search ? "No patients match your search." : "No patients registered yet."} />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                {["Patient", "MRN", "Age / Gender", "Blood Type", "Phone", "Allergies", ""].map(h => (
                  <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map((p, i) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/doctor/patients/${p.id}`)}
                  style={{
                    borderBottom: "1px solid var(--border-light)",
                    cursor: "pointer", transition: "background 0.1s",
                    background: i % 2 === 0 ? "#fff" : "var(--bg)",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--indigo-light)"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "var(--bg)"}
                >
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--indigo-light)", color: "var(--indigo)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                        {p.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{p.full_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 20px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-faint)" }}>{p.mrn}</td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "var(--ink-muted)" }}>{calcAge(p.date_of_birth)} yrs · {p.gender}</td>
                  <td style={{ padding: "13px 20px", fontSize: 13 }}>{p.blood_type || "—"}</td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "var(--ink-muted)" }}>{p.phone || "—"}</td>
                  <td style={{ padding: "13px 20px" }}>
                    {p.allergies
                      ? <span style={{ fontSize: 11, background: "var(--red-bg)", color: "var(--red)", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>⚠ {p.allergies}</span>
                      : <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>None</span>
                    }
                  </td>
                  <td style={{ padding: "13px 20px" }}>
                    <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); navigate(`/doctor/patients/${p.id}`); }}>Open →</Button>
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
/* ─────────────────────────────────────────────────────────
   FILE: src/pages/admin/AdminDashboard.jsx
   ───────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { PageHeader, StatCard, Card, Button, Spinner } from "../../components/common/UI";
import { adminService } from "../../services/admin.service";
import { useAuth } from "../../context/AuthContext-v2";

export default function AdminDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [stats, setStats]   = useState(null);
  const [staff, setStaff]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.getStats(), adminService.getStaff()])
      .then(([s, st]) => { setStats(s.data); setStaff(st.data.slice(0, 6)); })
      .finally(() => setLoading(false));
  }, []);

  const roleIcon = { doctor: "🩺", pharmacist: "💊", admin: "🔒" };
  const roleColor = { doctor: "var(--indigo)", pharmacist: "var(--green)", admin: "#D97706" };

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] || "Admin"}`}
        subtitle="Hospital system overview"
        action={<Button onClick={() => navigate("/admin/staff")}>Manage Staff →</Button>}
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard icon="👥" label="Total Patients"    value={loading ? "—" : stats?.total_patients ?? "—"}           color="var(--indigo)" />
        <StatCard icon="👤" label="Active Staff"       value={loading ? "—" : stats?.active_staff ?? "—"}             color="var(--green)"  />
        <StatCard icon="💊" label="Pending Rx"         value={loading ? "—" : stats?.pending_prescriptions ?? "—"}    color="var(--amber)"  />
        <StatCard icon="📅" label="Today's Visits"     value={loading ? "—" : stats?.today_visits ?? "—"}             color="#7C3AED"       />
      </div>

      {/* Staff table */}
      <Card>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>Staff Overview</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/staff")}>View all</Button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><Spinner /></div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                {["Name", "Role", "Department", "Email", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${roleColor[s.role]}18`, color: roleColor[s.role], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                        {roleIcon[s.role]}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{s.full_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 20px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: roleColor[s.role], background: `${roleColor[s.role]}14`, padding: "2px 8px", borderRadius: 20, textTransform: "capitalize" }}>{s.role}</span>
                  </td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "var(--ink-muted)" }}>{s.department || "—"}</td>
                  <td style={{ padding: "13px 20px", fontSize: 12, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>{s.email}</td>
                  <td style={{ padding: "13px 20px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: s.is_active ? "var(--green-bg)" : "var(--red-bg)", color: s.is_active ? "var(--green)" : "var(--red)" }}>
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
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
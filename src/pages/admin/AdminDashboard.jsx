// src/Pages/admin/AdminDashboard.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";

const token = () => localStorage.getItem("mt_token");
const hdr   = () => ({ Authorization: `Bearer ${token()}` });

export default function AdminDashboard() {
  const navigate           = useNavigate();
  const [stats, setStats]  = useState(null);
  const [staff, setStaff]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, stRes] = await Promise.all([
          fetch("/api/admin/stats", { headers: hdr() }),
          fetch("/api/admin/staff", { headers: hdr() }),
        ]);
        const statsData = await sRes.json();
        const staffData = await stRes.json();
        setStats(statsData);
        setStaff(Array.isArray(staffData) ? staffData : []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  function getInitials(name = "") {
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  }

  const roleBadge = {
    doctor:     "badge-blue",
    pharmacist: "badge-green",
    admin:      "badge-amber",
  };

  return (
    <AppLayout>
      <div className="page">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">System overview and staff management</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/admin/staff")}>
            + Add Staff
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">👥</div>
            <div>
              <div className="stat-value">{loading ? "—" : stats?.totalPatients ?? 0}</div>
              <div className="stat-label">Total Patients</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">🏥</div>
            <div>
              <div className="stat-value">{loading ? "—" : stats?.activeStaff ?? 0}</div>
              <div className="stat-label">Active Staff</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-amber">📋</div>
            <div>
              <div className="stat-value">{loading ? "—" : stats?.activeDiagnoses ?? 0}</div>
              <div className="stat-label">Active Diagnoses</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-red">💊</div>
            <div>
              <div className="stat-value">{loading ? "—" : stats?.pendingPrescriptions ?? 0}</div>
              <div className="stat-label">Pending Prescriptions</div>
            </div>
          </div>
        </div>

        {/* ── Staff Overview ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Staff Overview</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/admin/staff")}>
              Manage Staff →
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ borderColor: "#E5E7EB", borderTopColor: "#4F46E5", width: 28, height: 28 }} />
            </div>
          ) : staff.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <div className="empty-title">No staff yet</div>
              <div className="empty-desc">Add your first staff member to get started</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">{getInitials(s.full_name)}</div>
                          <span className="td-primary">{s.full_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${roleBadge[s.role] || "badge-gray"}`} style={{ textTransform: "capitalize" }}>
                          {s.role}
                        </span>
                      </td>
                      <td className="td-muted">{s.department || "—"}</td>
                      <td className="td-muted">{s.email}</td>
                      <td className="td-muted">{s.phone || "—"}</td>
                      <td>
                        <span className={`badge ${s.is_active ? "badge-green" : "badge-gray"}`}>
                          {s.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="td-muted">{new Date(s.created_at).toLocaleDateString()}</td>
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
// src/Pages/Doctors/DoctorDashbord.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../Components/layout/AppLayout";

const token = () => localStorage.getItem("mt_token");

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, dRes, rxRes] = await Promise.all([
          fetch("/api/patients", { headers: { Authorization: `Bearer ${token()}` } }),
          fetch("/api/patients", { headers: { Authorization: `Bearer ${token()}` } }),
          fetch("/api/patients", { headers: { Authorization: `Bearer ${token()}` } }),
        ]);
        const allPatients = await pRes.json();
        setPatients(allPatients.slice(0, 8));
        setStats({
          totalPatients: allPatients.length,
          today: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getInitials(name = "") {
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  }

  function calcAge(dob) {
    if (!dob) return "—";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + " yrs";
  }

  return (
    <AppLayout>
      <div className="page">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            {/* <p className="page-subtitle">{stats?.today || "Loading..."}</p> */}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/doctor/patients/new")}
          >
            + Register Patient
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
            <div className="stat-icon stat-icon-green">📋</div>
            <div>
              <div className="stat-value">—</div>
              <div className="stat-label">Active Diagnoses</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-amber">💊</div>
            <div>
              <div className="stat-value">—</div>
              <div className="stat-label">Pending Rx</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-red">🗓️</div>
            <div>
              <div className="stat-value">—</div>
              <div className="stat-label">Today's Visits</div>
            </div>
          </div>
        </div>

        {/* ── Recent Patients ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Patients</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate("/doctor/patients")}
            >
              View all →
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ borderColor: "#E5E7EB", borderTopColor: "#4F46E5", width: 28, height: 28 }} />
            </div>
          ) : patients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-title">No patients yet</div>
              <div className="empty-desc">Register your first patient to get started</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>MRN</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Blood Type</th>
                    <th>Allergies</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id} onClick={() => navigate(`/doctor/patients/${p.id}`)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">{getInitials(p.full_name)}</div>
                          <span className="td-primary">{p.full_name}</span>
                        </div>
                      </td>
                      <td><span className="td-mono">{p.mrn}</span></td>
                      <td>{calcAge(p.date_of_birth)}</td>
                      <td style={{ textTransform: "capitalize" }}>{p.gender}</td>
                      <td>
                        {p.blood_type
                          ? <span className="badge badge-red">{p.blood_type}</span>
                          : <span className="td-muted">—</span>}
                      </td>
                      <td>
                        {p.allergies
                          ? <span className="badge badge-amber">⚠ {p.allergies}</span>
                          : <span className="badge badge-gray">None</span>}
                      </td>
                      <td className="td-muted">
                        {new Date(p.created_at).toLocaleDateString()}
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
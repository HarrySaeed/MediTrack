// src/Pages/Doctors/PatientsList.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../Components/layout/AppLayout";

const token = () => localStorage.getItem("mt_token");

export default function PatientList() {
  const navigate           = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [debounced, setDebounced] = useState("");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res  = await fetch(`/api/patients?search=${encodeURIComponent(debounced)}`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await res.json();
        setPatients(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [debounced]);

  function calcAge(dob) {
    if (!dob) return "—";
    return Math.floor((Date.now() - new Date(dob)) / (1000 * 60 * 60 * 24 * 365.25)) + " yrs";
  }

  function getInitials(name = "") {
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  }

  return (
    <AppLayout>
      <div className="page">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Patients</h1>
            <p className="page-subtitle">
              {loading ? "Loading..." : `${patients.length} patient${patients.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/doctor/patients/new")}>
            + Register Patient
          </button>
        </div>

        {/* ── Search + Table ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">All Patients</span>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Search by name or MRN..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ borderColor: "#E5E7EB", borderTopColor: "#4F46E5", width: 28, height: 28 }} />
            </div>
          ) : patients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">{search ? "No results found" : "No patients yet"}</div>
              <div className="empty-desc">
                {search ? `No patients matching "${search}"` : "Register your first patient to get started"}
              </div>
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
                    <th>Phone</th>
                    <th>Allergies</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr
                      key={p.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/doctor/patients/${p.id}`)}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">{getInitials(p.full_name)}</div>
                          <div>
                            <div className="td-primary">{p.full_name}</div>
                            {p.address && <div className="td-muted" style={{ fontSize: 12 }}>{p.address}</div>}
                          </div>
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
                      <td className="td-muted">{p.phone || "—"}</td>
                      <td>
                        {p.allergies
                          ? <span className="badge badge-amber">⚠ {p.allergies}</span>
                          : <span className="badge badge-gray">None</span>}
                      </td>
                      <td className="td-muted">{new Date(p.created_at).toLocaleDateString()}</td>
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
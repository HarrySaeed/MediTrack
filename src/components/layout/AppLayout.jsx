/* ─────────────────────────────────────────────────────────
   FILE: src/components/layout/AppLayout.jsx
   Sidebar + main content shell. Used by all role dashboards.
   ───────────────────────────────────────────────────────── */

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../common/UI";

const NAV = {
  doctor: [
    { to: "/doctor",           icon: "⬡", label: "Dashboard" },
    { to: "/doctor/patients",  icon: "👥", label: "Patients" },
  ],
  pharmacist: [
    { to: "/pharmacist",         icon: "⬡", label: "Dashboard" },
    { to: "/pharmacist/lookup",  icon: "🔍", label: "Lookup Patient" },
  ],
  admin: [
    { to: "/admin",        icon: "⬡", label: "Dashboard" },
    { to: "/admin/staff",  icon: "👤", label: "Staff" },
  ],
};

const ROLE_COLORS = {
  doctor:     "var(--indigo)",
  pharmacist: "var(--green)",
  admin:      "#D97706",
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV[user?.role] || [];
  const accentColor = ROLE_COLORS[user?.role] || "var(--indigo)";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{
        width: "var(--sidebar-w)", background: "var(--ink)", display: "flex",
        flexDirection: "column", flexShrink: 0, padding: "0 0 16px",
      }}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: accentColor,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>🏥</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}>MediTrack</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "capitalize", fontWeight: 500 }}>{user?.role} portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                borderRadius: 8, fontSize: 13, fontWeight: 500, transition: "all 0.12s",
                background: isActive ? `${accentColor}22` : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,.5)",
                borderLeft: isActive ? `2px solid ${accentColor}` : "2px solid transparent",
              })}
            >
              <span style={{ fontSize: 14 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ margin: "0 10px", padding: "12px", borderRadius: 10, background: "rgba(255,255,255,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Avatar name={user?.name || ""} size={32} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "capitalize" }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: "100%", padding: "7px", borderRadius: 6, background: "rgba(255,255,255,.07)",
            border: "none", color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 500, cursor: "pointer",
            transition: "all 0.15s",
          }}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
        <div className="animate-fade" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 36px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
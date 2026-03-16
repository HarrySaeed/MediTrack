// src/Components/Layout/AppLayout.jsx

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext-v2";

const NAV = {
  doctor: [
    { to: "/doctor",          icon: "🏠", label: "Dashboard"    },
    { to: "/doctor/patients", icon: "👥", label: "Patients"     },
  ],
  pharmacist: [
    { to: "/pharmacist",        icon: "🏠", label: "Dashboard"    },
    { to: "/pharmacist/lookup", icon: "🔍", label: "Patient Lookup"},
  ],
  admin: [
    { to: "/admin",       icon: "🏠", label: "Dashboard"        },
    { to: "/admin/staff", icon: "👤", label: "Staff Management" },
  ],
};

const ROLE_COLOR = {
  doctor:     "active-doctor",
  pharmacist: "active-pharmacist",
  admin:      "active-admin",
};

const ROLE_LABEL = {
  doctor:     "Doctor",
  pharmacist: "Pharmacist",
  admin:      "Administrator",
};

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const links            = NAV[user?.role] || [];
  const activeClass      = ROLE_COLOR[user?.role] || "active";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">

      {/* ── Sidebar ── */}
      <aside className="sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏥</div>
          <span className="sidebar-logo-text">MediTrack</span>
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `sidebar-link${isActive ? ` active ${activeClass}` : ""}`
              }
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer — user info + sign out */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials(user?.name)}</div>
            <div className="sidebar-user-info min-w-0">
              <div className="sidebar-user-name truncate">{user?.name}</div>
              <div className="sidebar-user-role">{ROLE_LABEL[user?.role]}</div>
            </div>
          </div>
          <button className="sidebar-signout" onClick={handleLogout}>
            <span style={{ fontSize: 14 }}>🚪</span>
            Sign out
          </button>
        </div>

      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        {children}
      </main>

    </div>
  );
}
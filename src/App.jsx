/* ─────────────────────────────────────────────────────────
   FILE: src/App.jsx
   ───────────────────────────────────────────────────────── */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Auth
import LoginPage from "./pages/auth/LoginPage.jsx";

// Doctor
import DoctorDashboard from "./pages/doctors/DoctorDashboard.jsx";
import PatientList from "./pages/doctors/PatientList";
import PatientDetail from "./pages/doctors/PatientDetail.jsx";
import RegisterPatient from "./pages/doctors/RegisterPatient";

// Pharmacist
import PharmacistDashboard from "./pages/pharmacist/PharmacistDashboard.jsx";
import PatientLookup from "./pages/pharmacist/PatientLookup";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import StaffManagement from "./pages/admin/StaffManagement";

// Redirect to the right dashboard based on role
function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "doctor") return <Navigate to="/doctor" replace />;
  if (user.role === "pharmacist") return <Navigate to="/pharmacist" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
}

// Wrap routes that require auth + optional role check
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "DM Sans, sans-serif",
          color: "#6B7280",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Root → role-based redirect */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleRedirect />
          </ProtectedRoute>
        }
      />

      {/* Doctor */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute roles={["doctor"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute roles={["doctor"]}>
            <PatientList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients/new"
        element={
          <ProtectedRoute roles={["doctor"]}>
            <RegisterPatient />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients/:id"
        element={
          <ProtectedRoute roles={["doctor"]}>
            <PatientDetail />
          </ProtectedRoute>
        }
      />

      {/* Pharmacist */}
      <Route
        path="/pharmacist"
        element={
          <ProtectedRoute roles={["pharmacist"]}>
            <PharmacistDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/lookup"
        element={
          <ProtectedRoute roles={["pharmacist"]}>
            <PatientLookup />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <ProtectedRoute roles={["admin"]}>
            <StaffManagement />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

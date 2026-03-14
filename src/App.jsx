// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage          from "./pages/auth/Login";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";

import DoctorDashboard  from "./pages/doctors/DoctorDashbord";
import PatientList      from "./pages/doctors/PatientsList";
import PatientDetail    from "./pages/doctors/PatientDetail";
import RegisterPatient  from "./pages/doctors/RegisterPatient";

import PharmacistDashboard from "./pages/pharmacist/PharmacistDashboard";
import PatientLookup       from "./pages/pharmacist/PatientsLook";

import AdminDashboard  from "./pages/admin/AdminDashboard";
import StaffManagement from "./pages/admin/StaffManangement";
import AddStaff        from "./pages/admin/AddStaff";

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />;
  if (user.role === "doctor")     return <Navigate to="/doctor"     replace />;
  if (user.role === "pharmacist") return <Navigate to="/pharmacist" replace />;
  if (user.role === "admin")      return <Navigate to="/admin"      replace />;
  return <Navigate to="/login" replace />;
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#6B7280" }}>
      Loading…
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/"                element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

      {/* Doctor */}
      <Route path="/doctor"                element={<ProtectedRoute roles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/patients"       element={<ProtectedRoute roles={["doctor"]}><PatientList /></ProtectedRoute>} />
      <Route path="/doctor/patients/new"   element={<ProtectedRoute roles={["doctor"]}><RegisterPatient /></ProtectedRoute>} />
      <Route path="/doctor/patients/:id"   element={<ProtectedRoute roles={["doctor"]}><PatientDetail /></ProtectedRoute>} />

      {/* Pharmacist */}
      <Route path="/pharmacist"        element={<ProtectedRoute roles={["pharmacist"]}><PharmacistDashboard /></ProtectedRoute>} />
      <Route path="/pharmacist/lookup" element={<ProtectedRoute roles={["pharmacist"]}><PatientLookup /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin"           element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/staff"     element={<ProtectedRoute roles={["admin"]}><StaffManagement /></ProtectedRoute>} />
      <Route path="/admin/staff/new" element={<ProtectedRoute roles={["admin"]}><AddStaff /></ProtectedRoute>} />

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
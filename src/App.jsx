// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext-v2";

import LoginPage           from "./pages/auth/LoginPage";
import ChangePasswordPage  from "./pages/auth/ChangePasswordPage";

import DoctorDashboard   from "./Pages/doctors/DoctorDashboard";
import PatientList       from "./Pages/Doctors/PatientList";
import PatientDetail     from "./Pages/Doctors/PatientDetail";
import RegisterPatient   from "./Pages/Doctors/RegisterPatient";

import PharmacistDashboard from "./Pages/pharmacist/PharmacistDashboard";
import PatientLookup       from "./Pages/pharmacist/PatientLookup";

import AdminDashboard  from "./Pages/admin/AdminDashboard";
import StaffManagement from "./Pages/admin/StaffManagement";

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

      <Route path="/doctor"                element={<ProtectedRoute roles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/patients"       element={<ProtectedRoute roles={["doctor"]}><PatientList /></ProtectedRoute>} />
      <Route path="/doctor/patients/new"   element={<ProtectedRoute roles={["doctor"]}><RegisterPatient /></ProtectedRoute>} />
      <Route path="/doctor/patients/:id"   element={<ProtectedRoute roles={["doctor"]}><PatientDetail /></ProtectedRoute>} />

      <Route path="/pharmacist"        element={<ProtectedRoute roles={["pharmacist"]}><PharmacistDashboard /></ProtectedRoute>} />
      <Route path="/pharmacist/lookup" element={<ProtectedRoute roles={["pharmacist"]}><PatientLookup /></ProtectedRoute>} />

      <Route path="/admin"       element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute roles={["admin"]}><StaffManagement /></ProtectedRoute>} />

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
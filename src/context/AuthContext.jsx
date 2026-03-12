// /* ─────────────────────────────────────────────────────────
//    FILE: src/context/AuthContext.jsx
//    ───────────────────────────────────────────────────────── */

// import { createContext, useContext, useState, useEffect } from "react";
// import api from "../services/api";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser]       = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("mt_token");
//     const saved = localStorage.getItem("mt_user");
//     if (token && saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         setUser(parsed);
//         api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//       } catch {
//         localStorage.removeItem("mt_token");
//         localStorage.removeItem("mt_user");
//       }
//     }
//     setLoading(false);
//   }, []);

//   async function login(email, password) {
//     const { data } = await api.post("/auth/login", { email, password });
//     localStorage.setItem("mt_token", data.token);
//     localStorage.setItem("mt_user", JSON.stringify(data.user));
//     api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
//     setUser(data.user);
//     return data.user;
//   }

//   function logout() {
//     localStorage.removeItem("mt_token");
//     localStorage.removeItem("mt_user");
//     delete api.defaults.headers.common["Authorization"];
//     setUser(null);
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }




/* ─────────────────────────────────────────────────────────
   FILE: src/context/AuthContext.jsx NEW CODE 
   ───────────────────────────────────────────────────────── */

   /* ─────────────────────────────────────────────────────────
   FILE: src/context/AuthContext.jsx
   ───────────────────────────────────────────────────────── */

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// ── Mock users for local testing (no backend needed) ──────
const MOCK_USERS = {
  "doctor@meditrack.com": {
    id: 1,
    name: "Dr. Sarah Chen",
    email: "doctor@meditrack.com",
    role: "doctor",
    department: "General Medicine",
  },
  "pharmacy@meditrack.com": {
    id: 2,
    name: "Alex Rivera",
    email: "pharmacy@meditrack.com",
    role: "pharmacist",
    department: "Pharmacy",
  },
  "admin@meditrack.com": {
    id: 3,
    name: "Admin User",
    email: "admin@meditrack.com",
    role: "admin",
    department: "Administration",
  },
};

const MOCK_PASSWORD = "Password123!";

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on page refresh
  useEffect(() => {
    const saved = localStorage.getItem("mt_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem("mt_user"); }
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    const matched = MOCK_USERS[email.toLowerCase()];

    if (!matched || password !== MOCK_PASSWORD) {
      throw { response: { data: { error: "Invalid email or password" } } };
    }

    const token = btoa(JSON.stringify({ id: matched.id, role: matched.role }));
    localStorage.setItem("mt_token", token);
    localStorage.setItem("mt_user", JSON.stringify(matched));
    setUser(matched);
    return matched;
  }

  function logout() {
    localStorage.removeItem("mt_token");
    localStorage.removeItem("mt_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
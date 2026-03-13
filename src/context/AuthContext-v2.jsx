// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("mt_token");
    const saved = localStorage.getItem("mt_user");
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem("mt_user"); }
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const res  = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw { response: { data } };

    localStorage.setItem("mt_token", data.token);
    localStorage.setItem("mt_user",  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
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
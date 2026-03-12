/* ─────────────────────────────────────────────────────────
   FILE: src/services/admin.service.js
   ───────────────────────────────────────────────────────── */

import api from "./api";

export const adminService = {
  getStats:     ()       => api.get("/admin/stats"),
  getStaff:     ()       => api.get("/admin/staff"),
  createStaff:  (data)   => api.post("/admin/staff", data),
  toggleStatus: (id)     => api.patch(`/admin/staff/${id}/toggle`),
};

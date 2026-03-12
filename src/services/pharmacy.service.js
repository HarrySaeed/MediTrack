/* ─────────────────────────────────────────────────────────
   FILE: src/services/pharmacy.service.js
   ───────────────────────────────────────────────────────── */

import api from "./api";

export const pharmacyService = {
  getPending:         ()    => api.get("/pharmacy/pending"),
  lookup:             (id)  => api.get(`/pharmacy/patients/${id}`),
  fillPrescription:   (id)  => api.patch(`/pharmacy/prescriptions/${id}/fill`),
  cancelPrescription: (id)  => api.patch(`/pharmacy/prescriptions/${id}/cancel`),
};

/* ─────────────────────────────────────────────────────────
   FILE: src/services/patients.service.js
   ───────────────────────────────────────────────────────── */

import api from "./api";

export const patientService = {
  getAll:          (search = "") => api.get(`/patients?search=${encodeURIComponent(search)}`),
  getById:         (id)          => api.get(`/patients/${id}`),
  create:          (data)        => api.post("/patients", data),
  update:          (id, data)    => api.put(`/patients/${id}`, data),
  addHistory:      (id, data)    => api.post(`/patients/${id}/history`, data),
  addDiagnosis:    (id, data)    => api.post(`/patients/${id}/diagnoses`, data),
  addPrescription: (id, data)    => api.post(`/patients/${id}/prescriptions`, data),
};

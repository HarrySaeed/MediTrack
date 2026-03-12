/* ─────────────────────────────────────────────────────────
   FILE: src/pages/admin/StaffManagement.jsx
   ───────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { PageHeader, Card, Button, Input, Select, FormGrid, Modal, Spinner, EmptyState } from "../../components/common/UI";
import { adminService } from "../../services/admin.service";

const ROLE_COLOR = { doctor: "var(--indigo)", pharmacist: "var(--green)", admin: "#D97706" };
const ROLE_ICON  = { doctor: "🩺", pharmacist: "💊", admin: "🔒" };

const BLANK = { full_name: "", email: "", password: "", role: "doctor", department: "", phone: "" };

export default function StaffManagement() {
  const [staff, setStaff]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(BLANK);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [apiError, setApiError] = useState("");

  async function load() {
    try { const r = await adminService.getStaff(); setStaff(r.data); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const f = patch => setForm(p => ({ ...p, ...patch }));

  function validate() {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Name required";
    if (!form.email.trim())     e.email     = "Email required";
    if (!form.password)         e.password  = "Password required (min 6 chars)";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    return e;
  }

  async function handleCreate(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true); setApiError("");
    try {
      await adminService.createStaff(form);
      setModal(false); setForm(BLANK); setErrors({});
      load();
    } catch (err) {
      setApiError(err.response?.data?.error || "Failed to create staff account.");
    } finally { setSaving(false); }
  }

  async function handleToggle(id) {
    await adminService.toggleStatus(id);
    load();
  }

  const doctors     = staff.filter(s => s.role === "doctor");
  const pharmacists = staff.filter(s => s.role === "pharmacist");
  const admins      = staff.filter(s => s.role === "admin");

  return (
    <AppLayout>
      <PageHeader
        title="Staff Management"
        subtitle={`${staff.filter(s => s.is_active).length} active · ${staff.length} total`}
        action={<Button onClick={() => { setForm(BLANK); setErrors({}); setApiError(""); setModal(true); }}>+ Add Staff</Button>}
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner /></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {[["Doctors", doctors], ["Pharmacists", pharmacists], ["Admins", admins]].map(([group, members]) => (
            members.length > 0 && (
              <Card key={group}>
                <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{ROLE_ICON[members[0]?.role]}</span>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700 }}>{group}</h2>
                  <span style={{ fontSize: 12, color: "var(--ink-faint)", marginLeft: 2 }}>({members.length})</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                      {["Name", "Email", "Department", "Phone", "Status", ""].map(h => (
                        <th key={h} style={{ padding: "9px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(s => (
                      <tr key={s.id} style={{ borderBottom: "1px solid var(--border-light)", opacity: s.is_active ? 1 : 0.55 }}>
                        <td style={{ padding: "12px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${ROLE_COLOR[s.role]}14`, color: ROLE_COLOR[s.role], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                              {s.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{s.full_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>{s.email}</td>
                        <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--ink-muted)" }}>{s.department || "—"}</td>
                        <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--ink-muted)" }}>{s.phone || "—"}</td>
                        <td style={{ padding: "12px 20px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: s.is_active ? "var(--green-bg)" : "var(--red-bg)", color: s.is_active ? "var(--green)" : "var(--red)" }}>
                            {s.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <Button size="sm" variant={s.is_active ? "danger" : "success"} onClick={() => handleToggle(s.id)}>
                            {s.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )
          ))}
          {staff.length === 0 && <EmptyState icon="👤" message="No staff accounts yet." />}
        </div>
      )}

      {/* Create staff modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Staff Account">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FormGrid cols={2}>
            <Input label="Full Name *"  placeholder="Dr. Jane Smith"       value={form.full_name}  error={errors.full_name}  onChange={e => f({ full_name: e.target.value })} />
            <Input label="Email *"      placeholder="jane@hospital.com"    value={form.email}      error={errors.email}      onChange={e => f({ email: e.target.value })} />
          </FormGrid>
          <Input label="Password *"  type="password" placeholder="Min 6 characters" value={form.password}  error={errors.password}  onChange={e => f({ password: e.target.value })} />
          <FormGrid cols={3}>
            <Select label="Role" value={form.role} onChange={e => f({ role: e.target.value })}>
              <option value="doctor">Doctor</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="admin">Admin</option>
            </Select>
            <Input label="Department" placeholder="e.g. Cardiology" value={form.department} onChange={e => f({ department: e.target.value })} />
            <Input label="Phone"      placeholder="+1 555 000 0000"  value={form.phone}      onChange={e => f({ phone: e.target.value })} />
          </FormGrid>
          {apiError && <div style={{ padding: "10px 14px", background: "var(--red-bg)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--red)" }}>{apiError}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <Button type="button" variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Account</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
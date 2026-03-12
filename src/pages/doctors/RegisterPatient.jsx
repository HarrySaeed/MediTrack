/* ─────────────────────────────────────────────────────────
   FILE: src/pages/doctor/RegisterPatient.jsx
   ───────────────────────────────────────────────────────── */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { PageHeader, Card, Button, Input, Select, Textarea, FormGrid } from "../../components/common/UI";
import { patientService } from "../../services/patients.service";

const INITIAL = {
  full_name: "", date_of_birth: "", gender: "female",
  blood_type: "", phone: "", address: "",
  emergency_contact_name: "", emergency_contact_phone: "", allergies: "",
};

export default function RegisterPatient() {
  const navigate = useNavigate();
  const [form, setForm]     = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const f = patch => setForm(p => ({ ...p, ...patch }));

  function validate() {
    const e = {};
    if (!form.full_name.trim())    e.full_name    = "Full name is required";
    if (!form.date_of_birth)       e.date_of_birth = "Date of birth is required";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setApiError("");
    try {
      const r = await patientService.create(form);
      navigate(`/doctor/patients/${r.data.id}`);
    } catch (err) {
      setApiError(err.response?.data?.error || "Failed to register patient.");
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <button onClick={() => navigate("/doctor/patients")} style={{ background: "none", border: "none", color: "var(--ink-faint)", fontSize: 13, cursor: "pointer", marginBottom: 20 }}>
        ← Back to patients
      </button>

      <PageHeader title="Register New Patient" subtitle="Fill in the patient's details below." />

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
          {/* Personal Info */}
          <Card style={{ padding: "24px 28px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Personal Information</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FormGrid cols={2}>
                <Input label="Full Name *"     placeholder="Jane Smith"         value={form.full_name}    error={errors.full_name}    onChange={e => f({ full_name: e.target.value })} />
                <Input label="Date of Birth *" type="date"                       value={form.date_of_birth} error={errors.date_of_birth} onChange={e => f({ date_of_birth: e.target.value })} />
              </FormGrid>
              <FormGrid cols={3}>
                <Select label="Gender" value={form.gender} onChange={e => f({ gender: e.target.value })}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </Select>
                <Select label="Blood Type" value={form.blood_type} onChange={e => f({ blood_type: e.target.value })}>
                  <option value="">Unknown</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
                <Input label="Phone" placeholder="+1 555 000 0000" value={form.phone} onChange={e => f({ phone: e.target.value })} />
              </FormGrid>
              <Textarea label="Address" placeholder="123 Main St, City, State" value={form.address} onChange={e => f({ address: e.target.value })} style={{ minHeight: 60 }} />
            </div>
          </Card>

          {/* Emergency contact */}
          <Card style={{ padding: "24px 28px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Emergency Contact</h2>
            <FormGrid cols={2}>
              <Input label="Contact Name"  placeholder="John Smith"       value={form.emergency_contact_name}  onChange={e => f({ emergency_contact_name: e.target.value })} />
              <Input label="Contact Phone" placeholder="+1 555 000 0000" value={form.emergency_contact_phone} onChange={e => f({ emergency_contact_phone: e.target.value })} />
            </FormGrid>
          </Card>

          {/* Medical */}
          <Card style={{ padding: "24px 28px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Medical Notes</h2>
            <Textarea label="Known Allergies" placeholder="e.g. Penicillin, Sulfa drugs" value={form.allergies} onChange={e => f({ allergies: e.target.value })} style={{ minHeight: 64 }} />
          </Card>

          {apiError && (
            <div style={{ padding: "12px 16px", background: "var(--red-bg)", borderRadius: "var(--radius)", color: "var(--red)", fontSize: 13, borderLeft: "3px solid var(--red)" }}>
              {apiError}
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <Button type="submit" loading={loading} size="lg">Register Patient</Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => navigate("/doctor/patients")}>Cancel</Button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
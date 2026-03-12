/* ─────────────────────────────────────────────────────────
   FILE: src/components/common/UI.jsx
   Shared primitive components used everywhere.
   ───────────────────────────────────────────────────────── */

import { useState } from "react";

/* ── Button ─────────────────────────────────────────────── */
export function Button({ children, variant = "primary", size = "md", loading, fullWidth, style, ...props }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    fontFamily: "var(--font-body)", fontWeight: 600, borderRadius: "var(--radius)",
    border: "none", transition: "all 0.15s", cursor: props.disabled || loading ? "not-allowed" : "pointer",
    width: fullWidth ? "100%" : undefined, whiteSpace: "nowrap",
    opacity: props.disabled || loading ? 0.65 : 1,
  };
  const sizes = {
    sm: { padding: "5px 12px", fontSize: 13 },
    md: { padding: "9px 18px", fontSize: 14 },
    lg: { padding: "12px 24px", fontSize: 15 },
  };
  const variants = {
    primary:   { background: "var(--indigo)",       color: "#fff" },
    secondary: { background: "var(--indigo-light)", color: "var(--indigo)" },
    danger:    { background: "var(--red-bg)",        color: "var(--red)" },
    ghost:     { background: "transparent",          color: "var(--ink-muted)", border: "1.5px solid var(--border)" },
    success:   { background: "var(--green-bg)",      color: "var(--green)" },
  };
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...style }} {...props}>
      {loading ? <Spinner size={14} color="currentColor" /> : children}
    </button>
  );
}

/* ── Input ──────────────────────────────────────────────── */
export function Input({ label, error, hint, icon, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--ink-faint)", pointerEvents: "none" }}>{icon}</span>}
        <input
          {...props}
          onFocus={e => { setFocused(true); props.onFocus?.(e); }}
          onBlur={e => { setFocused(false); props.onBlur?.(e); }}
          style={{
            width: "100%", padding: icon ? "9px 12px 9px 34px" : "9px 12px",
            border: `1.5px solid ${error ? "var(--red)" : focused ? "var(--indigo)" : "var(--border)"}`,
            borderRadius: "var(--radius)", fontSize: 14, color: "#000",
            background: props.disabled ? "var(--bg)" : "#fff",
            outline: "none", transition: "border-color 0.15s",
            boxShadow: focused ? "0 0 0 3px rgba(79,70,229,0.08)" : "none",
            ...props.style,
          }}
        />
      </div>
      {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{hint}</span>}
    </div>
  );
}

/* ── Select ─────────────────────────────────────────────── */
export function Select({ label, error, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
      <select
        {...props}
        style={{
          width: "100%", padding: "9px 12px", border: "1.5px solid var(--border)",
          borderRadius: "var(--radius)", fontSize: 14, color: "#000",
          background: "#fff", outline: "none", ...props.style,
        }}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
    </div>
  );
}

/* ── Textarea ───────────────────────────────────────────── */
export function Textarea({ label, error, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
      <textarea
        {...props}
        style={{
          width: "100%", padding: "9px 12px", border: "1.5px solid var(--border)",
          borderRadius: "var(--radius)", fontSize: 14, color: "#000",
          background: "#fff", outline: "none", resize: "vertical", minHeight: 80,
          fontFamily: "var(--font-body)", ...props.style,
        }}
      />
      {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
    </div>
  );
}

/* ── Badge ──────────────────────────────────────────────── */
const BADGE_VARIANTS = {
  active:      { bg: "var(--green-bg)",        color: "var(--green)",   dot: "#059669" },
  pending:     { bg: "var(--amber-bg)",         color: "var(--amber)",   dot: "#D97706" },
  filled:      { bg: "var(--blue-bg)",          color: "var(--blue)",    dot: "#2563EB" },
  cancelled:   { bg: "var(--border-light)",     color: "var(--ink-faint)", dot: "#9CA3AF" },
  chronic:     { bg: "#FFF7ED",                 color: "#C2410C",        dot: "#EA580C" },
  resolved:    { bg: "var(--blue-bg)",          color: "var(--blue)",    dot: "#2563EB" },
  doctor:      { bg: "var(--indigo-light)",     color: "var(--indigo)",  dot: "var(--indigo)" },
  pharmacist:  { bg: "var(--green-bg)",         color: "var(--green)",   dot: "var(--green)" },
  admin:       { bg: "#FFF7ED",                 color: "#C2410C",        dot: "#EA580C" },
};

export function Badge({ status, label }) {
  const v = BADGE_VARIANTS[status?.toLowerCase()] || BADGE_VARIANTS.cancelled;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: v.bg, color: v.color, letterSpacing: "0.03em",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: v.dot, flexShrink: 0 }} />
      {label || status}
    </span>
  );
}

/* ── Spinner ────────────────────────────────────────────── */
export function Spinner({ size = 20, color = "var(--indigo)" }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}30`, borderTopColor: color,
      display: "inline-block", animation: "spin 0.7s linear infinite", flexShrink: 0,
    }} />
  );
}

/* ── Avatar ─────────────────────────────────────────────── */
export function Avatar({ name = "", size = 36 }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = (name.charCodeAt(0) * 37 + name.charCodeAt(1) * 17) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},50%,90%)`, color: `hsl(${hue},50%,30%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.38,
    }}>
      {initials}
    </div>
  );
}

/* ── Card ───────────────────────────────────────────────── */
export function Card({ children, style, ...props }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)",
      ...style,
    }} {...props}>
      {children}
    </div>
  );
}

/* ── Modal ──────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(13,17,23,0.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade"
        style={{
          background: "var(--surface)", borderRadius: "var(--radius-lg)",
          width: "100%", maxWidth: width, maxHeight: "88vh", overflowY: "auto",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "var(--bg)", border: "none", borderRadius: 8, width: 32, height: 32, fontSize: 18, color: "var(--ink-faint)", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

/* ── FormGrid ───────────────────────────────────────────── */
export function FormGrid({ children, cols = 2 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px 20px" }}>
      {children}
    </div>
  );
}

/* ── Empty State ────────────────────────────────────────── */
export function EmptyState({ icon = "📋", message = "No records found." }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--ink-faint)" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{message}</p>
    </div>
  );
}

/* ── Page Header ────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: "var(--ink-faint)", marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Stats Card ─────────────────────────────────────────── */
export function StatCard({ icon, label, value, color = "var(--indigo)" }) {
  return (
    <Card style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--ink)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 3, fontWeight: 500 }}>{label}</div>
      </div>
    </Card>
  );
}
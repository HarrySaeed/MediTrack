import {
  pgTable, serial, varchar, text,
  boolean, date, timestamp, integer, pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────
export const userRoleEnum           = pgEnum("user_role",            ["admin", "doctor", "pharmacist"]);
export const genderEnum             = pgEnum("gender_type",          ["male", "female", "other"]);
export const prescriptionStatusEnum = pgEnum("prescription_status",  ["pending", "filled", "cancelled"]);
export const diagnosisStatusEnum    = pgEnum("diagnosis_status",     ["active", "resolved", "chronic"]);

// ── Staff ──────────────────────────────────────────────────
export const staff = pgTable("staff", {
  id:           serial("id").primaryKey(),
  fullName:     varchar("full_name",    { length: 100 }).notNull(),
  email:        varchar("email",        { length: 150 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role:         userRoleEnum("role").notNull(),
  department:   varchar("department",   { length: 100 }),
  phone:        varchar("phone",        { length: 20 }),
  isActive:     boolean("is_active").default(true),
  createdAt:    timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ── Patients ───────────────────────────────────────────────
export const patients = pgTable("patients", {
  id:                    serial("id").primaryKey(),
  mrn:                   varchar("mrn",                  { length: 20  }).notNull().unique(),
  fullName:              varchar("full_name",             { length: 100 }).notNull(),
  dateOfBirth:           date("date_of_birth").notNull(),
  gender:                genderEnum("gender").notNull(),
  bloodType:             varchar("blood_type",            { length: 5   }),
  phone:                 varchar("phone",                 { length: 20  }),
  address:               text("address"),
  emergencyContactName:  varchar("emergency_contact_name", { length: 100 }),
  emergencyContactPhone: varchar("emergency_contact_phone",{ length: 20  }),
  allergies:             text("allergies"),
  registeredBy:          integer("registered_by").references(() => staff.id),
  createdAt:             timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt:             timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ── Medical History ────────────────────────────────────────
export const medicalHistory = pgTable("medical_history", {
  id:         serial("id").primaryKey(),
  patientId:  integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  condition:  varchar("condition", { length: 200 }).notNull(),
  notes:      text("notes"),
  recordedBy: integer("recorded_by").references(() => staff.id),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow(),
});

// ── Visits ─────────────────────────────────────────────────
export const visits = pgTable("visits", {
  id:             serial("id").primaryKey(),
  patientId:      integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  doctorId:       integer("doctor_id").notNull().references(() => staff.id),
  chiefComplaint: text("chief_complaint"),
  notes:          text("notes"),
  visitedAt:      timestamp("visited_at", { withTimezone: true }).defaultNow(),
});

// ── Diagnoses ──────────────────────────────────────────────
export const diagnoses = pgTable("diagnoses", {
  id:          serial("id").primaryKey(),
  patientId:   integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  visitId:     integer("visit_id").references(() => visits.id),
  doctorId:    integer("doctor_id").notNull().references(() => staff.id),
  icdCode:     varchar("icd_code",   { length: 20  }),
  condition:   varchar("condition",  { length: 200 }).notNull(),
  status:      diagnosisStatusEnum("status").default("active"),
  notes:       text("notes"),
  diagnosedAt: timestamp("diagnosed_at", { withTimezone: true }).defaultNow(),
});

// ── Prescriptions ──────────────────────────────────────────
export const prescriptions = pgTable("prescriptions", {
  id:           serial("id").primaryKey(),
  patientId:    integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  visitId:      integer("visit_id").references(() => visits.id),
  doctorId:     integer("doctor_id").notNull().references(() => staff.id),
  pharmacistId: integer("pharmacist_id").references(() => staff.id),
  drugName:     varchar("drug_name",  { length: 200 }).notNull(),
  dosage:       varchar("dosage",     { length: 100 }).notNull(),
  frequency:    varchar("frequency",  { length: 100 }).notNull(),
  duration:     varchar("duration",   { length: 100 }),
  instructions: text("instructions"),
  status:       prescriptionStatusEnum("status").default("pending"),
  prescribedAt: timestamp("prescribed_at", { withTimezone: true }).defaultNow(),
  filledAt:     timestamp("filled_at",     { withTimezone: true }),
});
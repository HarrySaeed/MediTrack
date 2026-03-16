// add-cnic-migration.js
// Run with: netlify dev:exec node add-cnic-migration.js

import { neon } from "@netlify/neon";
const sql = neon();

await sql`ALTER TABLE patients ADD COLUMN IF NOT EXISTS cnic varchar(15) UNIQUE`;
console.log("✅ CNIC column added");
process.exit(0);
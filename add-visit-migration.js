// add-visit-migration.js
// Run with: netlify dev:exec node add-visit-migration.js

import { neon } from "@netlify/neon";
const sql = neon();

// Make chief_complaint optional and add auto-visit support
await sql`ALTER TABLE visits ALTER COLUMN doctor_id DROP NOT NULL`;
await sql`ALTER TABLE visits ADD COLUMN IF NOT EXISTS is_auto boolean DEFAULT true`;
console.log("✅ Migration done");
process.exit(0);
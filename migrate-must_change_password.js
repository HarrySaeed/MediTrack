// run-once-migration.js
// Run with: netlify dev:exec node run-once-migration.js

import { neon } from "@netlify/neon";
const sql = neon();

await sql`ALTER TABLE staff ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false`;
console.log("✅ must_change_password column added");
process.exit(0);

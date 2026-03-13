// fix-passwords.js
// Run with: netlify dev:exec node fix-passwords.js

import { neon } from "@netlify/neon";
import bcrypt from "bcryptjs";

const sql = neon();

const hash = await bcrypt.hash("Password123!", 10);
console.log("Generated hash:", hash);

await sql`UPDATE staff SET password_hash = ${hash}`;
console.log("✅ All staff passwords updated to Password123!");
process.exit(0);
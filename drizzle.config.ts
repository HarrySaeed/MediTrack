// ─────────────────────────────────────────────────────────
// FILE: drizzle.config.ts  (project root)
// ─────────────────────────────────────────────────────────

import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

if (!url) {
  throw new Error("No database URL found. Run: netlify env:get NETLIFY_DATABASE_URL and add it to .env");
}

export default defineConfig({
  schema:    "./src/db/schema.js",
  out:       "./db/migrations",
  dialect:   "postgresql",
  dbCredentials: { url },
  verbose: true,
  strict:  true,
});
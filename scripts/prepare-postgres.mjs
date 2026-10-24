/**
 * Vercel build step: switch the Prisma datasource from SQLite (local
 * development) to PostgreSQL (Neon) before `prisma generate`.
 *
 * It edits prisma/schema.prisma in the build machine's copy only. It refuses
 * to run outside Vercel unless --force is passed, so your local schema is
 * never changed by accident.
 */
import { readFileSync, writeFileSync } from "node:fs";

if (!process.env.VERCEL && !process.argv.includes("--force")) {
  console.log("[prepare-postgres] Not on Vercel; leaving prisma/schema.prisma unchanged.");
  process.exit(0);
}

if (!process.env.DATABASE_URL?.startsWith("postgres")) {
  console.error("[prepare-postgres] DATABASE_URL is missing or is not a PostgreSQL URL. Connect a Neon database to the Vercel project.");
  process.exit(1);
}

const file = "prisma/schema.prisma";
const schema = readFileSync(file, "utf8");
const datasource = /datasource db \{[\s\S]*?\}/;
if (!datasource.test(schema)) throw new Error("datasource block not found in schema.prisma");

// Neon gives a pooled DATABASE_URL plus a direct one for schema changes.
const direct = process.env.DATABASE_URL_UNPOOLED ? '\n  directUrl = env("DATABASE_URL_UNPOOLED")' : "";
const updated = schema.replace(
  datasource,
  `datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")${direct}\n}`,
);
writeFileSync(file, updated);
console.log(`[prepare-postgres] Using PostgreSQL${direct ? " with a direct URL for schema changes" : ""}.`);

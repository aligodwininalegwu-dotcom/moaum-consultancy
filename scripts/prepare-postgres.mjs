/**
 * Vercel build step: switch the Prisma datasource from SQLite (local
 * development) to PostgreSQL (Neon) before `prisma generate`.
 *
 * Vercel's Neon integration may name the connection settings with a prefix
 * (e.g. STORAGE_DATABASE_URL) depending on how it was connected, so this
 * finds the right variables by name and points the schema at them.
 *
 * It edits prisma/schema.prisma in the build machine's copy only, and
 * refuses to run outside Vercel unless --force is passed.
 */
import { readFileSync, writeFileSync } from "node:fs";

if (!process.env.VERCEL && !process.argv.includes("--force")) {
  console.log("[prepare-postgres] Not on Vercel; leaving prisma/schema.prisma unchanged.");
  process.exit(0);
}

const isPostgres = (name) => /^postgres(ql)?:\/\//.test(process.env[name] ?? "");
const names = Object.keys(process.env);

// Pooled URL for the app; preferred names first, then any prefixed variant.
const pooledCandidates = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  ...names.filter((n) => /(^|_)DATABASE_URL$/.test(n)),
  ...names.filter((n) => /(^|_)POSTGRES_PRISMA_URL$/.test(n)),
  ...names.filter((n) => /(^|_)POSTGRES_URL$/.test(n)),
];
// Direct (non-pooled) URL for schema changes.
const directCandidates = [
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  ...names.filter((n) => /(^|_)DATABASE_URL_UNPOOLED$/.test(n)),
  ...names.filter((n) => /(^|_)POSTGRES_URL_NON_POOLING$/.test(n)),
];

const urlVar = pooledCandidates.find(isPostgres);
const directVar = directCandidates.find(isPostgres);

if (!urlVar) {
  const related = names.filter((n) => /DATABASE|POSTGRES|PG|NEON/i.test(n)).sort();
  console.error("[prepare-postgres] No PostgreSQL connection URL found for this deployment.");
  console.error(`[prepare-postgres] Database-related variables present: ${related.length ? related.join(", ") : "(none)"}`);
  console.error("[prepare-postgres] Fix: Vercel → Storage → your Neon database → Connect Project → tick Production (and Preview), then redeploy.");
  process.exit(1);
}

const file = "prisma/schema.prisma";
const schema = readFileSync(file, "utf8");
const datasource = /datasource db \{[\s\S]*?\}/;
if (!datasource.test(schema)) throw new Error("datasource block not found in schema.prisma");

const updated = schema.replace(
  datasource,
  `datasource db {\n  provider = "postgresql"\n  url      = env("${urlVar}")${directVar ? `\n  directUrl = env("${directVar}")` : ""}\n}`,
);
writeFileSync(file, updated);
console.log(`[prepare-postgres] Using PostgreSQL from ${urlVar}${directVar ? ` (schema changes via ${directVar})` : ""}.`);

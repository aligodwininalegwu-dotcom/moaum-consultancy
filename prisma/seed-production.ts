/**
 * Production seed — runs on every Vercel deploy and is safe to repeat.
 *
 * - Loads the shop and programme catalogue only if those tables are empty,
 *   so edits made later in the admin console are never overwritten.
 * - Creates ONE administrator from ADMIN_EMAIL / ADMIN_PASSWORD if no user
 *   with that email exists yet. It never creates the demo accounts.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { programmes, shops } from "./catalog";

const prisma = new PrismaClient();

async function main() {
  if ((await prisma.shop.count()) === 0) {
    await prisma.shop.createMany({ data: shops.map((s) => ({ ...s, features: s.features.join(",") })) });
    console.log(`[seed] Added ${shops.length} shops.`);
  }

  if ((await prisma.programme.count()) === 0) {
    await prisma.programme.createMany({
      data: programmes.map((p) => ({
        ...p,
        startDate: new Date(p.startDate),
        modules: JSON.stringify(p.modules),
        featured: p.featured ?? false,
      })),
    });
    console.log(`[seed] Added ${programmes.length} programmes.`);
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set; skipping admin account.");
  } else if (password.length < 10) {
    throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
  } else if (!(await prisma.user.findUnique({ where: { email } }))) {
    await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME?.trim() || "Consultancy Administrator",
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "ADMIN",
        department: "Consultancy Unit",
      },
    });
    console.log(`[seed] Created administrator ${email}.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

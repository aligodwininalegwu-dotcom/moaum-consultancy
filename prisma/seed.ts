/**
 * Seed data for local testing.
 * Run with `npm run db:seed` (or `npm run db:reset` to wipe and reseed).
 *
 * Demo accounts (password for all: Password123):
 *   admin@moaum.edu.ng    ADMIN
 *   staff@moaum.edu.ng    STAFF
 *   student@moaum.edu.ng  STUDENT
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { programmes, shops } from "./catalog";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "Password123";

async function main() {
  console.log("Seeding MOAUM Consultancy database…");

  await prisma.registration.deleteMany();
  await prisma.shopApplication.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.programme.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [admin, staff, student, student2, trader] = await Promise.all([
    prisma.user.create({ data: { name: "Consultancy Administrator", email: "admin@moaum.edu.ng", passwordHash, role: "ADMIN", phone: "08030000001", department: "Consultancy Unit" } }),
    prisma.user.create({ data: { name: "Terver Akaa", email: "staff@moaum.edu.ng", passwordHash, role: "STAFF", phone: "08030000002", department: "Consultancy Unit" } }),
    prisma.user.create({ data: { name: "Doosuur Iorliam", email: "student@moaum.edu.ng", passwordHash, role: "STUDENT", phone: "08030000003", matricNo: "BSU/SC/CMP/21/12345", department: "Computer Science" } }),
    prisma.user.create({ data: { name: "Ojonugwa Adah", email: "ojonugwa@example.com", passwordHash, role: "STUDENT", phone: "08030000004", matricNo: "BSU/MS/ACC/22/22891", department: "Accounting" } }),
    prisma.user.create({ data: { name: "Mrs. Ngodoo Shima", email: "trader@example.com", passwordHash, role: "STUDENT", phone: "08030000005" } }),
  ]);

  const createdShops = await Promise.all(
    shops.map((s) => prisma.shop.create({ data: { ...s, features: s.features.join(",") } })),
  );
  const shop = (code: string) => createdShops.find((s) => s.code === code)!;

  const createdProgrammes = await Promise.all(
    programmes.map((p) =>
      prisma.programme.create({
        data: { ...p, startDate: new Date(p.startDate), modules: JSON.stringify(p.modules), featured: p.featured ?? false },
      }),
    ),
  );
  const programme = (slug: string) => createdProgrammes.find((p) => p.slug === slug)!;

  // Sample shop applications in different states
  await prisma.shopApplication.createMany({
    data: [
      { reference: "MOAUM-SA-2026-7KD2Q", campus: "WESTERN", businessName: "Iorliam Digital Hub", businessType: "Business centre & printing", description: "A student-run business centre offering printing, binding, typing and project-formatting services, with two networked computers and a high-volume laser printer.", yearsExperience: 2, phone: "08030000003", status: "PENDING", applicantId: student.id, preferredShopId: shop("WC-A01").id },
      { reference: "MOAUM-SA-2026-3MPX8", campus: "EASTERN", businessName: "Shima's Kitchen", businessType: "Restaurant / food vendor", description: "An established local restaurant serving affordable, hygienic Tiv and continental meals. Operated from Wurukum market for six years; we hold a current food handler's certificate.", yearsExperience: 6, phone: "08030000005", status: "UNDER_REVIEW", applicantId: trader.id, preferredShopId: shop("EC-B01").id, reviewedById: staff.id },
      { reference: "MOAUM-SA-2026-9RT4W", campus: "WESTERN", businessName: "Adah Gadget Clinic", businessType: "Phone & laptop repairs", description: "Repairs of phones, laptops and accessories with a 30-day warranty on parts. Trained under a certified technician for three years.", yearsExperience: 3, phone: "08030000004", status: "ALLOCATED", adminNote: "Allocated following interview on 14 Sept. Tenancy agreement to be signed at the Bursary.", applicantId: student2.id, preferredShopId: shop("WC-A03").id, allocatedShopId: shop("WC-B03").id, reviewedById: admin.id },
      { reference: "MOAUM-SA-2026-2HJ6N", campus: "EASTERN", businessName: "Quick Stop Provisions", businessType: "Provisions & convenience", description: "Small convenience store selling beverages, toiletries and stationery to hostel residents at regulated prices.", yearsExperience: 1, phone: "08030000004", status: "REJECTED", adminNote: "Category is over-subscribed on the Eastern Campus this session. You are welcome to re-apply for the Western Campus.", applicantId: student2.id, preferredShopId: shop("EC-B02").id, reviewedById: staff.id },
    ],
  });

  await prisma.registration.createMany({
    data: [
      { reference: "MOAUM-PR-2026-5WQ3A", programmeId: programme("website-design-development").id, userId: student.id, phone: "08030000003", institution: "MOAU Makurdi", status: "CONFIRMED", paymentStatus: "PAID", paymentReference: "FBN-TRF-55120934", motivation: "I want to build websites for small businesses around campus." },
      { reference: "MOAUM-PR-2026-8H2LQ", programmeId: programme("digital-literacy-online").id, userId: student.id, phone: "08030000003", institution: "MOAU Makurdi", status: "PENDING", paymentStatus: "UNPAID" },
      { reference: "MOAUM-PR-2026-4TZ9K", programmeId: programme("microsoft-office-proficiency").id, userId: student2.id, phone: "08030000004", institution: "MOAU Makurdi", status: "PENDING", paymentStatus: "AWAITING_VERIFICATION", paymentReference: "GTB-882100377" },
      { reference: "MOAUM-PR-2026-6CN7D", programmeId: programme("entrepreneurship-small-business").id, userId: trader.id, phone: "08030000005", status: "COMPLETED", paymentStatus: "PAID", paymentReference: "UBA-0099213" },
    ],
  });

  await prisma.contactMessage.createMany({
    data: [
      { name: "Dr. Mfa Ugah", email: "m.ugah@example.com", category: "Training Workshop", subject: "Staff training on research data management", message: "Our department would like to arrange a two-day workshop for about 25 academic staff on research data management. Kindly advise on availability in November and the cost implications." },
      { name: "Aondona Tyav", email: "aondona@example.com", phone: "08061234567", category: "Facility Booking", subject: "Booking the ICT Centre lab for a hackathon", message: "We are a student tech community planning a 48-hour hackathon. Is it possible to book the ICT Centre lab for a weekend, and what are the requirements?" },
    ],
  });

  console.log(`✔ ${createdShops.length} shops, ${createdProgrammes.length} programmes, 5 users seeded.`);
  console.log(`  Demo password for all accounts: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

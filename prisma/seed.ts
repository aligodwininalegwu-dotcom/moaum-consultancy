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

const prisma = new PrismaClient();
const DEMO_PASSWORD = "Password123";

type ShopSeed = {
  code: string;
  campus: "WESTERN" | "EASTERN";
  block: string;
  location: string;
  category: string;
  sizeSqm: number;
  annualRent: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
  features: string[];
  description: string;
};

const shops: ShopSeed[] = [
  // ── Western Campus ──────────────────────────────────────────────
  { code: "WC-A01", campus: "WESTERN", block: "Block A", location: "Students' Centre Complex, ground floor", category: "Business Centre", sizeSqm: 18, annualRent: 350000, status: "AVAILABLE", features: ["Electricity (prepaid meter)", "Water", "Burglary-proof", "Internet-ready"], description: "Corner unit facing the main walkway; suited to printing, photocopying and computer services." },
  { code: "WC-A02", campus: "WESTERN", block: "Block A", location: "Students' Centre Complex, ground floor", category: "Retail", sizeSqm: 15, annualRent: 300000, status: "OCCUPIED", features: ["Electricity (prepaid meter)", "Burglary-proof", "Display window"], description: "Retail unit currently leased for stationery and student supplies." },
  { code: "WC-A03", campus: "WESTERN", block: "Block A", location: "Students' Centre Complex, first floor", category: "Services", sizeSqm: 20, annualRent: 320000, status: "AVAILABLE", features: ["Electricity (prepaid meter)", "Water", "Air-conditioning point"], description: "Spacious unit appropriate for salons, tailoring or phone/laptop repairs." },
  { code: "WC-B01", campus: "WESTERN", block: "Block B", location: "Faculty of Science axis", category: "Food & Catering", sizeSqm: 32, annualRent: 550000, status: "AVAILABLE", features: ["Electricity (prepaid meter)", "Water", "Kitchen extraction", "Seating area"], description: "Restaurant-ready space with kitchen fittings and an outdoor seating area of about 12 m²." },
  { code: "WC-B02", campus: "WESTERN", block: "Block B", location: "Faculty of Science axis", category: "Food & Catering", sizeSqm: 24, annualRent: 450000, status: "RESERVED", features: ["Electricity (prepaid meter)", "Water", "Kitchen extraction"], description: "Reserved pending completion of a successful applicant's documentation." },
  { code: "WC-B03", campus: "WESTERN", block: "Block B", location: "Faculty of Science axis", category: "Retail", sizeSqm: 14, annualRent: 280000, status: "OCCUPIED", features: ["Electricity (prepaid meter)", "Burglary-proof"], description: "Provisions and convenience store." },
  { code: "WC-K01", campus: "WESTERN", block: "Kiosk Row", location: "Hostel Road kiosk line", category: "Kiosk", sizeSqm: 6, annualRent: 120000, status: "AVAILABLE", features: ["Electricity point", "Lockable shutter"], description: "Compact kiosk for recharge cards, snacks or small-scale vending." },
  { code: "WC-K02", campus: "WESTERN", block: "Kiosk Row", location: "Hostel Road kiosk line", category: "Kiosk", sizeSqm: 6, annualRent: 120000, status: "MAINTENANCE", features: ["Electricity point", "Lockable shutter"], description: "Undergoing roof repairs; expected back on the list next quarter." },
  { code: "WC-K03", campus: "WESTERN", block: "Kiosk Row", location: "Hostel Road kiosk line", category: "Kiosk", sizeSqm: 6, annualRent: 120000, status: "AVAILABLE", features: ["Electricity point", "Lockable shutter"], description: "Compact kiosk close to the female hostels." },
  // ── Eastern Campus ──────────────────────────────────────────────
  { code: "EC-A01", campus: "EASTERN", block: "Block A", location: "Eastern Campus Shopping Arcade", category: "Business Centre", sizeSqm: 20, annualRent: 380000, status: "AVAILABLE", features: ["Electricity (prepaid meter)", "Water", "Internet-ready", "Burglary-proof"], description: "Prime arcade unit beside the main lecture theatre; ideal for a cyber café or business centre." },
  { code: "EC-A02", campus: "EASTERN", block: "Block A", location: "Eastern Campus Shopping Arcade", category: "Retail", sizeSqm: 16, annualRent: 320000, status: "OCCUPIED", features: ["Electricity (prepaid meter)", "Display window"], description: "Currently leased as a bookshop." },
  { code: "EC-A03", campus: "EASTERN", block: "Block A", location: "Eastern Campus Shopping Arcade", category: "Services", sizeSqm: 18, annualRent: 300000, status: "AVAILABLE", features: ["Electricity (prepaid meter)", "Water"], description: "Suited to barbing, laundry pick-up or a photography studio." },
  { code: "EC-B01", campus: "EASTERN", block: "Block B", location: "College of Health Sciences axis", category: "Food & Catering", sizeSqm: 36, annualRent: 600000, status: "AVAILABLE", features: ["Electricity (prepaid meter)", "Water", "Kitchen extraction", "Seating area", "Waste bay"], description: "Largest catering unit on the Eastern Campus with covered outdoor seating." },
  { code: "EC-B02", campus: "EASTERN", block: "Block B", location: "College of Health Sciences axis", category: "Retail", sizeSqm: 14, annualRent: 280000, status: "AVAILABLE", features: ["Electricity (prepaid meter)", "Burglary-proof"], description: "Suited to a pharmacy-adjacent retail outlet, provisions or toiletries." },
  { code: "EC-B03", campus: "EASTERN", block: "Block B", location: "College of Health Sciences axis", category: "Services", sizeSqm: 16, annualRent: 290000, status: "RESERVED", features: ["Electricity (prepaid meter)", "Water"], description: "Reserved for a returning tenant pending renewal." },
  { code: "EC-K01", campus: "EASTERN", block: "Kiosk Row", location: "Main gate kiosk line", category: "Kiosk", sizeSqm: 6, annualRent: 130000, status: "AVAILABLE", features: ["Electricity point", "Lockable shutter"], description: "High-footfall kiosk at the main gate." },
  { code: "EC-K02", campus: "EASTERN", block: "Kiosk Row", location: "Main gate kiosk line", category: "Kiosk", sizeSqm: 6, annualRent: 130000, status: "OCCUPIED", features: ["Electricity point", "Lockable shutter"], description: "Leased for POS and mobile money services." },
];

type ProgrammeSeed = {
  slug: string;
  title: string;
  category: "ELEARNING" | "SUMMER";
  summary: string;
  description: string;
  duration: string;
  mode: string;
  level: string;
  fee: number;
  seats: number;
  startDate: string;
  modules: string[];
  icon: string;
  featured?: boolean;
};

const programmes: ProgrammeSeed[] = [
  // ── Summer Computer Programmes ──────────────────────────────────
  {
    slug: "website-design-development",
    title: "Website Design & Development",
    category: "SUMMER",
    summary: "Build and publish responsive websites with HTML, CSS, JavaScript and a modern framework.",
    description: "A hands-on summer programme that takes participants from first principles to a published portfolio website. Sessions combine short lectures with supervised lab work in the University ICT Centre, and every participant completes a capstone project reviewed by the facilitators.",
    duration: "6 weeks",
    mode: "On-campus",
    level: "Beginner to Intermediate",
    fee: 45000,
    seats: 40,
    startDate: "2027-07-06",
    modules: ["Foundations of the web and HTML5", "Styling and layout with CSS & Flexbox/Grid", "Responsive design and accessibility", "JavaScript essentials", "Introduction to React", "Hosting, domains and deployment", "Capstone portfolio project"],
    icon: "Code2",
    featured: true,
  },
  {
    slug: "microsoft-office-proficiency",
    title: "Microsoft Office Proficiency",
    category: "SUMMER",
    summary: "Practical mastery of Word, Excel, PowerPoint and Outlook for academic and office work.",
    description: "Designed for students, administrative staff and members of the public who want confident, productive use of the Microsoft Office suite. Emphasis is placed on real tasks: formatting a project report, analysing data in Excel, and presenting with clarity.",
    duration: "4 weeks",
    mode: "On-campus",
    level: "Beginner",
    fee: 25000,
    seats: 60,
    startDate: "2027-07-06",
    modules: ["Word: long documents, styles, references and mail merge", "Excel: formulas, charts, PivotTables and data validation", "PowerPoint: presentation design and delivery", "Outlook and productivity workflows", "Practical assessment"],
    icon: "FileSpreadsheet",
    featured: true,
  },
  {
    slug: "graphic-design-essentials",
    title: "Graphic Design Essentials",
    category: "SUMMER",
    summary: "Design flyers, social media graphics and brand assets with industry tools.",
    description: "An introduction to visual communication covering colour, typography and layout, with practical work in Canva, Adobe Photoshop and Illustrator (or open-source equivalents).",
    duration: "5 weeks",
    mode: "On-campus",
    level: "Beginner",
    fee: 35000,
    seats: 35,
    startDate: "2027-07-13",
    modules: ["Principles of design", "Typography and colour theory", "Photo editing basics", "Vector illustration and logos", "Social media and print design", "Portfolio review"],
    icon: "Palette",
  },
  {
    slug: "data-analysis-excel-python",
    title: "Data Analysis with Excel & Python",
    category: "SUMMER",
    summary: "Clean, analyse and visualise data for research projects and business decisions.",
    description: "Ideal for final-year students and researchers. Participants learn to move from raw survey or business data to clear charts and defensible conclusions, starting in Excel and progressing to Python with pandas.",
    duration: "6 weeks",
    mode: "Hybrid",
    level: "Intermediate",
    fee: 50000,
    seats: 30,
    startDate: "2027-07-13",
    modules: ["Data cleaning in Excel", "Descriptive statistics", "Python fundamentals", "pandas for data wrangling", "Visualisation with matplotlib", "Mini research project"],
    icon: "BarChart3",
  },
  {
    slug: "computer-hardware-networking",
    title: "Computer Hardware & Networking",
    category: "SUMMER",
    summary: "Assemble, maintain and troubleshoot computers and small office networks.",
    description: "A practical, workshop-based course covering PC components, operating system installation, troubleshooting and the basics of setting up wired and wireless networks.",
    duration: "4 weeks",
    mode: "On-campus",
    level: "Beginner",
    fee: 30000,
    seats: 25,
    startDate: "2027-07-20",
    modules: ["PC components and assembly", "OS installation and drivers", "Troubleshooting and maintenance", "Networking fundamentals", "Router and Wi-Fi configuration"],
    icon: "Cpu",
  },
  // ── E-Learning ──────────────────────────────────────────────────
  {
    slug: "digital-literacy-online",
    title: "Digital Literacy & Online Learning Skills",
    category: "ELEARNING",
    summary: "Essential computer, internet and online-research skills for the modern learner.",
    description: "A self-paced online course with weekly live sessions. Participants learn to use learning management systems, conduct credible online research, manage files in the cloud and stay safe online.",
    duration: "4 weeks",
    mode: "Online",
    level: "Beginner",
    fee: 15000,
    seats: 200,
    startDate: "2027-02-02",
    modules: ["Computer and file management basics", "Using the University LMS", "Online research and referencing", "Cloud collaboration tools", "Cyber safety and digital wellbeing"],
    icon: "MonitorSmartphone",
    featured: true,
  },
  {
    slug: "entrepreneurship-small-business",
    title: "Entrepreneurship & Small Business Management",
    category: "ELEARNING",
    summary: "Plan, register and grow a small business, with templates you can use immediately.",
    description: "Delivered online by faculty and practising entrepreneurs. Covers opportunity identification, business planning, CAC registration, bookkeeping and digital marketing. Recommended for prospective shop allocation applicants.",
    duration: "8 weeks",
    mode: "Online",
    level: "All levels",
    fee: 20000,
    seats: 150,
    startDate: "2027-02-09",
    modules: ["Identifying viable opportunities", "Writing a business plan", "Business registration in Nigeria", "Bookkeeping and cash flow", "Pricing and customer service", "Digital marketing on a budget"],
    icon: "Briefcase",
  },
  {
    slug: "research-methods-spss",
    title: "Research Methods & SPSS",
    category: "ELEARNING",
    summary: "Design sound studies and analyse results with SPSS for theses and publications.",
    description: "A structured online course for postgraduate students and early-career researchers, with recorded lectures, guided SPSS exercises and a live clinic each fortnight.",
    duration: "6 weeks",
    mode: "Online",
    level: "Intermediate",
    fee: 30000,
    seats: 100,
    startDate: "2027-03-02",
    modules: ["Research design and sampling", "Questionnaire development", "Data entry and coding in SPSS", "Descriptive and inferential statistics", "Reporting results in APA style"],
    icon: "FlaskConical",
  },
  {
    slug: "python-programming-online",
    title: "Introduction to Python Programming",
    category: "ELEARNING",
    summary: "Learn to code from scratch with Python through short lessons and auto-graded exercises.",
    description: "A beginner-friendly online course that builds problem-solving confidence through daily bite-sized lessons, weekly projects and mentor support.",
    duration: "8 weeks",
    mode: "Online",
    level: "Beginner",
    fee: 25000,
    seats: 150,
    startDate: "2027-02-16",
    modules: ["Variables, types and control flow", "Functions and modules", "Working with files", "Lists, dictionaries and data handling", "Intro to object-oriented programming", "Final project"],
    icon: "Terminal",
  },
];

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

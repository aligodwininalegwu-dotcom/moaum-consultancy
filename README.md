# MOAUM Consultancy

Web portal for the **Consultancy Unit of Rev. Fr. Moses Orshio Adasu University, Makurdi** (formerly Benue State University).

*Scientia Liberatio Populorum: Knowledge for the Liberation of the People.*

The portal handles:

- **Shop allocation** on the Western and Eastern Campuses: browse live availability, apply online with ID and business proposal uploads, track status, and download a PDF allocation letter.
- **Programme registration** for E-Learning courses and Summer Computer Programmes (Website Design, Microsoft Office Proficiency, Graphic Design, Data Analysis, Hardware & Networking), with bank-transfer payment and PDF admission letters.
- **Other consultancy services** (career guidance, training workshops, facility booking, research advisory) through categorised enquiries.
- **Student dashboard** and an **admin console** for staff and administrators.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 3, shadcn/ui-style components on Radix UI, Lucide icons |
| Motion | Framer Motion (scroll reveals, staggered cards, parallax hero, counters), plus CSS entrance animations so content shows before JS loads |
| Forms | React Hook Form + Zod (the same schemas validate on the server) |
| Data | Prisma ORM, SQLite locally (PostgreSQL-ready) |
| Auth | NextAuth.js (credentials, JWT sessions) with roles |
| Other | Sonner toasts, next-themes dark/light mode, pdf-lib for letters |

## Getting started

Requirements: **Node.js 20+** and npm.

```bash
npm install
cp .env.example .env        # then set NEXTAUTH_SECRET (command is in the file)
npm run setup               # creates the SQLite database and loads seed data
npm run dev                 # http://localhost:3000
```

> **npm 11 note:** npm 11 blocks dependency install scripts until approved. This project's `package.json` already approves the four that are needed (Prisma's engines and esbuild for `tsx`). If you see an `allow-scripts` warning, run `npm approve-scripts --allow-scripts-pending` to review it.

### Demo accounts

All seeded accounts use the password **`Password123`**.

| Email | Role | What to try |
| --- | --- | --- |
| `admin@moaum.edu.ng` | Admin | Everything, including user management |
| `staff@moaum.edu.ng` | Staff | Review applications, verify payments, manage shops |
| `student@moaum.edu.ng` | Student | Dashboard with a pending shop application and two registrations |
| `ojonugwa@example.com`, `trader@example.com` | Student | Allocated / rejected / completed sample records |

Sample tracking references: `MOAUM-SA-2026-7KD2Q` (shop) and `MOAUM-PR-2026-5WQ3A` (programme).

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` | TypeScript check |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:seed` | Reload seed data (clears existing records) |
| `npm run db:reset` | Drop everything, recreate and reseed |

## Roles and access

| Role | Access |
| --- | --- |
| Public | All marketing pages, shop availability, programme listings, public status tracking by reference, contact form |
| Student | The above, plus applying for shops, registering for programmes, a personal dashboard, payment references and PDF letters |
| Staff | The above, plus the admin console: review/allocate applications, manage the shops register, verify payments, messages, CSV reports |
| Admin | Everything, plus user management (roles, activate/deactivate) |

Enforcement is layered: `src/middleware.ts` requires a session for `/dashboard` and `/admin`; layouts check roles (`requireUser` / `requireConsole` in `src/lib/auth.ts`); and every server action and API route re-checks the session and ownership. Uploaded documents are stored outside `/public` and are only served to their owner or to staff/admins.

## Project structure

```
prisma/
  schema.prisma          Data model (User, Shop, ShopApplication, Programme, Registration, ContactMessage)
  seed.ts                17 shops, 9 programmes, 5 users, sample applications/registrations/messages
src/
  app/
    (site)/              Public pages: home, services, shops, programmes, about, contact, login, register
    dashboard/           Student dashboard (overview, applications, registrations, profile)
    admin/               Admin console (overview, shop applications, shops, registrations, messages, users)
    api/                 NextAuth, document downloads, PDF letters, CSV export
  components/
    ui/                  Button, inputs, dialog, tabs, dropdown, accordion, table, badge, skeleton
    layout/ home/ shops/ programmes/ dashboard/ admin/ forms/ motion/
  data/site.ts           Static content: contact details, testimonials, guidelines, FAQs, leadership
  lib/                   Prisma client, auth, Zod schemas, constants, utilities
  server/                Server actions, admin actions, upload storage, PDF letter builder, queries
uploads/                 Application documents (git-ignored)
```

## Workflows

**Shop allocation.** An applicant applies (one active application per campus) and gets a reference like `MOAUM-SA-2026-4F7K2`. Staff then move it through *Pending → Under Review → Approved → Allocated* (or *Rejected*) and add a note the applicant can see. Allocating marks the shop *Occupied*; changing or reversing an allocation frees the previous shop. Once allocated, the applicant can download the allocation letter.

**Programme registration.** A participant registers (seat limits are enforced) and gets a reference like `MOAUM-PR-2026-8H2LQ`. They pay by bank transfer and submit the transaction reference. Staff then use *Verify payment & confirm*, which unlocks the admission letter.

## Email notifications

Emails go out when:
- a shop application is submitted, and whenever its status or committee note changes (allocation emails link to the letter);
- a programme registration is received, confirmed, rejected or its payment is verified;
- someone uses the contact form (an acknowledgement to them, plus the enquiry to `MAIL_UNIT_INBOX`, with reply-to set to the sender).

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` and `MAIL_FROM` in `.env`. Any SMTP provider works, for example Gmail with an app password, Zoho Mail or Resend. **Without `SMTP_HOST` nothing is sent:** each email is logged as `[mail:dev] To: … | Subject: …` in the server output. A failed send is logged and never blocks the action that triggered it.

## Online payments (Paystack)

1. Create a Paystack account and copy the **test** secret key (`sk_test_…`) into `PAYSTACK_SECRET_KEY`.
2. Restart the server. Registrations awaiting payment now show **Pay ₦… online** on the participant's dashboard.
3. In Paystack → Settings → API Keys & Webhooks, set the webhook URL to `https://<your-domain>/api/payments/paystack/webhook`.

How it works: the checkout goes to Paystack's hosted page. Paystack redirects back to `/api/payments/paystack/callback`, which **re-verifies the transaction with Paystack's API** before marking the registration *Paid / Confirmed* and emailing the participant. The webhook does the same if the payer closes the browser early, and it rejects requests without a valid `x-paystack-signature`. The amount and currency are checked against the programme fee on record, and processing the same payment twice is harmless. Bank transfer with manual verification remains available. Switch to the live key (`sk_live_…`) only after testing.

## Before going live

- **Replace placeholder content** in `src/data/site.ts` (phone numbers, emails, leadership names, testimonials) and the bank details in `src/lib/constants.ts` (`BANK_DETAILS`; the account number is a dummy `0000000000`).
- **Use PostgreSQL**: change `provider` in `prisma/schema.prisma` to `postgresql`, set `DATABASE_URL`, and run `npm run db:push`.
- **File storage:** uploads go to `UPLOAD_DIR` on local disk. On serverless hosting, swap `src/server/uploads.ts` for S3/Cloudinary/etc.
- **Turn on email and Paystack** by filling in the `SMTP_*` and `PAYSTACK_SECRET_KEY` settings (see below).
- Set a strong `NEXTAUTH_SECRET` and the real `NEXTAUTH_URL`.

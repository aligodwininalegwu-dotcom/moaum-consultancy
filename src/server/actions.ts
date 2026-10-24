"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { makeReference } from "@/lib/utils";
import {
  contactSchema,
  paymentProofSchema,
  registrationSchema,
  shopApplicationSchema,
  signupSchema,
  trackSchema,
  type ContactInput,
  type RegistrationInput,
  type SignupInput,
} from "@/lib/validations";
import { saveUpload, validateUpload } from "@/server/uploads";

export type ActionResult<T = undefined> =
  | { ok: true; message: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

/* ── Accounts ─────────────────────────────────────────────────────── */

export async function signupAction(input: SignupInput): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };

  const { name, email, phone, matricNo, department, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return { ok: false, error: "An account with this email already exists.", fieldErrors: { email: ["Email already registered"] } };

  await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      phone,
      matricNo: matricNo || null,
      department: department || null,
      passwordHash: await bcrypt.hash(password, 10),
      role: "STUDENT",
    },
  });
  return { ok: true, message: "Account created. You can now sign in." };
}

export async function updateProfileAction(input: { name: string; phone: string; matricNo?: string; department?: string }): Promise<ActionResult> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: "Please sign in again." };
  const name = input.name?.trim();
  if (!name || name.length < 3) return { ok: false, error: "Enter your full name." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: input.phone?.trim() || null,
      matricNo: input.matricNo?.trim() || null,
      department: input.department?.trim() || null,
    },
  });
  revalidatePath("/dashboard");
  return { ok: true, message: "Profile updated." };
}

/* ── Contact ──────────────────────────────────────────────────────── */

export async function contactAction(input: ContactInput): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  await prisma.contactMessage.create({ data: { ...parsed.data, phone: parsed.data.phone || null } });
  return { ok: true, message: "Thank you. Your message has been received and a member of the Unit will respond within two working days." };
}

/* ── Shop applications ────────────────────────────────────────────── */

export async function submitShopApplication(formData: FormData): Promise<ActionResult<{ reference: string }>> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: "Please sign in to apply for a shop." };

  const parsed = shopApplicationSchema.safeParse({
    campus: formData.get("campus"),
    preferredShopId: formData.get("preferredShopId") ?? "",
    businessName: formData.get("businessName"),
    businessType: formData.get("businessType"),
    phone: formData.get("phone"),
    yearsExperience: formData.get("yearsExperience"),
    description: formData.get("description"),
    agree: formData.get("agree") === "true",
  });
  if (!parsed.success) return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };

  const idDocument = formData.get("idDocument");
  const proposalDocument = formData.get("proposalDocument");
  const fileError = validateUpload(idDocument, "Means of identification") ?? validateUpload(proposalDocument, "Business proposal");
  if (fileError) return { ok: false, error: fileError };

  const data = parsed.data;

  const active = await prisma.shopApplication.findFirst({
    where: { applicantId: session.user.id, campus: data.campus, status: { in: ["PENDING", "UNDER_REVIEW", "APPROVED"] } },
  });
  if (active) {
    return { ok: false, error: `You already have an active application (${active.reference}) for this campus.` };
  }

  if (data.preferredShopId) {
    const shop = await prisma.shop.findUnique({ where: { id: data.preferredShopId } });
    if (!shop || shop.campus !== data.campus || shop.status !== "AVAILABLE") {
      return { ok: false, error: "The selected shop is no longer available. Please choose another." };
    }
  }

  const reference = makeReference("SA");
  const [idPath, proposalPath] = await Promise.all([
    saveUpload(idDocument as File, `${reference}-id`),
    saveUpload(proposalDocument as File, `${reference}-proposal`),
  ]);

  await prisma.shopApplication.create({
    data: {
      reference,
      campus: data.campus,
      businessName: data.businessName,
      businessType: data.businessType,
      description: data.description,
      yearsExperience: data.yearsExperience,
      phone: data.phone,
      idDocument: idPath,
      proposalDocument: proposalPath,
      applicantId: session.user.id,
      preferredShopId: data.preferredShopId || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin/shop-applications");
  return { ok: true, message: "Application submitted successfully.", data: { reference } };
}

/* ── Programme registration ───────────────────────────────────────── */

export async function registerForProgramme(input: RegistrationInput): Promise<ActionResult<{ reference: string }>> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: "Please sign in to register." };

  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };

  const programme = await prisma.programme.findUnique({
    where: { id: parsed.data.programmeId },
    include: { _count: { select: { registrations: { where: { status: { not: "REJECTED" } } } } } },
  });
  if (!programme || !programme.active) return { ok: false, error: "This programme is not open for registration." };
  if (programme._count.registrations >= programme.seats) return { ok: false, error: "This programme is fully booked." };

  const existing = await prisma.registration.findUnique({
    where: { userId_programmeId: { userId: session.user.id, programmeId: programme.id } },
  });
  if (existing) return { ok: false, error: `You are already registered for this programme (${existing.reference}).` };

  const reference = makeReference("PR");
  await prisma.registration.create({
    data: {
      reference,
      userId: session.user.id,
      programmeId: programme.id,
      phone: parsed.data.phone,
      institution: parsed.data.institution || null,
      motivation: parsed.data.motivation || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/programmes/${programme.slug}`);
  return { ok: true, message: "Registration received.", data: { reference } };
}

export async function submitPaymentReference(input: { registrationId: string; paymentReference: string }): Promise<ActionResult> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: "Please sign in again." };

  const parsed = paymentProofSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid reference" };

  const reg = await prisma.registration.findUnique({ where: { id: parsed.data.registrationId } });
  if (!reg || reg.userId !== session.user.id) return { ok: false, error: "Registration not found." };
  if (reg.paymentStatus === "PAID") return { ok: false, error: "Payment for this registration is already confirmed." };

  await prisma.registration.update({
    where: { id: reg.id },
    data: { paymentReference: parsed.data.paymentReference, paymentStatus: "AWAITING_VERIFICATION" },
  });
  revalidatePath("/dashboard");
  return { ok: true, message: "Payment reference submitted for verification." };
}

/* ── Public tracking ──────────────────────────────────────────────── */

export type TrackResult = {
  type: "shop" | "programme";
  reference: string;
  title: string;
  subtitle: string;
  status: string;
  paymentStatus?: string;
  note?: string | null;
  submittedAt: string;
  updatedAt: string;
};

export async function trackReferenceAction(reference: string): Promise<ActionResult<TrackResult>> {
  const parsed = trackSchema.safeParse({ reference });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid reference" };
  const ref = parsed.data.reference;

  if (ref.includes("-SA-")) {
    const app = await prisma.shopApplication.findUnique({ where: { reference: ref }, include: { allocatedShop: true } });
    if (!app) return { ok: false, error: "No application found with that reference." };
    return {
      ok: true,
      message: "Found",
      data: {
        type: "shop",
        reference: app.reference,
        title: app.businessName,
        subtitle: `${app.campus === "WESTERN" ? "Western" : "Eastern"} Campus${app.allocatedShop ? ` · Shop ${app.allocatedShop.code}` : ""}`,
        status: app.status,
        note: app.adminNote,
        submittedAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      },
    };
  }

  const reg = await prisma.registration.findUnique({ where: { reference: ref }, include: { programme: true } });
  if (!reg) return { ok: false, error: "No registration found with that reference." };
  return {
    ok: true,
    message: "Found",
    data: {
      type: "programme",
      reference: reg.reference,
      title: reg.programme.title,
      subtitle: reg.programme.duration + " · " + reg.programme.mode,
      status: reg.status,
      paymentStatus: reg.paymentStatus,
      note: reg.adminNote,
      submittedAt: reg.createdAt.toISOString(),
      updatedAt: reg.updatedAt.toISOString(),
    },
  };
}

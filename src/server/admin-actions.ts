"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  CAMPUSES,
  CONSOLE_ROLES,
  PAYMENT_STATUSES,
  REG_STATUSES,
  ROLES,
  SHOP_APP_STATUSES,
  SHOP_CATEGORIES,
  SHOP_STATUSES,
  type Role,
} from "@/lib/constants";
import type { ActionResult } from "@/server/actions";
import { mail } from "@/server/mail";

async function guard(roles: Role[] = CONSOLE_ROLES) {
  const session = await getSession();
  if (!session?.user || !roles.includes(session.user.role)) return null;
  return session.user;
}

function refresh() {
  for (const p of ["/admin", "/admin/shop-applications", "/admin/shops", "/admin/registrations", "/dashboard", "/shops"]) revalidatePath(p);
}

/* ── Shop applications ────────────────────────────────────────────── */

const reviewSchema = z.object({
  id: z.string().min(1),
  status: z.enum(SHOP_APP_STATUSES),
  allocatedShopId: z.string().optional(),
  adminNote: z.string().trim().max(1000).optional(),
});

export async function reviewShopApplication(input: z.infer<typeof reviewSchema>): Promise<ActionResult> {
  const user = await guard();
  if (!user) return { ok: false, error: "You are not authorised to do this." };
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid review data." };
  const { id, status, allocatedShopId, adminNote } = parsed.data;

  const app = await prisma.shopApplication.findUnique({ where: { id }, include: { applicant: { select: { name: true, email: true } } } });
  if (!app) return { ok: false, error: "Application not found." };
  let shopCode: string | undefined;

  if (status === "ALLOCATED") {
    if (!allocatedShopId) return { ok: false, error: "Choose a shop to allocate." };
    const shop = await prisma.shop.findUnique({ where: { id: allocatedShopId } });
    if (!shop || shop.campus !== app.campus) return { ok: false, error: "Choose a shop on the applicant's campus." };
    const freeOrSame = shop.status === "AVAILABLE" || shop.status === "RESERVED" || app.allocatedShopId === shop.id;
    if (!freeOrSame) return { ok: false, error: `Shop ${shop.code} is ${shop.status.toLowerCase()}.` };
    shopCode = shop.code;

    await prisma.$transaction([
      // Release a previously allocated shop if the allocation is being changed.
      ...(app.allocatedShopId && app.allocatedShopId !== shop.id
        ? [prisma.shop.update({ where: { id: app.allocatedShopId }, data: { status: "AVAILABLE" } })]
        : []),
      prisma.shop.update({ where: { id: shop.id }, data: { status: "OCCUPIED" } }),
      prisma.shopApplication.update({
        where: { id },
        data: { status, allocatedShopId: shop.id, adminNote: adminNote || null, reviewedById: user.id },
      }),
    ]);
  } else {
    await prisma.$transaction([
      ...(app.allocatedShopId ? [prisma.shop.update({ where: { id: app.allocatedShopId }, data: { status: "AVAILABLE" } })] : []),
      prisma.shopApplication.update({
        where: { id },
        data: { status, allocatedShopId: null, adminNote: adminNote || null, reviewedById: user.id },
      }),
    ]);
  }

  refresh();
  // Tell the applicant only when something they can see actually changed.
  const changed = status !== app.status || (adminNote || null) !== app.adminNote || (status === "ALLOCATED" && allocatedShopId !== app.allocatedShopId);
  if (changed) {
    await mail.shopApplicationUpdated(app.applicant.email, app.applicant.name, {
      reference: app.reference,
      businessName: app.businessName,
      status,
      note: adminNote,
      shopCode,
    });
  }
  return { ok: true, message: `Application ${app.reference} updated.` };
}

/* ── Shops ────────────────────────────────────────────────────────── */

const shopSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().toUpperCase().regex(/^(WC|EC)-[A-Z]\d{2}$/, "Use a code like WC-A04 or EC-B05"),
  campus: z.enum(CAMPUSES),
  block: z.string().trim().min(2),
  location: z.string().trim().min(3),
  category: z.enum(SHOP_CATEGORIES),
  sizeSqm: z.coerce.number().positive().max(500),
  annualRent: z.coerce.number().int().min(10000),
  status: z.enum(SHOP_STATUSES),
  features: z.string().trim().default(""),
  description: z.string().trim().default(""),
});
export type ShopInput = z.input<typeof shopSchema>;

export async function saveShop(input: ShopInput): Promise<ActionResult> {
  if (!(await guard())) return { ok: false, error: "You are not authorised to do this." };
  const parsed = shopSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid shop data." };
  const { id, ...data } = parsed.data;
  const features = data.features.split(",").map((f) => f.trim()).filter(Boolean).join(",");

  const clash = await prisma.shop.findUnique({ where: { code: data.code } });
  if (clash && clash.id !== id) return { ok: false, error: `Shop code ${data.code} already exists.` };

  if (id) await prisma.shop.update({ where: { id }, data: { ...data, features } });
  else await prisma.shop.create({ data: { ...data, features } });
  refresh();
  return { ok: true, message: id ? `Shop ${data.code} updated.` : `Shop ${data.code} added.` };
}

export async function setShopStatus(id: string, status: string): Promise<ActionResult> {
  if (!(await guard())) return { ok: false, error: "You are not authorised to do this." };
  if (!SHOP_STATUSES.includes(status as never)) return { ok: false, error: "Invalid status." };
  await prisma.shop.update({ where: { id }, data: { status } });
  refresh();
  return { ok: true, message: "Shop status updated." };
}

/* ── Registrations ────────────────────────────────────────────────── */

const regSchema = z.object({
  id: z.string().min(1),
  status: z.enum(REG_STATUSES),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  adminNote: z.string().trim().max(1000).optional(),
});

export async function updateRegistration(input: z.infer<typeof regSchema>): Promise<ActionResult> {
  if (!(await guard())) return { ok: false, error: "You are not authorised to do this." };
  const parsed = regSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid data." };
  const { id, ...data } = parsed.data;
  const before = await prisma.registration.findUnique({ where: { id } });
  if (!before) return { ok: false, error: "Registration not found." };
  const reg = await prisma.registration.update({
    where: { id },
    data: { ...data, adminNote: data.adminNote || null },
    include: { user: { select: { name: true, email: true } }, programme: { select: { title: true } } },
  });
  refresh();
  if (before.status !== reg.status || before.paymentStatus !== reg.paymentStatus || before.adminNote !== reg.adminNote) {
    await mail.registrationUpdated(reg.user.email, reg.user.name, {
      reference: reg.reference,
      programme: reg.programme.title,
      status: reg.status,
      paymentStatus: reg.paymentStatus,
      note: reg.adminNote,
    });
  }
  return { ok: true, message: `Registration ${reg.reference} updated.` };
}

/* ── Users (admins only) ──────────────────────────────────────────── */

export async function updateUser(input: { id: string; role: string; active: boolean }): Promise<ActionResult> {
  const admin = await guard(["ADMIN"]);
  if (!admin) return { ok: false, error: "Only administrators can manage users." };
  if (!ROLES.includes(input.role as Role)) return { ok: false, error: "Invalid role." };
  if (input.id === admin.id && (input.role !== "ADMIN" || !input.active)) {
    return { ok: false, error: "You cannot remove your own administrator access." };
  }
  await prisma.user.update({ where: { id: input.id }, data: { role: input.role, active: input.active } });
  revalidatePath("/admin/users");
  return { ok: true, message: "User updated." };
}

/* ── Messages ─────────────────────────────────────────────────────── */

export async function markMessageRead(id: string, read: boolean): Promise<ActionResult> {
  if (!(await guard())) return { ok: false, error: "You are not authorised to do this." };
  await prisma.contactMessage.update({ where: { id }, data: { read } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true, message: read ? "Marked as read." : "Marked as unread." };
}

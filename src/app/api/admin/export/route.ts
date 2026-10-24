import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CONSOLE_ROLES } from "@/lib/constants";

function toCsv(rows: (string | number | null | undefined)[][]) {
  return rows
    .map((r) => r.map((v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(","))
    .join("\r\n");
}

/** CSV reports for staff/admins: ?type=shop-applications | registrations */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user || !CONSOLE_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const type = req.nextUrl.searchParams.get("type");
  let csv: string;

  if (type === "shop-applications") {
    const apps = await prisma.shopApplication.findMany({ orderBy: { createdAt: "desc" }, include: { applicant: true, allocatedShop: true, preferredShop: true } });
    csv = toCsv([
      ["Reference", "Business", "Type", "Applicant", "Email", "Phone", "Campus", "Preferred shop", "Allocated shop", "Status", "Submitted"],
      ...apps.map((a) => [a.reference, a.businessName, a.businessType, a.applicant.name, a.applicant.email, a.phone, a.campus, a.preferredShop?.code, a.allocatedShop?.code, a.status, a.createdAt.toISOString().slice(0, 10)]),
    ]);
  } else if (type === "registrations") {
    const regs = await prisma.registration.findMany({ orderBy: { createdAt: "desc" }, include: { user: true, programme: true } });
    csv = toCsv([
      ["Reference", "Participant", "Email", "Phone", "Programme", "Fee", "Status", "Payment", "Payment ref", "Registered"],
      ...regs.map((r) => [r.reference, r.user.name, r.user.email, r.phone, r.programme.title, r.programme.fee, r.status, r.paymentStatus, r.paymentReference, r.createdAt.toISOString().slice(0, 10)]),
    ]);
  } else {
    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="moaum-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

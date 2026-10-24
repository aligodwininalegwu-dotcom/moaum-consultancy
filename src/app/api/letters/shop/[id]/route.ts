import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CAMPUS_LABEL, CONSOLE_ROLES, type Campus } from "@/lib/constants";
import { buildLetter, pdfResponse } from "@/server/letters";
import { formatNaira } from "@/lib/utils";
import { leadership } from "@/data/site";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const app = await prisma.shopApplication.findUnique({ where: { id }, include: { applicant: true, allocatedShop: true } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.applicantId !== session.user.id && !CONSOLE_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (app.status !== "ALLOCATED" || !app.allocatedShop) {
    return NextResponse.json({ error: "An allocation letter is only available once a shop has been allocated." }, { status: 400 });
  }

  const shop = app.allocatedShop;
  const caution = Math.round(shop.annualRent * 0.1);
  const bytes = await buildLetter({
    title: "Letter of Shop Allocation",
    reference: app.reference,
    date: app.updatedAt,
    recipient: { name: app.applicant.name, email: app.applicant.email, phone: app.phone },
    salutation: `Dear ${app.applicant.name},`,
    paragraphs: [
      `Following the review of your application in respect of "${app.businessName}", I am pleased to inform you that the Shop Allocation Committee of the Consultancy Unit has approved the allocation of a commercial space to you on the ${CAMPUS_LABEL[app.campus as Campus]}, subject to the terms below.`,
      "This allocation is personal to you and may not be transferred or sub-let. You are required to operate the approved business only, comply with University regulations, display regulated prices and maintain the premises in a clean and safe condition.",
    ],
    details: [
      ["Shop code", shop.code],
      ["Location", `${shop.block}, ${shop.location}`],
      ["Category", shop.category],
      ["Floor area", `${shop.sizeSqm} square metres`],
      ["Annual rent", formatNaira(shop.annualRent).replace("₦", "NGN ")],
      ["Caution deposit (10%)", formatNaira(caution).replace("₦", "NGN ")],
    ],
    closing:
      "Kindly present this letter at the Bursary within fourteen (14) days to make payment and sign the tenancy agreement. Keys will be released upon confirmation of payment. Failure to do so within the stated period may result in the allocation being withdrawn. Congratulations.",
    signatory: { name: leadership[0].name, role: `${leadership[0].role}` },
  });

  return pdfResponse(bytes, `allocation-letter-${app.reference}.pdf`);
}

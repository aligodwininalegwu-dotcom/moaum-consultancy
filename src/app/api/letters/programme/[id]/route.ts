import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CONSOLE_ROLES, PROGRAMME_CATEGORY_LABEL, type ProgrammeCategory } from "@/lib/constants";
import { buildLetter, pdfResponse } from "@/server/letters";
import { formatDate, formatNaira } from "@/lib/utils";
import { leadership } from "@/data/site";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reg = await prisma.registration.findUnique({ where: { id }, include: { user: true, programme: true } });
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (reg.userId !== session.user.id && !CONSOLE_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (reg.status !== "CONFIRMED" && reg.status !== "COMPLETED") {
    return NextResponse.json({ error: "An admission letter is only available once your registration is confirmed." }, { status: 400 });
  }

  const p = reg.programme;
  const bytes = await buildLetter({
    title: "Letter of Admission",
    reference: reg.reference,
    date: reg.updatedAt,
    recipient: { name: reg.user.name, email: reg.user.email, phone: reg.phone },
    salutation: `Dear ${reg.user.name},`,
    paragraphs: [
      `On behalf of the Consultancy Unit, I am pleased to offer you admission into the ${PROGRAMME_CATEGORY_LABEL[p.category as ProgrammeCategory]}: "${p.title}". Your registration has been confirmed${reg.paymentStatus === "PAID" ? " and your payment verified" : ""}.`,
      "Participants are expected to attend at least 75% of sessions and complete all assessments to qualify for the Certificate of Completion. Please arrive with this letter and a valid means of identification on the first day.",
    ],
    details: [
      ["Programme", p.title],
      ["Duration", p.duration],
      ["Mode of delivery", p.mode],
      ["Commencement", formatDate(p.startDate, { month: "long" })],
      ["Programme fee", formatNaira(p.fee).replace("₦", "NGN ")],
      ["Payment status", reg.paymentStatus === "PAID" ? "Paid" : "Pending verification"],
    ],
    closing: "We look forward to welcoming you and wish you a rewarding learning experience. Congratulations on your admission.",
    signatory: { name: leadership[1].name, role: leadership[1].role },
  });

  return pdfResponse(bytes, `admission-letter-${reg.reference}.pdf`);
}

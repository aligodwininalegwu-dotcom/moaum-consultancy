import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CONSOLE_ROLES } from "@/lib/constants";
import { readUpload } from "@/server/uploads";

/** Streams an application document to its owner or to staff/admins. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; kind: string }> }) {
  const { id, kind } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const app = await prisma.shopApplication.findUnique({ where: { id } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = app.applicantId === session.user.id || CONSOLE_ROLES.includes(session.user.role);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const name = kind === "id" ? app.idDocument : kind === "proposal" ? app.proposalDocument : null;
  const file = name ? await readUpload(name) : null;
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `inline; filename="${app.reference}-${kind}.${name!.split(".").pop()}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

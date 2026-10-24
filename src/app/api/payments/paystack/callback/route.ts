import { NextResponse, type NextRequest } from "next/server";
import { applyVerifiedPayment, paystackEnabled, verifyTransaction } from "@/server/paystack";
import { revalidatePath } from "next/cache";

/** Paystack redirects the payer here after checkout; we verify server-side. */
export async function GET(req: NextRequest) {
  const back = new URL("/dashboard/registrations", req.nextUrl.origin);
  const reference = req.nextUrl.searchParams.get("reference") ?? req.nextUrl.searchParams.get("trxref");
  if (!paystackEnabled() || !reference) {
    back.searchParams.set("payment", "failed");
    return NextResponse.redirect(back);
  }

  try {
    const result = await applyVerifiedPayment(await verifyTransaction(reference));
    back.searchParams.set("payment", result === "paid" || result === "already-paid" ? "success" : result === "mismatch" ? "review" : "failed");
  } catch (err) {
    console.error("[paystack] verification failed", err);
    back.searchParams.set("payment", "failed");
  }
  revalidatePath("/dashboard/registrations");
  revalidatePath("/admin/registrations");
  return NextResponse.redirect(back);
}

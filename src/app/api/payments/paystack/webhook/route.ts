import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { applyVerifiedPayment, isValidSignature, verifyTransaction } from "@/server/paystack";

/**
 * Paystack webhook (set the URL in Paystack Dashboard → Settings → API Keys &
 * Webhooks). Confirms payments even if the payer closes the browser before
 * the callback redirect.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!isValidSignature(raw, req.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as { event?: string; data?: { reference?: string } };
  if (event.event === "charge.success" && event.data?.reference) {
    try {
      // Re-verify with the API rather than trusting the payload alone.
      const result = await applyVerifiedPayment(await verifyTransaction(event.data.reference));
      if (result === "mismatch") console.warn(`[paystack] amount/currency mismatch for ${event.data.reference}`);
      revalidatePath("/dashboard/registrations");
      revalidatePath("/admin/registrations");
    } catch (err) {
      console.error("[paystack] webhook processing failed", err);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 }); // Paystack retries
    }
  }
  return NextResponse.json({ received: true });
}

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { mail } from "@/server/mail";

/**
 * Paystack card/bank/USSD payments for programme fees.
 * Enabled only when PAYSTACK_SECRET_KEY is set (use sk_test_… keys first);
 * otherwise the portal falls back to bank transfer + manual verification.
 */

const API = "https://api.paystack.co";
const secret = () => process.env.PAYSTACK_SECRET_KEY ?? "";

export const paystackEnabled = () => secret().length > 0;

type PaystackTransaction = {
  status: string; // "success" | "failed" | "abandoned" | …
  reference: string;
  amount: number; // kobo
  currency: string;
  paid_at?: string;
  metadata?: { registrationId?: string } | string | null;
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as { status?: boolean; message?: string; data?: T };
  if (!res.ok || !body.status || !body.data) throw new Error(body.message ?? `Paystack request failed (${res.status})`);
  return body.data;
}

/** Starts a checkout and returns the Paystack-hosted payment page URL. */
export async function initializePayment(opts: { email: string; amountNaira: number; registrationId: string; registrationRef: string; callbackUrl: string }) {
  // Paystack references must be unique per attempt, so suffix our own reference.
  const reference = `${opts.registrationRef}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const data = await call<{ authorization_url: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: opts.email,
      amount: Math.round(opts.amountNaira * 100),
      currency: "NGN",
      reference,
      callback_url: opts.callbackUrl,
      metadata: { registrationId: opts.registrationId, registrationRef: opts.registrationRef },
    }),
  });
  return data.authorization_url;
}

export function verifyTransaction(reference: string) {
  return call<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

/** Checks the x-paystack-signature header (HMAC-SHA512 of the raw body). */
export function isValidSignature(rawBody: string, signature: string | null) {
  if (!signature || !paystackEnabled()) return false;
  const expected = createHmac("sha512", secret()).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type ApplyResult = "paid" | "already-paid" | "not-successful" | "mismatch" | "not-found";

/**
 * Marks a registration paid from a transaction that has been verified with
 * Paystack. Safe to call twice (callback + webhook both arrive): the second
 * call is a no-op.
 */
export async function applyVerifiedPayment(tx: PaystackTransaction): Promise<ApplyResult> {
  if (tx.status !== "success") return "not-successful";
  const meta = typeof tx.metadata === "string" ? safeJson(tx.metadata) : tx.metadata;
  const registrationId = meta?.registrationId;
  if (!registrationId) return "not-found";

  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { programme: true, user: { select: { name: true, email: true } } },
  });
  if (!reg) return "not-found";
  if (reg.paymentStatus === "PAID") return "already-paid";
  // Never trust the amount from the browser: compare with the fee on record.
  if (tx.currency !== "NGN" || tx.amount < reg.programme.fee * 100) return "mismatch";

  const updated = await prisma.registration.update({
    where: { id: reg.id },
    data: {
      paymentStatus: "PAID",
      paymentReference: `PAYSTACK:${tx.reference}`,
      status: reg.status === "PENDING" ? "CONFIRMED" : reg.status,
    },
  });
  await mail.registrationUpdated(reg.user.email, reg.user.name, {
    reference: reg.reference,
    programme: reg.programme.title,
    status: updated.status,
    paymentStatus: updated.paymentStatus,
    note: "Payment received online via Paystack. Thank you.",
  });
  return "paid";
}

function safeJson(s: string): { registrationId?: string } | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

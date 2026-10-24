import { Suspense } from "react";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageTitle } from "@/components/dashboard/shell";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { PaymentReferenceForm } from "@/components/dashboard/payment-reference-form";
import { PayOnlineButton, PaymentResultToast } from "@/components/dashboard/pay-online";
import { paystackEnabled } from "@/server/paystack";
import { BankDetails } from "@/components/bank-details";
import { Button } from "@/components/ui/button";
import { formatDate, formatNaira } from "@/lib/utils";

export default async function MyRegistrationsPage() {
  const user = await requireUser("/dashboard/registrations");
  const regs = await prisma.registration.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { programme: true },
  });
  const canPayOnline = paystackEnabled();

  return (
    <div>
      <Suspense>
        <PaymentResultToast />
      </Suspense>
      <PageTitle
        title="Programme registrations"
        description="Pay for your programmes, track confirmation and download admission letters."
        action={<Button asChild><Link href="/programmes"><Plus /> Register for a programme</Link></Button>}
      />

      {regs.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-14 text-center">
          <p className="font-semibold">No registrations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Explore e-learning courses and Summer Computer Programmes.</p>
          <Button asChild className="mt-5"><Link href="/programmes">View programmes</Link></Button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5">
            {regs.map((r) => (
              <article key={r.id} className="rounded-2xl border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs font-semibold text-gold-700 dark:text-gold-400">{r.reference}</p>
                    <h2 className="mt-1 text-lg font-semibold">
                      <Link href={`/programmes/${r.programme.slug}`} className="hover:underline">{r.programme.title}</Link>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {r.programme.duration} · {r.programme.mode} · Starts {formatDate(r.programme.startDate)} · {formatNaira(r.programme.fee)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={r.status} />
                    <StatusBadge status={r.paymentStatus} />
                  </div>
                </div>

                <StatusTimeline type="programme" status={r.status} className="mt-8 max-w-lg" />

                {r.adminNote && (
                  <p className="mt-6 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Note: </span>{r.adminNote}
                  </p>
                )}

                {r.status !== "REJECTED" && r.paymentStatus !== "PAID" && (
                  <div className="mt-6 space-y-3">
                    {canPayOnline && (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-500/30 bg-gold-500/5 p-4">
                        <p className="text-sm">Pay instantly by card, bank transfer or USSD via Paystack. Your seat is confirmed automatically.</p>
                        <PayOnlineButton registrationId={r.id} amount={formatNaira(r.programme.fee)} />
                      </div>
                    )}
                    <PaymentReferenceForm registrationId={r.id} current={r.paymentReference} status={r.paymentStatus} />
                  </div>
                )}

                {(r.status === "CONFIRMED" || r.status === "COMPLETED") && (
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-500/30 bg-gold-500/5 p-4">
                    <p className="text-sm">Your admission letter is ready.</p>
                    <Button asChild variant="gold" size="sm">
                      <a href={`/api/letters/programme/${r.id}`}><Download /> Admission letter (PDF)</a>
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <BankDetails />
          </aside>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { Download, FileText, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageTitle } from "@/components/dashboard/shell";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { Button } from "@/components/ui/button";
import { CAMPUS_LABEL, type Campus } from "@/lib/constants";
import { formatDate, formatNaira } from "@/lib/utils";

export default async function MyApplicationsPage() {
  const user = await requireUser("/dashboard/applications");
  const apps = await prisma.shopApplication.findMany({
    where: { applicantId: user.id },
    orderBy: { createdAt: "desc" },
    include: { preferredShop: true, allocatedShop: true },
  });

  return (
    <div>
      <PageTitle
        title="Shop applications"
        description="Track the progress of your applications and download allocation letters."
        action={<Button asChild><Link href="/shops#apply"><Plus /> New application</Link></Button>}
      />

      {apps.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-14 text-center">
          <p className="font-semibold">You have not applied for a shop yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Browse available shops on both campuses and apply online.</p>
          <Button asChild className="mt-5"><Link href="/shops">Browse shops</Link></Button>
        </div>
      ) : (
        <div className="space-y-5">
          {apps.map((a) => (
            <article key={a.id} className="rounded-2xl border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-semibold text-gold-700 dark:text-gold-400">{a.reference}</p>
                  <h2 className="mt-1 text-lg font-semibold">{a.businessName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {a.businessType} · {CAMPUS_LABEL[a.campus as Campus]} · Submitted {formatDate(a.createdAt)}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>

              <StatusTimeline type="shop" status={a.status} className="mt-8 max-w-2xl" />

              <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Preferred shop</dt>
                  <dd className="mt-1 font-medium">{a.preferredShop ? `${a.preferredShop.code} · ${a.preferredShop.category}` : "No preference"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Allocated shop</dt>
                  <dd className="mt-1 font-medium">
                    {a.allocatedShop ? `${a.allocatedShop.code} · ${formatNaira(a.allocatedShop.annualRent)}/yr` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Documents</dt>
                  <dd className="mt-1 flex flex-wrap gap-3">
                    {a.idDocument && <a href={`/api/files/${a.id}/id`} target="_blank" className="inline-flex items-center gap-1 font-medium text-primary hover:underline dark:text-forest-300"><FileText className="h-3.5 w-3.5" /> ID</a>}
                    {a.proposalDocument && <a href={`/api/files/${a.id}/proposal`} target="_blank" className="inline-flex items-center gap-1 font-medium text-primary hover:underline dark:text-forest-300"><FileText className="h-3.5 w-3.5" /> Proposal</a>}
                    {!a.idDocument && !a.proposalDocument && <span className="text-muted-foreground">—</span>}
                  </dd>
                </div>
              </dl>

              {a.adminNote && (
                <p className="mt-6 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Note from the committee: </span>{a.adminNote}
                </p>
              )}

              {a.status === "ALLOCATED" && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-500/30 bg-gold-500/5 p-4">
                  <p className="text-sm">Your allocation letter is ready. Present it at the Bursary when paying rent.</p>
                  <Button asChild variant="gold" size="sm">
                    <a href={`/api/letters/shop/${a.id}`}><Download /> Allocation letter (PDF)</a>
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

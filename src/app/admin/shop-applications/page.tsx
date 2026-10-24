import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/dashboard/shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { ReviewDialog } from "@/components/admin/review-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Card, Table, TBody, TD, TH, THead, TR } from "@/components/ui/primitives";
import { CAMPUS_LABEL, CAMPUSES, SHOP_APP_STATUSES, STATUS_LABEL, type Campus } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Search = { q?: string; campus?: string; status?: string };

export default async function AdminShopApplications({ searchParams }: { searchParams: Promise<Search> }) {
  const { q, campus, status } = await searchParams;
  const where: Prisma.ShopApplicationWhereInput = {
    ...(campus && { campus }),
    ...(status && { status }),
    ...(q && {
      OR: [{ reference: { contains: q.toUpperCase() } }, { businessName: { contains: q } }, { applicant: { name: { contains: q } } }],
    }),
  };

  const [apps, shops] = await Promise.all([
    prisma.shopApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { applicant: { select: { name: true, email: true } }, preferredShop: true, allocatedShop: true },
    }),
    prisma.shop.findMany({ orderBy: { code: "asc" } }),
  ]);

  return (
    <div>
      <PageTitle title="Shop applications" description="Review applications, record decisions and allocate shops on both campuses." />
      <Suspense>
        <FilterBar
          selects={[
            { name: "campus", label: "Campus", options: CAMPUSES.map((c) => ({ value: c, label: CAMPUS_LABEL[c] })) },
            { name: "status", label: "Status", options: SHOP_APP_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })) },
          ]}
        />
      </Suspense>
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Reference</TH>
              <TH>Business / applicant</TH>
              <TH>Campus</TH>
              <TH>Shop</TH>
              <TH>Submitted</TH>
              <TH>Status</TH>
              <TH className="text-right">Action</TH>
            </TR>
          </THead>
          <TBody>
            {apps.map((a) => {
              // Shops the reviewer may allocate: free ones on the same campus, plus the current allocation.
              const options = shops
                .filter((s) => s.campus === a.campus && (s.status === "AVAILABLE" || s.status === "RESERVED" || s.id === a.allocatedShopId))
                .map((s) => ({ id: s.id, label: `${s.code} · ${s.category} · ${s.sizeSqm} m²`, rent: s.annualRent }));
              return (
                <TR key={a.id}>
                  <TD className="font-mono text-xs font-semibold">{a.reference}</TD>
                  <TD>
                    <p className="font-medium">{a.businessName}</p>
                    <p className="text-xs text-muted-foreground">{a.applicant.name}</p>
                  </TD>
                  <TD className="whitespace-nowrap">{CAMPUS_LABEL[a.campus as Campus]}</TD>
                  <TD className="whitespace-nowrap text-xs">
                    {a.allocatedShop ? <span className="font-semibold">{a.allocatedShop.code}</span> : a.preferredShop ? <span className="text-muted-foreground">Pref. {a.preferredShop.code}</span> : "—"}
                  </TD>
                  <TD className="whitespace-nowrap text-muted-foreground">{formatDate(a.createdAt)}</TD>
                  <TD><StatusBadge status={a.status} /></TD>
                  <TD className="text-right">
                    <ReviewDialog
                      shops={options}
                      app={{
                        id: a.id,
                        reference: a.reference,
                        businessName: a.businessName,
                        businessType: a.businessType,
                        description: a.description,
                        yearsExperience: a.yearsExperience,
                        phone: a.phone,
                        status: a.status,
                        adminNote: a.adminNote,
                        applicant: a.applicant.name,
                        email: a.applicant.email,
                        preferred: a.preferredShop ? `${a.preferredShop.code} · ${a.preferredShop.category}` : null,
                        allocatedShopId: a.allocatedShopId,
                        hasId: !!a.idDocument,
                        hasProposal: !!a.proposalDocument,
                      }}
                    />
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
        {apps.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No applications match these filters.</p>}
      </Card>
    </div>
  );
}

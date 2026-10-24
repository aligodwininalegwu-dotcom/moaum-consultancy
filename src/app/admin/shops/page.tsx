import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/dashboard/shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { ShopEditor, ShopStatusSelect } from "@/components/admin/shop-editor";
import { Card, Table, TBody, TD, TH, THead, TR } from "@/components/ui/primitives";
import { CAMPUS_LABEL, CAMPUSES, SHOP_STATUSES, STATUS_LABEL, type Campus } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminShops({ searchParams }: { searchParams: Promise<{ q?: string; campus?: string; status?: string }> }) {
  const { q, campus, status } = await searchParams;
  const where: Prisma.ShopWhereInput = {
    ...(campus && { campus }),
    ...(status && { status }),
    ...(q && { OR: [{ code: { contains: q.toUpperCase() } }, { location: { contains: q } }, { category: { contains: q } }] }),
  };
  const shops = await prisma.shop.findMany({
    where,
    orderBy: [{ campus: "desc" }, { code: "asc" }],
    include: { allocatedTo: { where: { status: "ALLOCATED" }, select: { businessName: true }, take: 1 } },
  });

  return (
    <div>
      <PageTitle title="Shops register" description="Every commercial space on the Western and Eastern Campuses." action={<ShopEditor />} />
      <Suspense>
        <FilterBar
          selects={[
            { name: "campus", label: "Campus", options: CAMPUSES.map((c) => ({ value: c, label: CAMPUS_LABEL[c] })) },
            { name: "status", label: "Status", options: SHOP_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })) },
          ]}
        />
      </Suspense>
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Code</TH>
              <TH>Campus / location</TH>
              <TH>Category</TH>
              <TH>Size</TH>
              <TH>Rent / yr</TH>
              <TH>Tenant</TH>
              <TH>Status</TH>
              <TH className="text-right">Edit</TH>
            </TR>
          </THead>
          <TBody>
            {shops.map((s) => (
              <TR key={s.id}>
                <TD className="font-mono text-xs font-semibold">{s.code}</TD>
                <TD>
                  <p className="whitespace-nowrap">{CAMPUS_LABEL[s.campus as Campus]}</p>
                  <p className="text-xs text-muted-foreground">{s.block} · {s.location}</p>
                </TD>
                <TD className="whitespace-nowrap">{s.category}</TD>
                <TD className="whitespace-nowrap">{s.sizeSqm} m²</TD>
                <TD className="whitespace-nowrap font-medium">{formatNaira(s.annualRent)}</TD>
                <TD className="text-xs text-muted-foreground">{s.allocatedTo[0]?.businessName ?? "—"}</TD>
                <TD><ShopStatusSelect id={s.id} status={s.status} /></TD>
                <TD className="text-right">
                  <ShopEditor
                    shop={{
                      id: s.id,
                      code: s.code,
                      campus: s.campus as Campus,
                      block: s.block,
                      location: s.location,
                      category: s.category as never,
                      sizeSqm: s.sizeSqm,
                      annualRent: s.annualRent,
                      status: s.status as never,
                      features: s.features,
                      description: s.description,
                    }}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        {shops.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No shops match these filters.</p>}
      </Card>
    </div>
  );
}

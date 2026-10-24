import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/dashboard/shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { RegistrationEditor } from "@/components/admin/registration-editor";
import { StatusBadge } from "@/components/status-badge";
import { Card, Table, TBody, TD, TH, THead, TR } from "@/components/ui/primitives";
import { PAYMENT_STATUSES, REG_STATUSES, STATUS_LABEL } from "@/lib/constants";
import { formatDate, formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Search = { q?: string; status?: string; payment?: string; programme?: string };

export default async function AdminRegistrations({ searchParams }: { searchParams: Promise<Search> }) {
  const { q, status, payment, programme } = await searchParams;
  const where: Prisma.RegistrationWhereInput = {
    ...(status && { status }),
    ...(payment && { paymentStatus: payment }),
    ...(programme && { programmeId: programme }),
    ...(q && { OR: [{ reference: { contains: q.toUpperCase() } }, { user: { name: { contains: q } } }, { user: { email: { contains: q } } }] }),
  };
  const [regs, programmes] = await Promise.all([
    prisma.registration.findMany({ where, orderBy: { createdAt: "desc" }, include: { user: true, programme: true } }),
    prisma.programme.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  return (
    <div>
      <PageTitle title="Programme registrations" description="Verify payments, confirm seats and record completions." />
      <Suspense>
        <FilterBar
          selects={[
            { name: "programme", label: "Programme", options: programmes.map((p) => ({ value: p.id, label: p.title })) },
            { name: "status", label: "Status", options: REG_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })) },
            { name: "payment", label: "Payment", options: PAYMENT_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })) },
          ]}
        />
      </Suspense>
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Reference</TH>
              <TH>Participant</TH>
              <TH>Programme</TH>
              <TH>Fee</TH>
              <TH>Registered</TH>
              <TH>Status</TH>
              <TH>Payment</TH>
              <TH className="text-right">Action</TH>
            </TR>
          </THead>
          <TBody>
            {regs.map((r) => (
              <TR key={r.id}>
                <TD className="font-mono text-xs font-semibold">{r.reference}</TD>
                <TD>
                  <p className="font-medium">{r.user.name}</p>
                  <p className="text-xs text-muted-foreground">{r.user.email}</p>
                </TD>
                <TD className="max-w-[220px]"><p className="truncate">{r.programme.title}</p></TD>
                <TD className="whitespace-nowrap">{formatNaira(r.programme.fee)}</TD>
                <TD className="whitespace-nowrap text-muted-foreground">{formatDate(r.createdAt)}</TD>
                <TD><StatusBadge status={r.status} /></TD>
                <TD><StatusBadge status={r.paymentStatus} /></TD>
                <TD className="text-right">
                  <RegistrationEditor
                    reg={{
                      id: r.id,
                      reference: r.reference,
                      name: r.user.name,
                      programme: r.programme.title,
                      status: r.status,
                      paymentStatus: r.paymentStatus,
                      paymentReference: r.paymentReference,
                      motivation: r.motivation,
                      adminNote: r.adminNote,
                    }}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        {regs.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No registrations match these filters.</p>}
      </Card>
    </div>
  );
}

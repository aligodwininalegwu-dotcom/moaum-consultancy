import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireConsole } from "@/lib/auth";
import { PageTitle } from "@/components/dashboard/shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { Badge, Card, Table, TBody, TD, TH, THead, TR } from "@/components/ui/primitives";
import { ROLES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const me = await requireConsole(["ADMIN"]);
  const { q, role } = await searchParams;
  const where: Prisma.UserWhereInput = {
    ...(role && { role }),
    ...(q && { OR: [{ name: { contains: q } }, { email: { contains: q } }, { matricNo: { contains: q } }] }),
  };
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { shopApplications: true, registrations: true } } },
  });

  return (
    <div>
      <PageTitle title="Users" description="Manage roles and access. Staff can review applications; only administrators manage users." />
      <Suspense>
        <FilterBar selects={[{ name: "role", label: "Role", options: ROLES.map((r) => ({ value: r, label: r.charAt(0) + r.slice(1).toLowerCase() })) }]} />
      </Suspense>
      <Card>
        <Table>
          <THead>
            <TR>
              <TH>User</TH>
              <TH>Phone / matric</TH>
              <TH>Activity</TH>
              <TH>Joined</TH>
              <TH>Status</TH>
              <TH className="text-right">Role &amp; access</TH>
            </TR>
          </THead>
          <TBody>
            {users.map((u) => (
              <TR key={u.id}>
                <TD>
                  <p className="font-medium">{u.name}{u.id === me.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </TD>
                <TD className="text-xs text-muted-foreground">
                  <p>{u.phone ?? "—"}</p>
                  <p className="font-mono">{u.matricNo ?? ""}</p>
                </TD>
                <TD className="whitespace-nowrap text-xs text-muted-foreground">
                  {u._count.shopApplications} shop · {u._count.registrations} programme
                </TD>
                <TD className="whitespace-nowrap text-muted-foreground">{formatDate(u.createdAt)}</TD>
                <TD>{u.active ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Deactivated</Badge>}</TD>
                <TD><UserRowActions id={u.id} role={u.role} active={u.active} self={u.id === me.id} /></TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}

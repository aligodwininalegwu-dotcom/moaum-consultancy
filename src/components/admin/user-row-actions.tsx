"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markMessageRead, updateUser } from "@/server/admin-actions";
import { NativeSelect } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/constants";

export function UserRowActions({ id, role, active, self }: { id: string; role: string; active: boolean; self: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const run = (next: { role: string; active: boolean }) =>
    startTransition(async () => {
      const res = await updateUser({ id, ...next });
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else toast.error(res.error);
    });

  return (
    <div className="flex items-center justify-end gap-2">
      <NativeSelect aria-label="Role" className="h-9 w-32 text-xs" value={role} disabled={pending || self} onChange={(e) => run({ role: e.target.value, active })}>
        {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
      </NativeSelect>
      <Button size="sm" variant={active ? "outline" : "default"} disabled={pending || self} onClick={() => run({ role, active: !active })}>
        {active ? "Deactivate" : "Activate"}
      </Button>
    </div>
  );
}

export function MessageReadToggle({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await markMessageRead(id, !read);
          if (res.ok) router.refresh();
          else toast.error(res.error);
        })
      }
    >
      {read ? "Mark unread" : "Mark read"}
    </Button>
  );
}

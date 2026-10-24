"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateProfileAction } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";

type Values = { name: string; phone: string; matricNo: string; department: string };

export function ProfileForm({ defaults }: { defaults: Values }) {
  const router = useRouter();
  const { update } = useSession();
  const [values, setValues] = React.useState(defaults);
  const [pending, startTransition] = React.useTransition();
  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));

  return (
    <form method="post"
      className="space-y-5 rounded-2xl border bg-card p-6"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await updateProfileAction(values);
          if (res.ok) {
            toast.success(res.message);
            await update();
            router.refresh();
          } else toast.error(res.error);
        });
      }}
    >
      <Field label="Full name" htmlFor="name" required>
        <Input id="name" value={values.name} onChange={set("name")} />
      </Field>
      <Field label="Phone" htmlFor="phone">
        <Input id="phone" type="tel" value={values.phone} onChange={set("phone")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Matric / staff no." htmlFor="matricNo">
          <Input id="matricNo" value={values.matricNo} onChange={set("matricNo")} />
        </Field>
        <Field label="Department" htmlFor="department">
          <Input id="department" value={values.department} onChange={set("department")} />
        </Field>
      </div>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Save changes
      </Button>
    </form>
  );
}

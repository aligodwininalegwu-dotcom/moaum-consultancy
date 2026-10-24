"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateRegistration } from "@/server/admin-actions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NativeSelect, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { PAYMENT_STATUSES, REG_STATUSES, STATUS_LABEL } from "@/lib/constants";

export function RegistrationEditor({
  reg,
}: {
  reg: { id: string; reference: string; name: string; programme: string; status: string; paymentStatus: string; paymentReference: string | null; motivation: string | null; adminNote: string | null };
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState(reg.status);
  const [payment, setPayment] = React.useState(reg.paymentStatus);
  const [note, setNote] = React.useState(reg.adminNote ?? "");
  const [pending, startTransition] = React.useTransition();

  const save = (next?: { status?: string; paymentStatus?: string }) =>
    startTransition(async () => {
      const res = await updateRegistration({
        id: reg.id,
        status: (next?.status ?? status) as never,
        paymentStatus: (next?.paymentStatus ?? payment) as never,
        adminNote: note,
      });
      if (res.ok) {
        toast.success(res.message);
        setOpen(false);
        router.refresh();
      } else toast.error(res.error);
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Manage</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <p className="font-mono text-xs font-semibold text-gold-700 dark:text-gold-400">{reg.reference}</p>
          <DialogTitle>{reg.name}</DialogTitle>
          <DialogDescription>{reg.programme}</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl bg-muted/60 p-4 text-sm">
          <p><span className="text-muted-foreground">Payment reference:</span> <span className="font-mono">{reg.paymentReference ?? "Not submitted"}</span></p>
          {reg.motivation && <p className="mt-2 text-muted-foreground">“{reg.motivation}”</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Registration status" htmlFor={`rs-${reg.id}`}>
            <NativeSelect id={`rs-${reg.id}`} value={status} onChange={(e) => setStatus(e.target.value)}>
              {REG_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Payment status" htmlFor={`ps-${reg.id}`}>
            <NativeSelect id={`ps-${reg.id}`} value={payment} onChange={(e) => setPayment(e.target.value)}>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <Field label="Note to participant" htmlFor={`rn-${reg.id}`}>
          <Textarea id={`rn-${reg.id}`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button variant="destructive" disabled={pending} onClick={() => save({ status: "REJECTED" })}>Reject</Button>
          <Button variant="gold" disabled={pending} onClick={() => save({ status: "CONFIRMED", paymentStatus: "PAID" })}>Verify payment &amp; confirm</Button>
          <Button disabled={pending} onClick={() => save()}>{pending && <Loader2 className="animate-spin" />} Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

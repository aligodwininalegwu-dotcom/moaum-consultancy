"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";
import { reviewShopApplication } from "@/server/admin-actions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NativeSelect, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { SHOP_APP_STATUSES, STATUS_LABEL } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";

export type ReviewApp = {
  id: string;
  reference: string;
  businessName: string;
  businessType: string;
  description: string;
  yearsExperience: number;
  phone: string;
  status: string;
  adminNote: string | null;
  applicant: string;
  email: string;
  preferred: string | null;
  allocatedShopId: string | null;
  hasId: boolean;
  hasProposal: boolean;
};

export function ReviewDialog({ app, shops }: { app: ReviewApp; shops: { id: string; label: string; rent: number }[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState(app.status);
  const [shopId, setShopId] = React.useState(app.allocatedShopId ?? "");
  const [note, setNote] = React.useState(app.adminNote ?? "");
  const [pending, startTransition] = React.useTransition();

  const save = (override?: string) =>
    startTransition(async () => {
      const next = override ?? status;
      const res = await reviewShopApplication({ id: app.id, status: next as never, allocatedShopId: shopId || undefined, adminNote: note });
      if (res.ok) {
        toast.success(res.message);
        setOpen(false);
        router.refresh();
      } else toast.error(res.error);
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Review</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <p className="font-mono text-xs font-semibold text-gold-700 dark:text-gold-400">{app.reference}</p>
          <DialogTitle>{app.businessName}</DialogTitle>
          <DialogDescription>
            {app.businessType} · {app.yearsExperience} yr{app.yearsExperience === 1 ? "" : "s"} experience
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-xl bg-muted/60 p-4 text-sm sm:grid-cols-2">
          <p><span className="text-muted-foreground">Applicant:</span> {app.applicant}</p>
          <p><span className="text-muted-foreground">Phone:</span> {app.phone}</p>
          <p className="truncate"><span className="text-muted-foreground">Email:</span> {app.email}</p>
          <p><span className="text-muted-foreground">Preferred:</span> {app.preferred ?? "No preference"}</p>
        </div>
        <p className="max-h-40 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{app.description}</p>
        <div className="flex flex-wrap gap-2">
          {app.hasId && <Button asChild size="sm" variant="secondary"><a href={`/api/files/${app.id}/id`} target="_blank"><FileText /> ID document</a></Button>}
          {app.hasProposal && <Button asChild size="sm" variant="secondary"><a href={`/api/files/${app.id}/proposal`} target="_blank"><FileText /> Business proposal</a></Button>}
          {!app.hasId && !app.hasProposal && <span className="text-xs text-muted-foreground">No documents attached (seed data).</span>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Decision" htmlFor={`status-${app.id}`}>
            <NativeSelect id={`status-${app.id}`} value={status} onChange={(e) => setStatus(e.target.value)}>
              {SHOP_APP_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Allocate shop" htmlFor={`shop-${app.id}`} hint="Required when the decision is Allocated">
            <NativeSelect id={`shop-${app.id}`} value={shopId} onChange={(e) => setShopId(e.target.value)} disabled={status !== "ALLOCATED"}>
              <option value="">Select a shop…</option>
              {shops.map((s) => <option key={s.id} value={s.id}>{s.label} · {formatNaira(s.rent)}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <Field label="Note to applicant" htmlFor={`note-${app.id}`} hint="Shown on the applicant's dashboard and tracking page.">
          <Textarea id={`note-${app.id}`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>

        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button variant="destructive" disabled={pending} onClick={() => save("REJECTED")}>Reject</Button>
          <Button variant="outline" disabled={pending} onClick={() => save("APPROVED")}>Approve</Button>
          <Button disabled={pending} onClick={() => save()}>
            {pending && <Loader2 className="animate-spin" />} Save decision
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

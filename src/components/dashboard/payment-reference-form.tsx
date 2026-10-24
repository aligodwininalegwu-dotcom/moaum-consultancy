"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { submitPaymentReference } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PaymentReferenceForm({ registrationId, current, status }: { registrationId: string; current: string | null; status: string }) {
  const router = useRouter();
  const [value, setValue] = React.useState(current ?? "");
  const [pending, startTransition] = React.useTransition();

  return (
    <form method="post"
      className="rounded-xl border bg-muted/40 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await submitPaymentReference({ registrationId, paymentReference: value });
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
          } else toast.error(res.error);
        });
      }}
    >
      <label htmlFor={`pay-${registrationId}`} className="text-sm font-medium">
        {status === "AWAITING_VERIFICATION" ? "Payment reference submitted. Update it if needed:" : "Paid by bank transfer? Enter the transaction reference:"}
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input id={`pay-${registrationId}`} value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. FBN-TRF-55120934" className="font-mono" />
        <Button type="submit" disabled={pending || value.trim().length < 6}>
          {pending && <Loader2 className="animate-spin" />} Submit
        </Button>
      </div>
    </form>
  );
}

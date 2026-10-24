"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, Loader2 } from "lucide-react";
import { startCardPayment } from "@/server/actions";
import { Button } from "@/components/ui/button";

export function PayOnlineButton({ registrationId, amount }: { registrationId: string; amount: string }) {
  const [pending, startTransition] = React.useTransition();
  return (
    <Button
      variant="gold"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await startCardPayment(registrationId);
          if (res.ok) window.location.assign(res.data!.url);
          else toast.error(res.error);
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" /> : <CreditCard />} Pay {amount} online
    </Button>
  );
}

const MESSAGES: Record<string, () => void> = {
  success: () => toast.success("Payment successful", { description: "Your seat is confirmed. A confirmation email is on its way." }),
  failed: () => toast.error("Payment was not completed", { description: "You have not been charged. You can try again or pay by bank transfer." }),
  review: () => toast.warning("Payment needs review", { description: "We received a payment that doesn't match the fee. The accounts officer will contact you." }),
};

/** Shows the outcome after Paystack redirects back, then cleans the URL. */
export function PaymentResultToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const result = params.get("payment");

  React.useEffect(() => {
    if (!result || !MESSAGES[result]) return;
    MESSAGES[result]();
    router.replace(pathname, { scroll: false });
  }, [result, router, pathname]);

  return null;
}

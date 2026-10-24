import { Badge, type BadgeProps } from "@/components/ui/primitives";
import { STATUS_LABEL } from "@/lib/constants";

const VARIANT: Record<string, BadgeProps["variant"]> = {
  AVAILABLE: "success",
  OCCUPIED: "muted",
  RESERVED: "warning",
  MAINTENANCE: "danger",
  PENDING: "warning",
  UNDER_REVIEW: "info",
  APPROVED: "success",
  REJECTED: "danger",
  ALLOCATED: "gold",
  CONFIRMED: "success",
  COMPLETED: "gold",
  UNPAID: "danger",
  AWAITING_VERIFICATION: "info",
  PAID: "success",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={VARIANT[status] ?? "muted"} className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

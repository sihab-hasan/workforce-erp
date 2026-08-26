import { Badge } from "@workforce-erp/ui/components/badge";
import type { UserAccountStatus } from "../types/users.types";

const STATUS_CONFIG: Record<
  UserAccountStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  active: { label: "Active", variant: "default" },
  invited: { label: "Invited", variant: "secondary" },
  inactive: { label: "Inactive", variant: "destructive" },
  suspended: { label: "Suspended", variant: "outline" },
};

export interface UserStatusBadgeProps {
  status: UserAccountStatus;
  className?: string;
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const { label, variant } = STATUS_CONFIG[status];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

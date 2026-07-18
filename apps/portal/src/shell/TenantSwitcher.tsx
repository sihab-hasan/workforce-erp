import { Building2 } from "lucide-react"
import { Badge } from "@workforce-erp/ui/components/badge"

type TenantSwitcherProps = {
  tenantName: string
}

export function TenantSwitcher({ tenantName }: TenantSwitcherProps) {
  return (
    <Badge variant="secondary" className="h-8 gap-1.5 px-3">
      <Building2 data-icon="inline-start" />
      {tenantName}
    </Badge>
  )
}

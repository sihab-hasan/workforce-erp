type TenantSwitcherProps = {
  tenantName: string
}

export function TenantSwitcher({ tenantName }: TenantSwitcherProps) {
  return (
    <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
      {tenantName}
    </div>
  )
}

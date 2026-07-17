import { Bell, Search } from "lucide-react"
import { appConfig } from "@/app/config/app.config.ts"
import { BranchSwitcher } from "@/shell/BranchSwitcher.tsx"
import { Breadcrumbs } from "@/shell/Breadcrumbs.tsx"
import { CommandMenu } from "@/shell/CommandMenu.tsx"
import { TenantSwitcher } from "@/shell/TenantSwitcher.tsx"

type PortalHeaderProps = {
  section: string
  title: string
}

export function PortalHeader({ section, title }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex flex-col gap-4 px-4 py-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Breadcrumbs section={section} title={title} />
            <div>
              <h1 className="text-xl font-semibold text-slate-950 dark:text-white">
                {title}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {appConfig.tagline}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TenantSwitcher tenantName="Acme Manufacturing" />
            <BranchSwitcher branchName="team-lead/work" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <CommandMenu hint={appConfig.commandHint} />
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              type="button"
            >
              <Search className="size-4" />
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              type="button"
            >
              <Bell className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

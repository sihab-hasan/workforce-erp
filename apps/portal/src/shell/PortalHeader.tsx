import { Bell, Search, Settings } from "lucide-react"
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
    <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/90 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/90">
      <div className="flex items-center justify-between gap-4 px-6 py-3.5">
        {/* Left — page identity */}
        <div className="min-w-0 flex-1">
          <Breadcrumbs section={section} title={title} />
          <h1 className="mt-0.5 truncate text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
        </div>

        {/* Center — search */}
        <div className="hidden max-w-sm flex-1 md:block">
          <CommandMenu hint={appConfig.commandHint} />
        </div>

        {/* Right — actions + avatar */}
        <div className="flex shrink-0 items-center gap-2">
          <TenantSwitcher tenantName="Acme Manufacturing" />
          <BranchSwitcher branchName="team-lead/work" />

          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

          <button
            type="button"
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </button>
            {/* notification dot */}
            <span className="absolute top-1.5 right-1.5 flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-indigo-500" />
            </span>
          </div>

          <button
            type="button"
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Avatar */}
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white shadow ring-2 ring-white transition-transform hover:scale-105 dark:ring-slate-900"
            aria-label="User menu"
          >
            U
          </button>
        </div>
      </div>
    </header>
  )
}

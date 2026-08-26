import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { useTheme } from "@workforce-erp/ui/hooks/use-theme";
import { cn } from "@workforce-erp/ui/lib/utils";
import { WEB_PATHS } from "#routes/paths";

const navigation = [
  { label: "Features", to: WEB_PATHS.features },
  { label: "About", to: WEB_PATHS.about },
  { label: "Contact", to: WEB_PATHS.contact },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <div className="border-b border-primary-foreground/15 bg-primary text-primary-foreground">
        <div className="mx-auto flex h-10 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <p className="truncate text-xs font-medium sm:text-sm">
            AI-powered workforce operations, now in one focused ERP workspace.
          </p>
          <Link
            to={WEB_PATHS.features}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold hover:opacity-80 sm:text-sm"
          >
            Learn more <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <Link
            to={WEB_PATHS.home}
            className="group flex shrink-0 items-center gap-3 rounded-sm"
            aria-label="Workforce ERP home"
          >
            <span className="relative block h-6 w-8" aria-hidden="true">
              <span className="absolute left-0 top-2 h-0.5 w-7 bg-primary transition-transform group-hover:translate-x-1" />
              <span className="absolute left-1 top-3.5 h-0.5 w-5 bg-primary" />
              <span className="absolute left-3 top-0 h-3.5 w-0.5 bg-primary" />
            </span>
            <span className="text-lg font-semibold tracking-[-0.035em]">Workforce ERP</span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden md:block">
            <ul className="flex items-center gap-7">
              {navigation.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "relative inline-flex py-6 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:bottom-4 after:h-0.5 after:origin-center after:bg-primary after:transition-transform",
                        isActive
                          ? "text-foreground after:scale-x-100"
                          : "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={isDark ? "Use light theme" : "Use dark theme"}
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
            <Button
              variant="secondary"
              nativeButton={false}
              className="hidden sm:inline-flex"
              render={<Link to={WEB_PATHS.signIn} />}
            >
              Sign in
            </Button>
            <Button
              nativeButton={false}
              className="hidden lg:inline-flex"
              render={<Link to={WEB_PATHS.contact} />}
            >
              Request demo
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {open ? (
          <nav
            className="border-t bg-background px-5 py-4 md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto grid max-w-[1440px] gap-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to={WEB_PATHS.signIn}
                onClick={() => setOpen(false)}
                className="mt-2 rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Sign in
              </NavLink>
            </div>
          </nav>
        ) : null}
      </header>
    </>
  );
}

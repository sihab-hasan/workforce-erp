import { Moon, Sun } from "lucide-react"

import { Button } from "@workforce-erp/ui/components/button"
import { useTheme } from "@workforce-erp/ui/providers/theme-provider"

type ThemeSwitcherProps = {
  className?: string
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const nextTheme = isDark ? "light" : "dark"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={className}
      aria-label={`Use ${nextTheme} theme`}
      title={`Use ${nextTheme} theme`}
      onClick={() => setTheme(nextTheme)}
    >
      {isDark ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </Button>
  )
}

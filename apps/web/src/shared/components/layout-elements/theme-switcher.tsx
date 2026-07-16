import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/app/providers/ThemeProvider"
import { Button } from "@workforce-erp/ui/components/button"

type ThemeSwitcherProps = {
  className?: string
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
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
      {isDark ? (
        <Sun data-icon="inline-start" aria-hidden="true" />
      ) : (
        <Moon data-icon="inline-start" aria-hidden="true" />
      )}
    </Button>
  )
}

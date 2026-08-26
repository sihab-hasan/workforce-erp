import type { ReactNode } from "react";
import { ThemeProvider } from "@workforce-erp/ui/providers/theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

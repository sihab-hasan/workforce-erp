import { createContext } from "react";

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

export interface ThemeProviderState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme(theme: Theme): void;
}

export const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

// src/theme/themeContext.ts
import { createContext, useContext } from "react";
import type { ColorMode } from "./theme";

export type ThemeContextValue = {
  mode: ColorMode;
  toggleMode: () => void;
  setMode: (mode: ColorMode) => void;
};

export const ThemeModeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx)
    throw new Error("useThemeMode must be used inside AppThemeProvider");
  return ctx;
}

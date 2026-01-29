import React, { useCallback, useMemo, useState } from "react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

import { buildTheme } from "./theme";
import type { ColorMode } from "./theme";
import { ThemeModeContext } from "./themeContext";

type Props = { children: React.ReactNode };

const STORAGE_KEY = "ui_color_mode";

function getInitialMode(): ColorMode {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === "dark" ? "dark" : "light";
}

export default function AppThemeProvider({ children }: Props) {
  const [mode, setModeState] = useState<ColorMode>(() => getInitialMode());

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: ColorMode = prev === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const value = useMemo(
    () => ({ mode, toggleMode, setMode }),
    [mode, toggleMode, setMode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}

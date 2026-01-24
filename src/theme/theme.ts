// src/theme/theme.ts
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

export type ColorMode = "light" | "dark";

const BRAND = {
  primary: "#2e7d32",
  secondary: "#1b5e20",
};

export function buildTheme(mode: ColorMode) {
  let theme = createTheme({
    palette: {
      mode,
      primary: { main: BRAND.primary },
      secondary: { main: BRAND.secondary },

      // חשוב לדרישה: "בדארק כל הרקע כהה"
      background:
        mode === "dark"
          ? {
              default: "#0f1210",
              paper: "#151a15",
            }
          : {
              default: "#ffffff",
              paper: "#ffffff",
            },
    },

    shape: { borderRadius: 12 },

    typography: {
      fontFamily: `"Rubik", "Heebo", "Arial", sans-serif`,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            direction: "rtl",
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none", // שומר רקע נקי גם בדארק
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 999,
          },
        },
      },
    },
  });

  theme = responsiveFontSizes(theme);
  return theme;
}

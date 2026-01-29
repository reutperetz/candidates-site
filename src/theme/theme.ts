// src/theme/theme.ts
import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { blueGrey, common, green, grey } from "@mui/material/colors";

export type ColorMode = "light" | "dark";

const BRAND = {
  primary: {
    light: green[700],
    dark: green[300],
  },
  secondary: {
    light: blueGrey[600],
    dark: blueGrey[300],
  },
};

export function buildTheme(mode: ColorMode) {
  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? BRAND.primary.dark : BRAND.primary.light,
      },
      secondary: {
        main: mode === "dark" ? BRAND.secondary.dark : BRAND.secondary.light,
      },

      // חשוב לדרישה: "בדארק כל הרקע כהה"
      background:
        mode === "dark"
          ? {
              default: blueGrey[900],
              paper: blueGrey[800],
            }
          : {
              default: grey[50],
              paper: common.white,
            },
    },

    shape: { borderRadius: 12 },

    typography: {
      fontFamily: `"Assistant", "Rubik", "Arial", sans-serif`,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            direction: "rtl",
            backgroundColor: mode === "dark" ? blueGrey[900] : grey[50],
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

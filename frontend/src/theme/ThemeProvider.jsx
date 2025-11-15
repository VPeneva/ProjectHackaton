import React, { createContext, useMemo, useState, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

export const ColorModeContext = createContext({
  mode: "system",
  setMode: () => {},
});

export default function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(
    localStorage.getItem("themeMode") || "system"
  );

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const effectiveMode =
    mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: effectiveMode,
        background: {
          default: effectiveMode === "dark" ? "#121212" : "#fafafa",
          paper: effectiveMode === "dark" ? "#1d1d1d" : "#ffffff",
        },
        text: {
          primary: effectiveMode === "dark" ? "#ffffff" : "#000000",
        },
      },

      components: {
        // ---------- TEXTFIELD ----------
        MuiTextField: {
          styleOverrides: {
            root: {
              "& .MuiOutlinedInput-root": {
                backgroundColor:
                  effectiveMode === "dark" ? "#2a2a2a" : "#ffffff",
                color: effectiveMode === "dark" ? "#fff" : "#000",
                borderRadius: 8,

                "& fieldset": {
                  borderColor:
                    effectiveMode === "dark" ? "#555" : "#cccccc",
                },
                "&:hover fieldset": {
                  borderColor:
                    effectiveMode === "dark" ? "#888" : "#666666",
                },
                "&.Mui-focused fieldset": {
                  borderColor:
                    effectiveMode === "dark" ? "#bbb" : "#1976d2",
                },
              },
            },
          },
        },

        // ---------- SELECT ----------
        MuiSelect: {
          styleOverrides: {
            select: {
              backgroundColor:
                effectiveMode === "dark" ? "#2a2a2a" : "#ffffff",
              color: effectiveMode === "dark" ? "#fff" : "#000",
              borderRadius: 8,
            },
            icon: {
              color: effectiveMode === "dark" ? "#fff" : "#000",
            },
          },
        },

        // ---------- MENU / DROPDOWN ----------
        MuiMenu: {
          styleOverrides: {
            paper: {
              backgroundColor:
                effectiveMode === "dark" ? "#2a2a2a" : "#ffffff",
              color: effectiveMode === "dark" ? "#fff" : "#000",
            },
          },
        },

        // ---------- INPUT BASE ----------
        MuiInputBase: {
          styleOverrides: {
            root: {
              backgroundColor:
                effectiveMode === "dark" ? "#2a2a2a" : "#ffffff",
              color: effectiveMode === "dark" ? "#fff" : "#000",
            },
          },
        },

        // ---------- CARD ----------
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor:
                effectiveMode === "dark" ? "#1e1e1e" : "#ffffff",
              color: effectiveMode === "dark" ? "#ffffff" : "#000000",
              borderRadius: 10,
            },
          },
        },

        // ---------- PAPER ----------
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor:
                effectiveMode === "dark" ? "#1e1e1e" : "#ffffff",
              color: effectiveMode === "dark" ? "#ffffff" : "#000000",
            },
          },
        },
      },
    });
  }, [effectiveMode]);

  const colorMode = useMemo(
    () => ({
      mode,
      setMode,
    }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

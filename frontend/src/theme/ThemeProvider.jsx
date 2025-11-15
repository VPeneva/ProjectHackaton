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

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: effectiveMode,
          background: {
            default: effectiveMode === "dark" ? "#121212" : "#fafafa",
            paper: effectiveMode === "dark" ? "#1d1d1d" : "#fff",
          },
        },
      }),
    [effectiveMode]
  );

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

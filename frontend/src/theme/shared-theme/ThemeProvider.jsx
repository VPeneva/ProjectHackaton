import React, { createContext, useMemo, useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export const ColorModeContext = createContext({
  mode: "system",         // "light" | "dark" | "system"
  setMode: () => {},      // setter
});

export default function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(
    localStorage.getItem("theme") || "system"
  );

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  const prefersDark = typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;

  const effectiveMode =
    mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: effectiveMode,
        },
      }),
    [effectiveMode]
  );

  const colorModeValue = useMemo(
    () => ({
      mode,
      setMode,
    }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorModeValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

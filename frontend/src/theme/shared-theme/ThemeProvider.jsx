import * as React from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { useState, useMemo } from "react";

export const ColorModeContext = React.createContext({
  mode: "system",
  setMode: () => {},
});

export default function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(
    localStorage.getItem("themeMode") || "system"
  );

  const colorMode = useMemo(
    () => ({
      mode,
      setMode: (newMode) => {
        localStorage.setItem("themeMode", newMode);
        setMode(newMode);
      },
    }),
    [mode]
  );

  const theme = useMemo(() => {
    let finalMode = mode;

    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      finalMode = prefersDark ? "dark" : "light";
    }

    return createTheme({
      palette: {
        mode: finalMode,
      },
    });
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

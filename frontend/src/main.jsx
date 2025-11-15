import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AppThemeProvider from "./theme/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";   // <--- липсваше!

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </AppThemeProvider>
);

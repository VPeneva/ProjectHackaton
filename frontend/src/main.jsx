import ReactDOM from "react-dom/client";
import App from "./App";
import AppThemeProvider from "./theme/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppThemeProvider>
    <AuthProvider>
      <Toaster position="top-center" />
      <App />
    </AuthProvider>
  </AppThemeProvider>
);

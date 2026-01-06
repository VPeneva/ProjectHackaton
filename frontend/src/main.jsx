import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider defaultTheme="system" storageKey="civicreport-theme">
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <App />
    </AuthProvider>
  </ThemeProvider>
);

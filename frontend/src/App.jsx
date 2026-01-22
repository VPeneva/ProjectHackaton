import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";

import Landing from "./pages/LandingPage";
import MapExplorer from "./pages/MapExplorer";
import UserDashboard from "./pages/UserDashboard";
import Reports from "./pages/Reports";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import CreateReport from "./pages/CreateReport";
import Admin from "./pages/Admin";
import About from "./pages/AboutUs";
import Legal from "./pages/Legal";

import ReportDetails from "./pages/ReportDetails";
import ContactUs from "./pages/ContactUs";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<MapExplorer />} />
        <Route path="/aboutus" element={<About />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Redirects for old routes */}
        <Route path="/terms" element={<Navigate to="/legal" replace />} />
        <Route path="/privacy" element={<Navigate to="/legal" replace />} />
        <Route path="/create" element={<Navigate to="/reports/new" replace />} />

        {/* PROTECTED USER ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/new"
          element={
            <ProtectedRoute>
              <CreateReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:id"
          element={
            <ProtectedRoute>
              <ReportDetails />
            </ProtectedRoute>
          }
        />
        {/* Keep old route for backwards compatibility */}
        <Route
          path="/report/:id"
          element={<Navigate to="/reports/:id" replace />}
        />

        {/* ADMIN ROUTES - Unified under /admin */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <Admin />
            </ProtectedAdminRoute>
          }
        />
        {/* Redirects for old admin routes */}
        <Route path="/admin/institutions" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/categories" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/resolved" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/contact-messages" element={<Navigate to="/admin" replace />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

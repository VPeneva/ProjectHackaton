import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";

import Reports from "./pages/Reports";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ResolvedReports from "./pages/ResolvedReports";

import CreateReport from "./pages/CreateReport";
import Admin from "./pages/Admin";
import ManageInstitutions from "./pages/ManageInstitutions";
import ManageCategories from "./pages/ManageCategories";
import BasePage from "./pages/BasePage";
import About from "./pages/AboutUs";
import Map from "./pages/Map";
import Terms from "./pages/TermsOfService"
import Privacy from "./pages/Legal"
import Features from "./pages/Features"
import FAQ from "./pages/FAQ"

import ReportDetails from "./pages/ReportDetails";
import ContactUs from "./pages/ContactUs";
import AdminContactMessages from "./pages/AdminContactPage";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<Reports />} />
        <Route path="/report/:id" element={<ReportDetails />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/basepage" element={<BasePage />} />

        <Route path="/map" element={<Map />} />

        <Route path="/aboutus" element={<About />} />
        <Route path="/terms" element={<Terms/>} />
        <Route path="/privacy" element={<Privacy/>} />
        <Route path="/contactus" element={<ContactUs/>} />

        <Route path="/features" element={<Features/>} />
        <Route path="/faq" element={<FAQ/>} />

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <Admin />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/institutions"
          element={
            <ProtectedAdminRoute>
              <ManageInstitutions />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedAdminRoute>
              <ManageCategories />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/resolved"
          element={
            <ProtectedAdminRoute>
              <ResolvedReports />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/contact-messages"
          element={
            <ProtectedAdminRoute>
              <AdminContactMessages />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    
      <Footer />
    </BrowserRouter>
  );
}

export default App;

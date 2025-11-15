import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";

import Reports from "./pages/Reports";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import CreateReport from "./pages/CreateReport";
import Admin from "./pages/Admin";
import ManageInstitutions from "./pages/ManageInstitutions";
import ManageCategories from "./pages/ManageCategories";
import ResolvedReports from "./pages/ResolvedReports";
import BasePage from "./pages/BasePage";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<Reports />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/basepage" element={<BasePage />} />

        <Route path="/about" element={<About />} />

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
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;

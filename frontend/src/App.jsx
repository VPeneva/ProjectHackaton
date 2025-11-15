import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateReport from "./pages/CreateReport";
import ResolvedReports from "./pages/ResolvedReports";
import Admin from "./pages/Admin";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ManageInstitutions from "./pages/ManageInstitutions";
import ManageCategories from "./pages/ManageCategories";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
//import CrudDashboard from "./pages/CrudDashboard";
// import DashboardLayout from "./components/DashboardLayout";
// import EmployeeList from "./components/EmployeeList";
// import EmployeeShow from "./components/EmployeeShow";
// import EmployeeCreate from "./components/EmployeeCreate";
// import EmployeeEdit from "./components/EmployeeEdit";
import Footer from "./components/Footer";
import AppTheme from "./shared-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";

function App(props) {
  return (
    <AppTheme {...props}>
      <BrowserRouter>
        <AppAppBar />
        {/* <Navbar /> */}

        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Reports />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED USER ROUTES */}
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateReport />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <Admin />
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

          {/* OPTIONAL EXTRA PAGES */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </AppTheme>
  );
}

export default App;

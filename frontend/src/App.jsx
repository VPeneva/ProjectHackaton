import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute"; 
import CreateReport from "./pages/CreateReport";
import SignUp from "./pages/SignUp";
import ResolvedReports from "./pages/ResolvedReports";
import Admin from "./pages/Admin";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ManageInstitutions from "./pages/ManageInstitutions";
import ManageCategories from "./pages/ManageCategories";
import AppAppBar from "./components/AppAppBar";
import AppTheme from "./shared-theme/AppTheme";
import SignIn from "./pages/SignIn";
import CrudDashboard from "./pages/CrudDashboard";
import DashboardLayout from "./components/DashboardLayout";
import EmployeeList from "./components/EmployeeList";
import EmployeeShow from "./components/EmployeeShow";
import EmployeeCreate from "./components/EmployeeCreate";
import EmployeeEdit from "./components/EmployeeEdit";
import Footer from "./components/Footer";


function App(props) {
  return (
    <AppTheme {...props}>
      <BrowserRouter>
        <Navbar />
        <AppAppBar />

      <Routes>
        <Route path="/" element={<Reports />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={ <ProtectedRoute> <CreateReport /> </ProtectedRoute> } />
        <Route path="/admin" element={ <ProtectedAdminRoute> <Admin /> </ProtectedAdminRoute> }/>
        <Route path="/admin/institutions"element={<ProtectedAdminRoute><ManageInstitutions /></ProtectedAdminRoute>}/>
        <Route path="/create" element={<ProtectedRoute> <CreateReport /> </ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedAdminRoute> <Admin /> </ProtectedAdminRoute>}/>
        <Route path="/admin" element={<ProtectedAdminRoute> <Admin /> </ProtectedAdminRoute>}/>
        <Route path="/admin/resolved" element={<ProtectedAdminRoute> <ResolvedReports /> </ProtectedAdminRoute>}/>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<CrudDashboard />}>
          <Route path="" element={<DashboardLayout />}>
            <Route index element={<EmployeeList />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/new" element={<EmployeeCreate />} />
            <Route path="employees/:employeeId" element={<EmployeeShow />} />
            <Route path="employees/:employeeId/edit" element={<EmployeeEdit />} />
            <Route path="*" element={<EmployeeList />} />
          </Route>
        </Route>
      </Routes>

        <Footer />
      </BrowserRouter>
    </AppTheme>
  );
}

export default App;

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
          <Route path="/admin/resolved" element={<ProtectedAdminRoute> <ResolvedReports /> </ProtectedAdminRoute>}/>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/admin/categories" element={<ProtectedAdminRoute> <ManageCategories /> </ProtectedAdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AppTheme>
  );
}

export default App;

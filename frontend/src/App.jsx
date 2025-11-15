import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute"; 
import CreateReport from "./pages/CreateReport";
import Admin from "./pages/Admin";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Reports />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={ <ProtectedRoute> <CreateReport /> </ProtectedRoute> } />
        <Route path="/admin" element={ <ProtectedAdminRoute> <Admin /> </ProtectedAdminRoute> }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

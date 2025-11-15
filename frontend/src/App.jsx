import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute"; 
import CreateReport from "./pages/CreateReport";
<<<<<<< HEAD
import SignUp from "./pages/SignUp";
=======
import Admin from "./pages/Admin";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

>>>>>>> 6e04ded88e3bcd32a8072f4835efa28688bdb572

function App() {
  return (
    <BrowserRouter>
      {/* <Navbar /> */}

      <Routes>
        <Route path="/" element={<Reports />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
<<<<<<< HEAD
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateReport />
            </ProtectedRoute>
          }
        />
=======
        <Route path="/create" element={ <ProtectedRoute> <CreateReport /> </ProtectedRoute> } />
        <Route path="/admin" element={ <ProtectedAdminRoute> <Admin /> </ProtectedAdminRoute> }/>
>>>>>>> 6e04ded88e3bcd32a8072f4835efa28688bdb572
      </Routes>
    </BrowserRouter>
  );
}

export default App;

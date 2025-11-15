import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Reports />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Example protected route */}
        {/* 
        <Route 
          path="/create" 
          element={
            <ProtectedRoute>
              <CreateReport />
            </ProtectedRoute>
          } 
        />
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

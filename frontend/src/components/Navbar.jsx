import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav
      style={{
        padding: "10px",
        background: "#000000ff",
        display: "flex",
        alignItems: "center",
        gap: "15px",
      }}
    >
      {/* Always visible */}
      <Link to="/">Reports</Link>

      {/* Logged-in users can create reports */}
      {user && (
        <Link to="/create" style={{ marginLeft: "10px" }}>
          Create Report
        </Link>
      )}

      {/* ADMIN ONLY: Admin Panel */}
      {user && user.role === "ADMIN" && (
        <Link to="/admin" style={{ marginLeft: "10px" }}>
          Admin Panel
        </Link>
      )}

      {/* ADMIN ONLY: Institutions management */}
      {user && user.role === "ADMIN" && (
        <Link to="/admin/institutions" style={{ marginLeft: "10px" }}>
          Institutions
        </Link>
      )}

      {/* Right side (auth section) */}
      <div style={{ marginLeft: "auto" }}>
        {user ? (
          <>
            <span>Hello, {user.name}</span>
            <button
              style={{ marginLeft: "20px" }}
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginLeft: "10px" }}>
              Login
            </Link>
            <Link to="/register" style={{ marginLeft: "10px" }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

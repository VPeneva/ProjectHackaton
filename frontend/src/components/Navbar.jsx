import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav
      style={{
        padding: "10px",
        background: "#ececec",
        display: "flex",
        alignItems: "center",
        gap: "15px",
      }}
    >
      {/* Always visible */}
      <Link to="/">Reports</Link>

      {/* Visible only if logged in */}
      {user && (
        <Link to="/create" style={{ marginLeft: "10px" }}>
          Create Report
        </Link>
      )}

      {/* Visible only for admin */}
      {user && user.role === "ADMIN" && (
        <Link to="/admin" style={{ marginLeft: "10px", fontWeight: "bold" }}>
          Admin Panel
        </Link>
      )}

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

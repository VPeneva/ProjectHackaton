import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={{ padding: "10px", background: "#ececec" }}>
      <Link to="/">Reports</Link>

      {user ? (
        <>
          <span style={{ marginLeft: "10px" }}>Hello, {user.name}</span>
          <button style={{ marginLeft: "20px" }} onClick={logout}>
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
    </nav>
  );
}

import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState(""); // за админ акаунт

  const submit = async (e) => {
    e.preventDefault();

    try {
      await register(name, email, password, adminKey);

      // 🔥 автоматичен login → редирект
      navigate("/");
    } catch (err) {     
      toast.error("Registration failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h2>Register</h2>

      <form
        onSubmit={submit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          placeholder="Admin Key (optional)"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

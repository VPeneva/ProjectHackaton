import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Зареждане на user от localStorage при refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    const { user, token } = res.data;

    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  // REGISTER — след регистрация автоматично логва потребителя
  const register = async (name, email, password, adminKey) => {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      adminKey
    });

    // 💡 backendът трябва да връща user + token (ще ти дам fix по-долу)
    const { user, token } = res.data;

    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // нашият backend
});

// автоматично добавяне на token към заявките
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

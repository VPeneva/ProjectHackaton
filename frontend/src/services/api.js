import axios from "axios";

// Vite exposes env variables on `import.meta.env` — use VITE_API_BASE_URL
// Create a `.env.local` (ignored) with `VITE_API_BASE_URL=http://host:port/api` to override locally.
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL
});

// автоматично добавяне на token към заявките
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

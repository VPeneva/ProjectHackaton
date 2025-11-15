import axios from "axios";

const api = axios.create({
  //baseURL: "http://localhost:5000/api" // - за локално тестване
  baseURL: "http://172.20.10.3:5000/api" //- само за хотспот-а
});

// автоматично добавяне на token към заявките
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
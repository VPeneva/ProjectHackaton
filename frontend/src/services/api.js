import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
  //baseURL: "http://localhost:5000/api" // - за локално тестване
  baseURL: "http://172.20.10.3:5000/api", //- само за хотспот-а
=======
  baseURL: "http://localhost:5000/api", // - за локално тестване
  //baseURL: "http://172.20.10.3:5000/api" //- само за хотспот-а
>>>>>>> 8742b43ab7f6006c62da2e68b59025c344fb103e
});

// автоматично добавяне на token към заявките
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5219/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gestionStockToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/login")) {
      localStorage.removeItem("gestionStockToken");
      localStorage.removeItem("gestionStockUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

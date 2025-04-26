import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // Usar siempre VITE_API_URL en producción
});

// Interceptor de respuestas para manejar expiración de token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // El token expiró o no es válido
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // Redirige automáticamente
    }
    return Promise.reject(error);
  }
);

export default api;

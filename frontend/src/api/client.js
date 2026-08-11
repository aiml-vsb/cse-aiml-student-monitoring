import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor – attach token from localStorage
api.interceptors.request.use(
  (config) => {
    // Try to get token from multiple sources
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      document.cookie?.split("; ").find((row) => row.startsWith("access_token="))?.split("=")[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      document.cookie = "access_token=; Max-Age=0; path=/";
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
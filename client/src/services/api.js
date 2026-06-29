import axios from "axios";

// Axios instance pointing to Express backend
// Falls back to mock data when server is not running
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach session token to every request
api.interceptors.request.use((config) => {
  const session = localStorage.getItem("ganeshEngineeringWorksSession");
  if (session) {
    config.headers["x-session"] = session;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

export default api;

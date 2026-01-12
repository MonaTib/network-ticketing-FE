import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8500"
});

// 🔐 ATTACH TOKEN TO EVERY REQUEST
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 GLOBAL AUTH ERROR HANDLING
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // ❌ Only logout for AUTH errors
    if (status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);


export default api;

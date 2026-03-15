import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        // Auth expired or invalid
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          localStorage.removeItem("token");
          window.dispatchEvent(new CustomEvent('show-toast', { 
            detail: { message: 'Your session has expired. Please login again.', type: 'error', title: 'Session Expired' } 
          }));
          setTimeout(() => {
            window.location.href = "/login?expired=true";
          }, 1500);
        }
      } else if (status === 429) {
        // Rate limited
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent('show-toast', { 
            detail: { message: 'You are moving too fast. Please slow down and try again in a minute.', type: 'warning', title: 'Slow Down' } 
          }));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

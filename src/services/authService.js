import axios from "axios"
import { API_URL } from "../config"

// For debugging
console.log("API URL:", API_URL);

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("Response error interceptor:", error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const authService = {
  login: async (email, password) => {
    try {
      // Use a direct axios call for debugging
      const response = await axios({
        method: 'post',
        url: `${API_URL}/auth/login`,
        data: { email, password },
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });
      
      console.log("Login successful:", response);
      
      // Store token if successful
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        request: error.request ? 'Request made but no response' : 'No request'
      });
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await API.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await API.post("/auth/refresh-token");
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  },
}
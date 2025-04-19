import axios from "axios"
import { API_URL } from "../config"

const API = axios.create({
  baseURL: API_URL,
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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const authService = {
  login: async (email, password) => {
    const response = await API.post("/auth/login", { email, password })
    return response.data
  },

  getCurrentUser: async () => {
    const response = await API.get("/auth/me")
    return response.data
  },

  refreshToken: async () => {
    const response = await API.post("/auth/refresh-token")
    localStorage.setItem("token", response.data.token)
    return response.data
  },
}


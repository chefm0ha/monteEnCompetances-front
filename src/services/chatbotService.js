import axios from "axios"
import { API_URL } from "../config"

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true
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

export const chatbotService = {
  sendMessage: async (message) => {
    try {
      const response = await API.post("/chatbot/message", { message })
      return response.data.response
    } catch (error) {
      console.error("Error sending message to chatbot:", error)
      throw error
    }
  },
}
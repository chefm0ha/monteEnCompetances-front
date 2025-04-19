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

export const formationService = {
  // Get all formations assigned to the current user
  getAssignedFormations: async () => {
    const response = await API.get("/formations/assigned")
    return response.data
  },

  // Get formation details by ID
  getFormationById: async (formationId) => {
    const response = await API.get(`/formations/${formationId}`)
    return response.data
  },

  // Get module details by ID
  getModuleById: async (formationId, moduleId) => {
    const response = await API.get(`/formations/${formationId}/modules/${moduleId}`)
    return response.data
  },

  // Mark content as read
  markContentAsRead: async (formationId, moduleId, contentId) => {
    const response = await API.post(`/formations/${formationId}/modules/${moduleId}/contents/${contentId}/read`)
    return response.data
  },

  // Get quiz for a module
  getQuiz: async (formationId, moduleId) => {
    const response = await API.get(`/formations/${formationId}/modules/${moduleId}/quiz`)
    return response.data
  },

  // Submit quiz answers
  submitQuiz: async (formationId, moduleId, answers) => {
    const response = await API.post(`/formations/${formationId}/modules/${moduleId}/quiz/submit`, { answers })
    return response.data
  },

  // Get user progress for a formation
  getFormationProgress: async (formationId) => {
    const response = await API.get(`/formations/${formationId}/progress`)
    return response.data
  },

  // Generate certificate for completed formation
  generateCertificate: async (formationId) => {
    const response = await API.get(`/formations/${formationId}/certificate`, { responseType: "blob" })
    return response.data
  },
}


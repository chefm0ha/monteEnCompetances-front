import axios from "axios"
import { API_URL } from "../config"

// Create axios instance with base configuration
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
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

export const collaborateurService = {
  // Get all collaborateurs with optional filtering
  getAllCollaborateurs: async (filters = {}) => {
    try {
      const response = await API.get("/api/collaborateurs", { params: filters })
      return response.data
    } catch (error) {
      console.error("Error fetching collaborateurs:", error)
      throw error
    }
  },

  // Get a collaborateur by ID
  getCollaborateurById: async (id) => {
    try {
      const response = await API.get(`/api/collaborateurs/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching collaborateur with ID ${id}:`, error)
      throw error
    }
  },

  // Create a new collaborateur
  createCollaborateur: async (collaborateurData) => {
    try {
      const response = await API.post("/api/collaborateurs", collaborateurData)
      return response.data
    } catch (error) {
      console.error("Error creating collaborateur:", error)
      
      // Check if the error is an email conflict (409 status code)
      if (error.response && error.response.status === 409) {
        const errorMessage = error.response.data
        throw { message: errorMessage, emailConflict: true }
      }
      throw error
    }
  },

  // Update a collaborateur
  updateCollaborateur: async (id, collaborateurData) => {
    try {
      const response = await API.put(`/api/collaborateurs/${id}`, collaborateurData)
      return response.data
    } catch (error) {
      console.error(`Error updating collaborateur with ID ${id}:`, error)
      
      // Check if the error is an email conflict (409 status code)
      if (error.response && error.response.status === 409) {
        const errorMessage = error.response.data
        throw { message: errorMessage, emailConflict: true }
      }
      throw error
    }
  },

  // Delete a collaborateur
  deleteCollaborateur: async (id) => {
    try {
      const response = await API.delete(`/api/collaborateurs/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting collaborateur with ID ${id}:`, error)
      throw error
    }
  },

  // Get collaborators by position
  getCollaborateursByPoste: async (poste) => {
    try {
      const collaborateurs = await collaborateurService.getAllCollaborateurs({ poste })
      return collaborateurs
    } catch (error) {
      console.error(`Error fetching collaborateurs by poste ${poste}:`, error)
      throw error
    }
  },

  // Get a collaborateur by email
  getCollaborateurByEmail: async (email) => {
    try {
      const response = await API.get(`/api/collaborateurs/email/${email}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching collaborateur with email ${email}:`, error)
      throw error
    }
  },

  // Get statistics about collaborateurs (for admin dashboard)
  getCollaborateursStats: async () => {
    try {
      const response = await API.get("/api/collaborateurs/stats")
      return response.data
    } catch (error) {
      console.error("Error fetching collaborateurs statistics:", error)
      throw error
    }
  },

  // Update collaborateur profile (Admin only)
  updateCollaborateurProfile: async (id, profileData) => {
    try {
      const response = await API.put(`/api/collaborateurs/profile/${id}`, profileData);
      return response.data;
    } catch (error) {
      console.error(`Error updating collaborateur profile with ID ${id}:`, error);
      
      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 409) {
          // Email already exists conflict
          throw new Error(data);
        } else if (status === 404) {
          throw new Error("Collaborateur not found");
        } else if (status === 400 && data.errors) {
          // Validation errors
          const validationErrors = data.errors.reduce((acc, error) => {
            acc[error.field] = error.message;
            return acc;
          }, {});
          const errorObj = new Error("Validation failed");
          errorObj.validationErrors = validationErrors;
          throw errorObj;
        }
      }
      throw error;
    }
  }
}
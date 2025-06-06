import axios from "axios"
import { API_URL } from "../config"

// API URL is configured from config.js

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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("userData")
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
      
      // Validate response
      
      // Validate the response structure
      if (!response.data || !response.data.token || !response.data.userDTO) {
        throw new Error("Invalid response format from server");
      }

      if (!response.data.userDTO.id) {
        throw new Error("User ID missing in response");
      }
      
      // Store token if successful
      localStorage.setItem("token", response.data.token);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await API.get("/auth/me");
      
      // Ensure the response has the required ID field
      if (!response.data || !response.data.id) {
        throw new Error("Invalid user data received from server");
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await API.post("/auth/refresh-token");
      
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile (firstName, lastName, email)
  updateProfile: async (profileData) => {
    try {
      const response = await API.put("/auth/profile", profileData);
      return response.data;
    } catch (error) {
      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 500 && data.message === "Email already exists") {
          throw new Error("Email already exists");
        } else if (status === 404) {
          throw new Error("User not found");
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
  },

  // Change user password
  changePassword: async (passwordData) => {
    try {
      const response = await API.put("/auth/change-password", passwordData);
      return response.data;
    } catch (error) {
      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.errors) {
            // Validation errors
            const validationErrors = data.errors.reduce((acc, error) => {
              acc[error.field] = error.message;
              return acc;
            }, {});
            const errorObj = new Error("Validation failed");
            errorObj.validationErrors = validationErrors;
            throw errorObj;
          } else {
            // Invalid current password or passwords don't match
            throw new Error("Invalid current password or passwords don't match");
          }
        }
      }
      throw error;
    }
  },
}
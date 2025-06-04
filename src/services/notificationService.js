// src/services/notificationService.js
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
    console.error("❌ Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Handle responses and errors
API.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error("❌ Notification API error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      responseData: error.response?.data
    })
    return Promise.reject(error)
  }
)

export const notificationService = {
  // ================================
  // USER NOTIFICATIONS
  // ================================

  /**
   * Get latest notifications for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Latest notifications
   */
  getLatestUserNotifications: async (userId) => {
    try {
      const response = await API.get(`/api/notifications/user/${userId}/latest`)
      return response.data
    } catch (error) {
      console.error(`Error fetching latest user notifications for ${userId}:`, error)
      throw error
    }
  },

  /**
   * Get a specific notification by ID
   * @param {string} userId - The user ID
   * @param {number} notificationId - The notification ID
   * @returns {Promise<Object>} - Notification details
   */
  getUserNotificationById: async (userId, notificationId) => {
    try {
      const response = await API.get(`/api/notifications/user/${userId}/${notificationId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching user notification ${notificationId}:`, error)
      throw error
    }
  },

  /**
   * Mark notifications as seen
   * @param {string} userId - The user ID
   * @param {Array<number>} notificationIds - Array of notification IDs
   * @returns {Promise<string>} - Success message
   */
  markUserNotificationsAsSeen: async (userId, notificationIds) => {
    try {
      const response = await API.put(`/api/notifications/user/${userId}/mark-seen`, notificationIds)
      return response.data
    } catch (error) {
      console.error(`Error marking user notifications as seen:`, error)
      throw error
    }
  },

  /**
   * Get all user notifications with pagination
   * @param {string} userId - The user ID
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Page size (default: 10)
   * @returns {Promise<Object>} - Paginated notifications
   */
  getAllUserNotifications: async (userId, page = 0, size = 10) => {
    try {
      const response = await API.get(`/api/notifications/user/${userId}/all`, {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching all user notifications:`, error)
      throw error
    }
  },

  /**
   * Get unseen notifications count
   * @param {string} userId - The user ID
   * @returns {Promise<number>} - Number of unseen notifications
   */
  getUnseenUserNotificationsCount: async (userId) => {
    try {
      const response = await API.get(`/api/notifications/user/${userId}/unseen-count`)
      return response.data
    } catch (error) {
      console.error(`Error fetching unseen user notifications count:`, error)
      throw error
    }
  },

  /**
   * Mark all notifications as seen
   * @param {string} userId - The user ID
   * @returns {Promise<string>} - Success message
   */
  markAllUserNotificationsAsSeen: async (userId) => {
    try {
      const response = await API.put(`/api/notifications/user/${userId}/mark-all-seen`)
      return response.data
    } catch (error) {
      console.error(`Error marking all user notifications as seen:`, error)
      throw error
    }
  },

  // ================================
  // ADMIN NOTIFICATIONS
  // ================================

  /**
   * Get latest notifications for an admin
   * @param {string} adminId - The admin ID
   * @returns {Promise<Array>} - Latest notifications
   */
  getLatestAdminNotifications: async (adminId) => {
    try {
      const response = await API.get(`/api/notifications/admin/${adminId}/latest`)
      return response.data
    } catch (error) {
      console.error(`Error fetching latest admin notifications for ${adminId}:`, error)
      throw error
    }
  },

  /**
   * Get a specific notification by ID for admin
   * @param {string} adminId - The admin ID
   * @param {number} notificationId - The notification ID
   * @returns {Promise<Object>} - Notification details
   */
  getAdminNotificationById: async (adminId, notificationId) => {
    try {
      const response = await API.get(`/api/notifications/admin/${adminId}/${notificationId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching admin notification ${notificationId}:`, error)
      throw error
    }
  },

  /**
   * Mark admin notifications as seen
   * @param {string} adminId - The admin ID
   * @param {Array<number>} notificationIds - Array of notification IDs
   * @returns {Promise<string>} - Success message
   */
  markAdminNotificationsAsSeen: async (adminId, notificationIds) => {
    try {
      const response = await API.put(`/api/notifications/admin/${adminId}/mark-seen`, notificationIds)
      return response.data
    } catch (error) {
      console.error(`Error marking admin notifications as seen:`, error)
      throw error
    }
  },

  /**
   * Get all admin notifications with pagination
   * @param {string} adminId - The admin ID
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Page size (default: 10)
   * @returns {Promise<Object>} - Paginated notifications
   */
  getAllAdminNotifications: async (adminId, page = 0, size = 10) => {
    try {
      const response = await API.get(`/api/notifications/admin/${adminId}/all`, {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching all admin notifications:`, error)
      throw error
    }
  },

  /**
   * Get unseen admin notifications count
   * @param {string} adminId - The admin ID
   * @returns {Promise<number>} - Number of unseen notifications
   */
  getUnseenAdminNotificationsCount: async (adminId) => {
    try {
      const response = await API.get(`/api/notifications/admin/${adminId}/unseen-count`)
      return response.data
    } catch (error) {
      console.error(`Error fetching unseen admin notifications count:`, error)
      throw error
    }
  },

  /**
   * Mark all admin notifications as seen
   * @param {string} adminId - The admin ID
   * @returns {Promise<string>} - Success message
   */
  markAllAdminNotificationsAsSeen: async (adminId) => {
    try {
      const response = await API.put(`/api/notifications/admin/${adminId}/mark-all-seen`)
      return response.data
    } catch (error) {
      console.error(`Error marking all admin notifications as seen:`, error)
      throw error
    }
  },

  // ================================
  // UNIFIED ENDPOINTS (OPTIONAL)
  // ================================

  /**
   * Get latest notifications (unified endpoint)
   * @param {string} userId - The user ID
   * @param {boolean} isAdmin - Whether the user is an admin
   * @returns {Promise<Array>} - Latest notifications
   */
  getLatestNotifications: async (userId, isAdmin = false) => {
    try {
      const response = await API.get(`/api/notifications/${userId}/latest`, {
        params: { isAdmin }
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching latest notifications:`, error)
      throw error
    }
  },

  /**
   * Get notification by ID (unified endpoint)
   * @param {string} userId - The user ID
   * @param {number} notificationId - The notification ID
   * @param {boolean} isAdmin - Whether the user is an admin
   * @returns {Promise<Object>} - Notification details
   */
  getNotificationById: async (userId, notificationId, isAdmin = false) => {
    try {
      const response = await API.get(`/api/notifications/${userId}/${notificationId}`, {
        params: { isAdmin }
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching notification ${notificationId}:`, error)
      throw error
    }
  },

  /**
   * Mark notifications as seen (unified endpoint)
   * @param {string} userId - The user ID
   * @param {Array<number>} notificationIds - Array of notification IDs
   * @param {boolean} isAdmin - Whether the user is an admin
   * @returns {Promise<string>} - Success message
   */
  markNotificationsAsSeen: async (userId, notificationIds, isAdmin = false) => {
    try {
      const response = await API.put(`/api/notifications/${userId}/mark-seen`, notificationIds, {
        params: { isAdmin }
      })
      return response.data
    } catch (error) {
      console.error(`Error marking notifications as seen:`, error)
      throw error
    }
  }
}
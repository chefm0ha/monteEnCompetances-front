// src/context/NotificationContext.jsx
"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { notificationService } from "../services/notificationService"
import { API_URL } from "../config"

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth()
  const [unseenCount, setUnseenCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const isAdmin = currentUser?.role === "ADMIN"
  // Debug log to track user state
  useEffect(() => {
    console.log("🔍 NotificationProvider - Auth state changed:", {
      currentUser: currentUser ? {
        id: currentUser.id,
        role: currentUser.role,
        email: currentUser.email,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        fullObject: currentUser
      } : null,
      authLoading,
      isAdmin
    })  }, [currentUser, authLoading, isAdmin])

  // Helper function to get user ID from currentUser object
  const getUserId = useCallback(() => {
    if (!currentUser) return null
    
    // Check common ID field names
    return currentUser.id || 
           currentUser.userId || 
           currentUser.uuid || 
           currentUser._id || 
           currentUser.sub ||
           null
  }, [currentUser])

  // Memoize the fetch functions to prevent unnecessary re-renders
  const fetchUnseenCount = useCallback(async () => {
    const userId = getUserId()
    if (!currentUser || !userId) {
      console.log("🔔 No current user or user ID, skipping unseen count fetch. User:", currentUser, "ID:", userId)
      setUnseenCount(0)
      return
    }

    try {
      console.log("🔔 Fetching unseen notifications count for user:", userId, "isAdmin:", isAdmin)
      console.log("🔔 API URL:", API_URL || "Not configured")
      
      const count = isAdmin 
        ? await notificationService.getUnseenAdminNotificationsCount(userId)
        : await notificationService.getUnseenUserNotificationsCount(userId)
      
      console.log("🔔 Unseen count received:", count)
      setUnseenCount(count)
    } catch (error) {
      console.error("❌ Error fetching unseen count:", error)
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data
      })
      // Don't reset count on error, keep previous value
    }
  }, [currentUser, isAdmin, getUserId])

  const fetchLatestNotifications = useCallback(async () => {
    if (!currentUser?.id) {
      console.log("🔔 No current user, skipping latest notifications fetch")
      setNotifications([])
      return
    }

    try {
      setLoading(true)
      console.log("🔔 Fetching latest notifications for user:", currentUser.id, "isAdmin:", isAdmin)
      
      const data = isAdmin 
        ? await notificationService.getLatestAdminNotifications(currentUser.id)
        : await notificationService.getLatestUserNotifications(currentUser.id)
      
      console.log("🔔 Latest notifications received:", data)
      setNotifications(data)
    } catch (error) {
      console.error("❌ Error fetching latest notifications:", error)
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data
      })
      // Don't clear notifications on error, keep previous ones
    } finally {
      setLoading(false)
    }  }, [currentUser?.id, isAdmin])

  // Fetch unseen count when user changes or component mounts
  useEffect(() => {
    // Don't fetch if auth is still loading
    if (authLoading) {
      console.log("🔔 Auth still loading, waiting...")
      return
    }
    
    const userId = getUserId()
    if (currentUser && userId) {
      console.log("🔔 User authenticated, fetching unseen count for user:", userId, "role:", currentUser.role)
      fetchUnseenCount()
    } else {
      console.log("🔔 No authenticated user or user ID, resetting notification state. User:", currentUser, "ID:", userId)
      setUnseenCount(0)
      setNotifications([])
    }
  }, [currentUser, authLoading, fetchUnseenCount, getUserId])

  // Set up polling for new notifications every 30 seconds
  useEffect(() => {
    // Don't start polling if auth is still loading or no user
    const userId = getUserId()
    if (authLoading || !currentUser || !userId) return

    console.log("🔔 Setting up notification polling for user:", userId)
    
    // Initial fetch
    fetchUnseenCount()
    
    // Set up interval
    const interval = setInterval(() => {
      console.log("🔔 Polling for new notifications...")
      fetchUnseenCount()
    }, 15000) // 15 seconds

    return () => {
      console.log("🔔 Cleaning up notification polling...")
      clearInterval(interval)
    }
  }, [currentUser, authLoading, fetchUnseenCount, getUserId])

  const markNotificationAsSeen = async (notificationId) => {
    const userId = getUserId()
    if (!currentUser || !userId) return false

    try {
      console.log("🔔 Marking notification as seen:", notificationId)
      
      if (isAdmin) {
        await notificationService.markAdminNotificationsAsSeen(userId, [notificationId])
      } else {
        await notificationService.markUserNotificationsAsSeen(userId, [notificationId])
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, seen: true } : n)
      )
      setUnseenCount(prev => Math.max(0, prev - 1))
      
      console.log("✅ Notification marked as seen successfully")
      return true
    } catch (error) {
      console.error("❌ Error marking notification as seen:", error)
      return false
    }
  }

  const markAllNotificationsAsSeen = async () => {
    const userId = getUserId()
    if (!currentUser || !userId) return false

    try {
      console.log("🔔 Marking all notifications as seen")
      
      if (isAdmin) {
        await notificationService.markAllAdminNotificationsAsSeen(userId)
      } else {
        await notificationService.markAllUserNotificationsAsSeen(userId)
      }
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, seen: true })))
      setUnseenCount(0)
      
      console.log("✅ All notifications marked as seen successfully")
      return true
    } catch (error) {
      console.error("❌ Error marking all notifications as seen:", error)
      return false
    }
  }

  const refreshNotifications = useCallback(() => {
    console.log("🔔 Manual refresh triggered")
    fetchUnseenCount()
    fetchLatestNotifications()
  }, [fetchUnseenCount, fetchLatestNotifications])

  const value = {
    notifications,
    unseenCount,
    loading,
    isAdmin,
    fetchLatestNotifications,
    markNotificationAsSeen,
    markAllNotificationsAsSeen,
    refreshNotifications,
    fetchUnseenCount
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
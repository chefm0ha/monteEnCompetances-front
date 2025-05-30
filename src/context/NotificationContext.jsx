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
        lastName: currentUser.lastName
      } : null,
      authLoading,
      isAdmin
    })
  }, [currentUser, authLoading, isAdmin])

  // Memoize the fetch functions to prevent unnecessary re-renders
  const fetchUnseenCount = useCallback(async () => {
    if (!currentUser?.id) {
      console.log("🔔 No current user or user ID, skipping unseen count fetch")
      setUnseenCount(0)
      return
    }

    try {
      console.log("🔔 Fetching unseen notifications count for user:", currentUser.id, "isAdmin:", isAdmin)
      console.log("🔔 API URL:", API_URL || "Not configured")
      
      const count = isAdmin 
        ? await notificationService.getUnseenAdminNotificationsCount(currentUser.id)
        : await notificationService.getUnseenUserNotificationsCount(currentUser.id)
      
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
  }, [currentUser?.id, isAdmin])

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
    }
  }, [currentUser?.id, isAdmin])

  // Fetch unseen count when user changes or component mounts
  useEffect(() => {
    // Don't fetch if auth is still loading
    if (authLoading) {
      console.log("🔔 Auth still loading, waiting...")
      return
    }
    
    if (currentUser?.id) {
      console.log("🔔 User authenticated, fetching unseen count for user:", currentUser.id, "role:", currentUser.role)
      fetchUnseenCount()
    } else {
      console.log("🔔 No authenticated user, resetting notification state")
      setUnseenCount(0)
      setNotifications([])
    }
  }, [currentUser?.id, authLoading, fetchUnseenCount])

  // Set up polling for new notifications every 15 seconds
  useEffect(() => {
    // Don't start polling if auth is still loading or no user
    if (authLoading || !currentUser?.id) return

    console.log("🔔 Setting up notification polling for user:", currentUser.id)
    
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
  }, [currentUser?.id, authLoading, fetchUnseenCount])

  const markNotificationAsSeen = async (notificationId) => {
    if (!currentUser?.id) return false

    try {
      console.log("🔔 Marking notification as seen:", notificationId)
      
      if (isAdmin) {
        await notificationService.markAdminNotificationsAsSeen(currentUser.id, [notificationId])
      } else {
        await notificationService.markUserNotificationsAsSeen(currentUser.id, [notificationId])
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
    if (!currentUser?.id) return false

    try {
      console.log("🔔 Marking all notifications as seen")
      
      if (isAdmin) {
        await notificationService.markAllAdminNotificationsAsSeen(currentUser.id)
      } else {
        await notificationService.markAllUserNotificationsAsSeen(currentUser.id)
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
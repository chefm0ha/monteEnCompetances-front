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
  
  // Memoize the fetch functions to prevent unnecessary re-renders
  const fetchUnseenCount = useCallback(async () => {
    if (!currentUser?.id) {
      setUnseenCount(0)
      return
    }    try {
      const count = isAdmin
        ? await notificationService.getUnseenAdminNotificationsCount(currentUser.id)        : await notificationService.getUnseenUserNotificationsCount(currentUser.id)
      
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
      setNotifications([])
      return
    }    try {
      setLoading(true)
      
      const data = isAdmin
        ? await notificationService.getLatestAdminNotifications(currentUser.id)        : await notificationService.getLatestUserNotifications(currentUser.id)
      
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
      return
    }
      if (currentUser?.id) {
      fetchUnseenCount()
    } else {
      setUnseenCount(0)
      setNotifications([])
    }
  }, [currentUser?.id, authLoading, fetchUnseenCount])

  // Set up polling for new notifications every 15 seconds
  useEffect(() => {    // Don't start polling if auth is still loading or no user
    if (authLoading || !currentUser?.id) return

    // Initial fetch
    fetchUnseenCount()
    // Set up interval
    const interval = setInterval(() => {
      fetchUnseenCount()
    }, 30000) // 30 seconds

    return () => {
      clearInterval(interval)
    }
  }, [currentUser?.id, authLoading, fetchUnseenCount])

  const markNotificationAsSeen = async (notificationId) => {
    if (!currentUser?.id) return false

    try {
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
      
      return true
    } catch (error) {
      console.error("❌ Error marking notification as seen:", error)
      return false
    }
  }
  const markAllNotificationsAsSeen = async () => {
    if (!currentUser?.id) return false

    try {
      if (isAdmin) {
        await notificationService.markAllAdminNotificationsAsSeen(currentUser.id)
      } else {
        await notificationService.markAllUserNotificationsAsSeen(currentUser.id)
      }
        // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, seen: true })))
      setUnseenCount(0)
      
      return true
    } catch (error) {
      console.error("❌ Error marking all notifications as seen:", error)
      return false
    }
  }
  const refreshNotifications = useCallback(() => {
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
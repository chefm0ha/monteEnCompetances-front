// src/components/shared/NotificationDropdown.jsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useNotifications } from "../../context/NotificationContext"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "./theme-provider"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { ScrollArea } from "../ui/scroll-area"
import { Badge } from "../ui/badge"
import { Bell, Loader2, CheckCircle, AlertCircle, Info, RefreshCw } from "lucide-react"
import { cn } from "../../lib/utils"

const NotificationDropdown = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { theme } = useTheme()
  const {
    notifications,
    unseenCount,
    loading,
    fetchLatestNotifications,
    markNotificationAsSeen,
    markAllNotificationsAsSeen,
    refreshNotifications
  } = useNotifications()
  
  const [open, setOpen] = useState(false)

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open) {
      fetchLatestNotifications()
    }
  }, [open, fetchLatestNotifications])

  const handleNotificationClick = async (notification) => {
    if (!notification.seen) {
      await markNotificationAsSeen(notification.id)
    }
  }

  const handleMarkAllAsSeen = async () => {
    await markAllNotificationsAsSeen()
  }

  const handleRefresh = () => {
    refreshNotifications()
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className={cn("h-4 w-4", theme === "dark" ? "text-green-400" : "text-green-500")} />
      case 'ERROR':
        return <AlertCircle className={cn("h-4 w-4", theme === "dark" ? "text-red-400" : "text-red-500")} />
      case 'WARNING':
        return <AlertCircle className={cn("h-4 w-4", theme === "dark" ? "text-yellow-400" : "text-yellow-500")} />
      case 'INFO':
      default:
        return <Info className={cn("h-4 w-4", theme === "dark" ? "text-blue-400" : "text-blue-500")} />
    }
  }

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now - date
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return "À l'instant"
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    if (diffInDays < 7) return `Il y a ${diffInDays}j`
      return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-muted hover:text-accent-foreground h-9 px-3">
          <Bell className="h-5 w-5" />
          {unseenCount > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground text-[10px] font-bold min-w-[16px] border-2 border-background">
              {unseenCount > 99 ? '99+' : unseenCount}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "w-80 border shadow-lg rounded-md p-0",
          theme === "dark" ? "bg-[#1a1f3c]" : "bg-white"
        )}
        sideOffset={8}
      >
        <div className={cn(
          "flex items-center justify-between p-4 border-b",
          theme === "dark" ? "bg-[#1a1f3c]" : "bg-white"
        )}>
          <DropdownMenuLabel className="text-base font-semibold p-0">
            Notifications
          </DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            {unseenCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsSeen}
                className="text-xs h-7 px-2"
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className={cn(
          "h-96",
          theme === "dark" ? "bg-[#1a1f3c]" : "bg-white"
        )}>
          {loading ? (
            <div className={cn(
              "flex items-center justify-center py-8",
              theme === "dark" ? "bg-[#1a1f3c]" : "bg-white"
            )}>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className={cn(
              "flex flex-col items-center justify-center py-8 text-center",
              theme === "dark" ? "bg-[#1a1f3c]" : "bg-white"
            )}>
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Aucune notification</p>
            </div>
          ) : (
            <div className={cn(
              "py-2",
              theme === "dark" ? "bg-[#1a1f3c]" : "bg-white"
            )}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-start gap-3 p-3 hover:bg-muted cursor-pointer transition-colors border-b border-border last:border-b-0 relative",
                    !notification.seen && (theme === "dark" ? "bg-primary/15" : "bg-primary/10")
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type || 'INFO')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm leading-5",
                      !notification.seen ? "font-medium" : "text-muted-foreground"
                    )}>
                      {notification.titre}
                    </p>
                    {notification.contenu && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.contenu}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.seen && (
                    <div className="absolute right-3 top-3">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        theme === "dark" ? "bg-blue-500" : "bg-blue-600"
                      )}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />        <div className={cn(
          "p-2",
          theme === "dark" ? "bg-[#1a1f3c]" : "bg-white"
        )}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={() => {
              setOpen(false)
              // Navigate to different notification pages based on user role
              if (currentUser?.role === 'ADMIN') {
                navigate('/admin/notifications')
              } else {
                navigate('/notifications')
              }
            }}
          >
            Voir toutes les notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationDropdown
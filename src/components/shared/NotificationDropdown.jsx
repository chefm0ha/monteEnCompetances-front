// src/components/shared/NotificationDropdown.jsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useNotifications } from "../../context/NotificationContext"
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
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'WARNING':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'INFO':
      default:
        return <Info className="h-4 w-4 text-blue-500" />
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
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unseenCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unseenCount > 99 ? '99+' : unseenCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-white border shadow-lg rounded-md p-0"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b">
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

        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Aucune notification</p>
            </div>
          ) : (
            <div className="py-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0",
                    !notification.seen && "bg-blue-50"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm leading-5",
                      !notification.seen ? "font-medium text-gray-900" : "text-gray-700"
                    )}>
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.seen && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={() => {
              setOpen(false)
              navigate('/admin/notifications')
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
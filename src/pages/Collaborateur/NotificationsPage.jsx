// src/pages/Collaborateur/NotificationsPage.jsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNotifications } from "../../context/NotificationContext"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { 
  Bell, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Search,
  RefreshCw,
  Check,
  Calendar,
  ArrowLeft
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { notificationService } from "../../services/notificationService"
import { cn } from "../../lib/utils"

const NotificationsPage = () => {
  const { currentUser } = useAuth()
  const { unseenCount, refreshNotifications } = useNotifications()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const pageSize = 20

  useEffect(() => {
    fetchNotifications()
  }, [currentPage, activeTab])

  const fetchNotifications = async () => {
    if (!currentUser?.id) return

    try {
      setLoading(true)
      console.log("📄 Fetching user notifications page:", currentPage, "size:", pageSize, "for user:", currentUser.id)
      
      const response = await notificationService.getAllUserNotifications(
        currentUser.id, 
        currentPage, 
        pageSize
      )
      
      console.log("📄 User notifications page response:", response)
      
      setNotifications(response.content || [])
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
    } catch (error) {
      console.error("❌ Error fetching user notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsSeen = async (notificationIds) => {
    if (!currentUser?.id) return

    try {
      await notificationService.markUserNotificationsAsSeen(currentUser.id, notificationIds)
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => 
          notificationIds.includes(n.id) ? { ...n, seen: true } : n
        )
      )
      
      // Clear selection
      setSelectedNotifications([])
      
      // Refresh unseen count
      refreshNotifications()
    } catch (error) {
      console.error("Error marking notifications as seen:", error)
    }
  }

  const handleMarkAllAsSeen = async () => {
    if (!currentUser?.id) return

    try {
      await notificationService.markAllUserNotificationsAsSeen(currentUser.id)
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, seen: true })))
      
      // Refresh unseen count
      refreshNotifications()
    } catch (error) {
      console.error("Error marking all notifications as seen:", error)
    }
  }

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId)
      } else {
        return [...prev, notificationId]
      }
    })
  }

  const handleSelectAll = () => {
    const visibleNotificationIds = filteredNotifications.map(n => n.id)
    if (selectedNotifications.length === visibleNotificationIds.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(visibleNotificationIds)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'WARNING':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'INFO':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.contenu?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab = activeTab === "all" || 
      (activeTab === "unread" && !notification.seen) ||
      (activeTab === "read" && notification.seen)

    return matchesSearch && matchesTab
  })

  const unseenNotifications = notifications.filter(n => !n.seen)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Mes notifications</h1>
          <p className="text-gray-500">
            Consultez toutes vos notifications
            {unseenCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unseenCount} non lues
              </Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              console.log("🔄 Manual refresh clicked")
              fetchNotifications()
              refreshNotifications()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          {unseenCount > 0 && (
            <Button onClick={handleMarkAllAsSeen}>
              <Check className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher une notification..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {selectedNotifications.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {selectedNotifications.length} sélectionnée(s)
                </span>
                <Button
                  size="sm"
                  onClick={() => handleMarkAsSeen(selectedNotifications)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marquer comme lues
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications tabs and list */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Toutes ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Non lues ({unseenNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="read">
            Lues ({notifications.length - unseenNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {activeTab === "all" && "Toutes les notifications"}
                  {activeTab === "unread" && "Notifications non lues"}
                  {activeTab === "read" && "Notifications lues"}
                </CardTitle>
                {filteredNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedNotifications.length === filteredNotifications.length 
                      ? "Désélectionner tout" 
                      : "Sélectionner tout"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune notification
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === "unread" 
                      ? "Vous n'avez aucune notification non lue."
                      : activeTab === "read"
                        ? "Vous n'avez aucune notification lue."
                        : "Vous n'avez aucune notification pour le moment."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                        !notification.seen ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200",
                        selectedNotifications.includes(notification.id) && "ring-2 ring-primary ring-offset-2"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1"
                      />
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type || 'INFO')}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={cn(
                              "text-sm font-medium",
                              !notification.seen ? "text-gray-900" : "text-gray-700"
                            )}>
                              {notification.titre}
                            </h4>
                            {notification.contenu && (
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.contenu}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatNotificationTime(notification.createdAt)}
                              </div>
                              {!notification.seen && (
                                <Badge variant="secondary" className="text-xs">
                                  Non lue
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {!notification.seen && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsSeen([notification.id])}
                              className="text-xs"
                            >
                              Marquer comme lue
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Page {currentPage + 1} sur {totalPages} 
                    ({totalElements} notifications au total)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default NotificationsPage

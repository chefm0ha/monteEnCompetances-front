import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, RefreshCw, Activity, Server, Clock, Users } from 'lucide-react'
import { chatbotService } from '../../services/chatbotService'

const ChatbotAdmin = () => {
  const [healthStatus, setHealthStatus] = useState(null)
  const [serviceInfo, setServiceInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastCheck, setLastCheck] = useState(null)

  useEffect(() => {
    checkServiceStatus()
  }, [])

  const checkServiceStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const [health, info] = await Promise.all([
        chatbotService.healthCheck(),
        chatbotService.getServiceInfo()
      ])

      setHealthStatus(health)
      setServiceInfo(info)
      setLastCheck(new Date())
    } catch (err) {
      setError(err.message || 'Erreur lors de la vérification du service')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'UP':
        return 'bg-green-500'
      case 'DOWN':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Non disponible'
    return new Date(timestamp).toLocaleString('fr-FR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Administration Chatbot</h2>
          <p className="text-muted-foreground">
            Surveillance et gestion du service de chatbot
          </p>
        </div>
        <Button onClick={checkServiceStatus} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Actualiser
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Service Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>État du service</span>
          </CardTitle>
          <CardDescription>
            Statut en temps réel du service de chatbot
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthStatus ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(healthStatus.status)}`} />
                <Badge variant={healthStatus.status === 'UP' ? 'default' : 'destructive'}>
                  {healthStatus.status === 'UP' ? 'En ligne' : 'Hors ligne'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Service: {healthStatus.service}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Dernière vérification</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimestamp(healthStatus.timestamp)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Fonctionnalités</p>
                  <p className="text-sm text-muted-foreground">
                    {healthStatus.features || 'Non spécifiées'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Vérification en cours...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Informations du service</span>
          </CardTitle>
          <CardDescription>
            Détails techniques et capacités du chatbot
          </CardDescription>
        </CardHeader>
        <CardContent>
          {serviceInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Service</p>
                  <p className="text-sm text-muted-foreground">{serviceInfo.service}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Version</p>
                  <p className="text-sm text-muted-foreground">{serviceInfo.version}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{serviceInfo.description}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Mémoire</p>
                  <p className="text-sm text-muted-foreground">{serviceInfo.memory}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Capacités</p>
                <p className="text-sm text-muted-foreground">{serviceInfo.capabilities}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Chargement des informations...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Gestion des sessions</span>
          </CardTitle>
          <CardDescription>
            Informations sur les sessions actives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Session courante: {chatbotService.getCurrentSessionId()?.substring(0, 16) + '...' || 'Aucune'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Les sessions sont automatiquement créées lors de la première interaction
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Check Info */}
      {lastCheck && (
        <div className="text-xs text-muted-foreground text-center">
          Dernière actualisation: {lastCheck.toLocaleString('fr-FR')}
        </div>
      )}
    </div>
  )
}

export default ChatbotAdmin

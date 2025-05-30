// src/pages/Collaborateur/MesFormations.jsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { formationService } from "../../services/formationService"
import { useAuth } from "../../context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { 
  Loader2, 
  AlertCircle, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowRight,
  Play,
  Download,
  Award
} from "lucide-react"

const MesFormations = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchFormations()
  }, [])

  const fetchFormations = async () => {
    try {
      setLoading(true)
      // Use the existing service method for assigned formations
      const data = await formationService.getAssignedFormations()
      setFormations(data)
    } catch (error) {
      console.error("Error fetching formations:", error)
      setError("Impossible de récupérer vos formations. Veuillez réessayer plus tard.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (formation) => {
    if (formation.progress === 100) {
      return <Badge className="bg-green-500">Terminée</Badge>
    } else if (formation.progress > 0) {
      return <Badge className="bg-blue-500">En cours</Badge>
    } else {
      return <Badge className="bg-gray-500">Non commencée</Badge>
    }
  }

  const getStatusIcon = (formation) => {
    if (formation.progress === 100) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (formation.progress > 0) {
      return <Clock className="h-5 w-5 text-blue-500" />
    } else {
      return <Play className="h-5 w-5 text-gray-500" />
    }
  }

  const filteredFormations = () => {
    switch (activeTab) {
      case "in-progress":
        return formations.filter((f) => f.progress > 0 && f.progress < 100)
      case "completed":
        return formations.filter((f) => f.progress === 100)
      case "not-started":
        return formations.filter((f) => f.progress === 0)
      default:
        return formations
    }
  }

  const getStats = () => {
    const completed = formations.filter((f) => f.progress === 100).length
    const inProgress = formations.filter((f) => f.progress > 0 && f.progress < 100).length
    const notStarted = formations.filter((f) => f.progress === 0).length

    return { completed, inProgress, notStarted, total: formations.length }
  }

  const stats = getStats()

  const handleFormationClick = (formation) => {
    navigate(`/formation/${formation.id}`)
  }

  const handleDownloadCertificate = (formation, event) => {
    event.stopPropagation()
    navigate(`/formation/${formation.id}/certificate`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes formations</h1>
        <p className="text-gray-500">
          Consultez et suivez vos formations assignées
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">formations assignées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">formations commencées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">formations complétées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">À démarrer</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notStarted}</div>
            <p className="text-xs text-muted-foreground">formations non commencées</p>
          </CardContent>
        </Card>
      </div>

      {/* Formations Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Toutes ({stats.total})</TabsTrigger>
          <TabsTrigger value="not-started">À démarrer ({stats.notStarted})</TabsTrigger>
          <TabsTrigger value="in-progress">En cours ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value="completed">Terminées ({stats.completed})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredFormations().length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune formation dans cette catégorie
              </h3>
              <p className="text-gray-500">
                {activeTab === "all" 
                  ? "Aucune formation ne vous a été assignée pour le moment."
                  : `Vous n'avez aucune formation ${
                      activeTab === "not-started" ? "à démarrer" :
                      activeTab === "in-progress" ? "en cours" :
                      "terminée"
                    }.`
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFormations().map((formation) => (
                <Card 
                  key={formation.id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => handleFormationClick(formation)}
                >
                  <div className="relative">
                    <img
                      src={formation.lienPhoto || "/course_placeholder.png"}
                      alt={formation.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(formation)}
                    </div>
                    <div className="absolute top-3 right-3">
                      {getStatusIcon(formation)}
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{formation.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {formation.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formation.duration || 0} heures</span>
                      </div>
                      <span>{formation.type}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span>{formation.progress || 0}%</span>
                      </div>
                      <Progress value={formation.progress || 0} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {formation.completedModules || 0} / {formation.totalModules || 0} modules complétés
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFormationClick(formation)}
                      >
                        {formation.progress === 0 ? "Commencer" : "Continuer"}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                      
                      {formation.progress === 100 && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => handleDownloadCertificate(formation, e)}
                        >
                          <Award className="mr-1 h-4 w-4" />
                          Certificat
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MesFormations
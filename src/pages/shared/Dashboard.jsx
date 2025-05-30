// src/pages/shared/Dashboard.jsx
"use client"

import { useState, useEffect } from "react"
import { formationService } from "../../services/formationService"
import { useAuth } from "../../context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { 
  Loader2, 
  AlertCircle, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Award,
  Play,
  BarChart,
  Target
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const data = await formationService.getAssignedFormations()
        setFormations(data)
      } catch (error) {
        console.warn("Couldn't fetch formations from API, using mock data", error)
        // Mock data for development
        setFormations([
          {
            id: "formation1",
            title: "Introduction à la cybersécurité",
            description: "Les bases de la sécurité informatique pour les nouveaux collaborateurs",
            progress: 75,
            completedModules: 3,
            totalModules: 4,
            duration: 8,
            type: "Sécurité",
            lienPhoto: "/course_placeholder.png"
          },
          {
            id: "formation2", 
            title: "RGPD et protection des données",
            description: "Comprendre les enjeux de la protection des données personnelles",
            progress: 100,
            completedModules: 5,
            totalModules: 5,
            duration: 4,
            type: "Conformité",
            lienPhoto: "/course_placeholder.png"
          },
          {
            id: "formation3",
            title: "Outils collaboratifs",
            description: "Maîtriser les outils de collaboration en ligne",
            progress: 0,
            completedModules: 0,
            totalModules: 3,
            duration: 6,
            type: "Technique",
            lienPhoto: "/course_placeholder.png"
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchFormations()
  }, [])

  const getStats = () => {
    const completed = formations.filter((f) => f.progress === 100).length
    const inProgress = formations.filter((f) => f.progress > 0 && f.progress < 100).length
    const notStarted = formations.filter((f) => f.progress === 0).length
    const totalHours = formations.reduce((sum, f) => sum + (f.duration || 0), 0)
    const completedHours = formations
      .filter(f => f.progress === 100)
      .reduce((sum, f) => sum + (f.duration || 0), 0)

    return { completed, inProgress, notStarted, total: formations.length, totalHours, completedHours }
  }

  const stats = getStats()

  // Get recent formations (in progress or to start)
  const getRecentFormations = () => {
    return formations
      .filter(f => f.progress < 100)
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .slice(0, 3)
  }

  const getCompletedFormations = () => {
    return formations.filter(f => f.progress === 100).slice(0, 3)
  }

  const handleFormationClick = (formationId) => {
    navigate(`/formation/${formationId}`)
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Bonjour, {currentUser?.firstName} ! 👋
            </h1>
            <p className="text-blue-100">
              Continuez votre parcours de formation et développez vos compétences
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 rounded-lg p-4">
              <BarChart className="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Formations assignées</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalHours}h au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              formations commencées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedHours}h complétées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progression globale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              de réussite
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Continue Learning Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Continuer l'apprentissage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getRecentFormations().length === 0 ? (
              <div className="text-center py-6">
                <Target className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">Toutes vos formations sont terminées !</p>
                <Button 
                  className="mt-3" 
                  onClick={() => navigate('/mes-formations')}
                >
                  Voir toutes mes formations
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {getRecentFormations().map((formation) => (
                  <div 
                    key={formation.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleFormationClick(formation.id)}
                  >
                    <img
                      src={formation.lienPhoto || "/course_placeholder.png"}
                      alt={formation.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-1">{formation.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={formation.progress || 0} className="h-2 flex-1" />
                        <span className="text-xs text-gray-500">{formation.progress || 0}%</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/mes-formations')}
                >
                  Voir toutes mes formations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Mes accomplissements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getCompletedFormations().length === 0 ? (
              <div className="text-center py-6">
                <Award className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">Aucune formation terminée pour le moment</p>
                <p className="text-sm text-gray-400 mt-1">
                  Complétez vos formations pour obtenir vos premiers certificats !
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getCompletedFormations().map((formation) => (
                  <div 
                    key={formation.id}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-green-50 border-green-200"
                  >
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900">{formation.title}</h4>
                      <p className="text-sm text-green-700">Formation terminée • {formation.duration}h</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-100"
                      onClick={() => navigate(`/formation/${formation.id}/certificate`)}
                    >
                      Certificat
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/mes-certificats')}
                >
                  Voir tous mes certificats
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => navigate('/mes-formations')}
            >
              <BookOpen className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Mes formations</div>
                <div className="text-xs text-gray-500">Voir toutes mes formations</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => navigate('/mes-certificats')}
            >
              <Award className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Mes certificats</div>
                <div className="text-xs text-gray-500">Télécharger mes certificats</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => navigate('/profile')}
            >
              <CheckCircle className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Mon profil</div>
                <div className="text-xs text-gray-500">Gérer mes informations</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => {
                // Find first formation in progress or not started
                const nextFormation = formations.find(f => f.progress < 100)
                if (nextFormation) {
                  handleFormationClick(nextFormation.id)
                } else {
                  navigate('/mes-formations')
                }
              }}
            >
              <Play className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Continuer</div>
                <div className="text-xs text-gray-500">Reprendre ma formation</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
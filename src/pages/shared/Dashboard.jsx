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
        setLoading(true)
        
        // Check if user has the required ID
        if (!currentUser?.id) {
          console.error("❌ Current user ID missing:", currentUser);
          setError("Impossible de charger les données utilisateur. Veuillez vous reconnecter.");
          return;
        }

        console.log("🔍 Fetching formations for user:", currentUser.id);
        const data = await formationService.getAssignedFormations()
        console.log("✅ Formations loaded:", data);
        setFormations(data)
        setError(null)
      } catch (error) {
        console.error("❌ Error fetching formations:", error)
        
        // Provide more specific error handling
        if (error.response?.status === 401) {
          setError("Session expirée. Veuillez vous reconnecter.")
          // Optionally redirect to login
        } else if (error.response?.status === 404) {
          // User might not have any formations assigned
          setFormations([])
          setError(null)
        } else {
          setError("Impossible de récupérer vos formations. Veuillez réessayer plus tard.")
        }
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if user is available and has required data
    if (currentUser?.id) {
      fetchFormations()
    } else if (!loading) {
      setError("Données utilisateur manquantes. Veuillez vous reconnecter.")
      setLoading(false)
    }
  }, [currentUser])

  const getStats = () => {
    if (!formations.length) {
      return { completed: 0, inProgress: 0, notStarted: 0, total: 0, totalHours: 0, completedHours: 0 }
    }

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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement de vos formations...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
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
              {formations.length > 0 
                ? "Continuez votre parcours de formation et développez vos compétences"
                : "Bienvenue sur votre plateforme de formation"
              }
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

      {/* No formations state */}
      {formations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune formation assignée
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Vous n'avez pas encore de formations assignées. 
              Contactez votre administrateur pour obtenir l'accès aux formations.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/mes-formations')}
            >
              Voir mes formations
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Main Content Grid */
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
                        onError={(e) => {
                          e.target.src = "/course_placeholder.png"
                        }}
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
      )}

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
              disabled={formations.length === 0}
            >
              <Play className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Continuer</div>
                <div className="text-xs text-gray-500">
                  {formations.length === 0 ? "Aucune formation" : "Reprendre ma formation"}
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
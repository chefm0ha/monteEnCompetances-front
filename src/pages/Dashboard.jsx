"use client"

import { useState, useEffect } from "react"
import { formationService } from "../services/formationService"
import { useAuth } from "../context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Loader2, AlertCircle, BookOpen, CheckCircle, Clock } from "lucide-react"
import FormationCard from "../components/FormationCard"
import UserDebugInfo from "../components/UserDebugInfo"

const Dashboard = () => {
  const { currentUser } = useAuth()
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        // Pour le développement, utilisons des données fictives si l'API n'est pas disponible
        try {
          const data = await formationService.getAssignedFormations()
          setFormations(data)
        } catch (apiError) {
          console.warn("Couldn't fetch formations from API, using mock data", apiError)
          // Données fictives pour le développement
          setFormations([
            {
              id: "formation1",
              title: "Introduction à la cybersécurité",
              description: "Les bases de la sécurité informatique pour les nouveaux collaborateurs",
              progress: 75,
              completedModules: 3,
              totalModules: 4,
              duration: 8,
            },
            {
              id: "formation2",
              title: "RGPD et protection des données",
              description: "Comprendre les enjeux de la protection des données personnelles",
              progress: 100,
              completedModules: 5,
              totalModules: 5,
              duration: 4,
            },
            {
              id: "formation3",
              title: "Outils collaboratifs",
              description: "Maîtriser les outils de collaboration en ligne",
              progress: 0,
              completedModules: 0,
              totalModules: 3,
              duration: 6,
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching formations:", error)
        setError("Impossible de récupérer vos formations. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchFormations()
  }, [])

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
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-gray-500">Bienvenue, {currentUser?.firstName}. Voici vos formations.</p>
      </div>

      {/* Composant de débogage pour afficher les informations utilisateur */}
      <UserDebugInfo />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Formations en cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">sur {stats.total} formations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Formations terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">sur {stats.total} formations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Formations à démarrer</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notStarted}</div>
            <p className="text-xs text-muted-foreground">sur {stats.total} formations</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Toutes ({stats.total})</TabsTrigger>
            <TabsTrigger value="in-progress">En cours ({stats.inProgress})</TabsTrigger>
            <TabsTrigger value="completed">Terminées ({stats.completed})</TabsTrigger>
            <TabsTrigger value="not-started">À démarrer ({stats.notStarted})</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-6">
            {filteredFormations().length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Aucune formation dans cette catégorie.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredFormations().map((formation) => (
                  <FormationCard key={formation.id} formation={formation} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard

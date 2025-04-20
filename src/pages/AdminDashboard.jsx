"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, AlertCircle, Users, BookOpen, BarChart, PieChart } from "lucide-react"
import { formationService } from "../services/formationService"
import { collaborateurService } from "../services/collaborateurService"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"

// Importation de Chart.js pour les graphiques
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import { Bar, Pie } from "react-chartjs-2"

// Enregistrement des composants Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const AdminDashboard = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  // États pour les données
  const [formationsStats, setFormationsStats] = useState(null)
  const [collaborateursStats, setCollaborateursStats] = useState(null)

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    if (currentUser && currentUser.role !== "ADMIN") {
      navigate("/dashboard")
      return
    }

    const fetchData = async () => {
      try {
        // Charger les statistiques des formations
        try {
          const formationsData = await formationService.getFormationsStats()
          setFormationsStats(formationsData)
        } catch (error) {
          console.warn("Couldn't fetch formations stats, using mock data", error)
          // Données fictives pour le développement
          setFormationsStats({
            totalFormations: 12,
            completedFormations: 45,
            inProgressFormations: 78,
            notStartedFormations: 23,
            formationsParCategorie: {
              IT: 5,
              "Soft Skills": 3,
              Management: 2,
              RGPD: 1,
              Sécurité: 1,
            },
            formationsRecentes: [
              { id: 1, title: "Cybersécurité pour débutants", completions: 15 },
              { id: 2, title: "RGPD et protection des données", completions: 22 },
              { id: 3, title: "Management d'équipe", completions: 8 },
            ],
          })
        }

        // Charger les statistiques des collaborateurs
        try {
          const collaborateursData = await collaborateurService.getCollaborateursStats()
          setCollaborateursStats(collaborateursData)
        } catch (error) {
          console.warn("Couldn't fetch collaborateurs stats, using mock data", error)
          // Les données fictives sont déjà gérées dans le service
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Impossible de récupérer les données du tableau de bord. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentUser, navigate])

  // Préparation des données pour les graphiques
  const prepareChartData = () => {
    // Graphique des formations par catégorie
    const formationsCategoriesData = {
      labels: formationsStats ? Object.keys(formationsStats.formationsParCategorie) : [],
      datasets: [
        {
          label: "Nombre de formations",
          data: formationsStats ? Object.values(formationsStats.formationsParCategorie) : [],
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    }

    // Graphique des collaborateurs par poste
    const collaborateursPostesData = {
      labels: collaborateursStats ? Object.keys(collaborateursStats.postes) : [],
      datasets: [
        {
          label: "Nombre de collaborateurs",
          data: collaborateursStats ? Object.values(collaborateursStats.postes) : [],
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    }

    // Graphique des collaborateurs par département
    const collaborateursDepartementsData = {
      labels: collaborateursStats ? Object.keys(collaborateursStats.departements) : [],
      datasets: [
        {
          label: "Nombre de collaborateurs",
          data: collaborateursStats ? Object.values(collaborateursStats.departements) : [],
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    }

    // Graphique de progression des formations
    const formationsProgressionData = {
      labels: ["Terminées", "En cours", "Non commencées"],
      datasets: [
        {
          label: "Nombre de formations",
          data: formationsStats
            ? [
                formationsStats.completedFormations,
                formationsStats.inProgressFormations,
                formationsStats.notStartedFormations,
              ]
            : [0, 0, 0],
          backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
          borderColor: ["rgba(75, 192, 192, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
      ],
    }

    return {
      formationsCategoriesData,
      collaborateursPostesData,
      collaborateursDepartementsData,
      formationsProgressionData,
    }
  }

  const chartData = prepareChartData()

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
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord administrateur</h1>
        <p className="text-gray-500">Bienvenue, {currentUser?.firstName}. Voici une vue d'ensemble de la plateforme.</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="formations">Formations</TabsTrigger>
          <TabsTrigger value="collaborateurs">Collaborateurs</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Formations</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formationsStats?.totalFormations || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Collaborateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collaborateursStats?.totalCollaborateurs || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Formations terminées</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formationsStats?.completedFormations || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Formations en cours</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formationsStats?.inProgressFormations || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Formations par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar
                    data={chartData.formationsCategoriesData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collaborateurs par département</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Pie
                    data={chartData.collaborateursDepartementsData}
                    options={{
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Derniers collaborateurs inscrits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Nom</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Poste</th>
                      <th className="text-left py-3 px-4">Département</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collaborateursStats?.collaborateursRecents?.map((collab) => (
                      <tr key={collab.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {collab.firstName} {collab.lastName}
                        </td>
                        <td className="py-3 px-4">{collab.email}</td>
                        <td className="py-3 px-4">{collab.poste}</td>
                        <td className="py-3 px-4">{collab.departement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Formations */}
        <TabsContent value="formations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progression des formations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Pie
                  data={chartData.formationsProgressionData}
                  options={{
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formations récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Titre</th>
                      <th className="text-left py-3 px-4">Complétions</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formationsStats?.formationsRecentes?.map((formation) => (
                      <tr key={formation.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{formation.title}</td>
                        <td className="py-3 px-4">{formation.completions}</td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/formations/${formation.id}`)}
                          >
                            Détails
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Collaborateurs */}
        <TabsContent value="collaborateurs" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => navigate("/admin/collaborateurs/new")}>Ajouter un collaborateur</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Collaborateurs par poste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar
                  data={chartData.collaborateursPostesData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liste des collaborateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Nom</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Poste</th>
                      <th className="text-left py-3 px-4">Département</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collaborateursStats?.collaborateursRecents?.map((collab) => (
                      <tr key={collab.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {collab.firstName} {collab.lastName}
                        </td>
                        <td className="py-3 px-4">{collab.email}</td>
                        <td className="py-3 px-4">{collab.poste}</td>
                        <td className="py-3 px-4">{collab.departement}</td>
                        <td className="py-3 px-4 flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/collaborateurs/${collab.id}`)}
                          >
                            Éditer
                          </Button>
                          <Button variant="destructive" size="sm">
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Statistiques */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Formations par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar
                    data={chartData.formationsCategoriesData}
                    options={{
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progression des formations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Pie
                    data={chartData.formationsProgressionData}
                    options={{
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collaborateurs par poste</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar
                    data={chartData.collaborateursPostesData}
                    options={{
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collaborateurs par département</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Pie
                    data={chartData.collaborateursDepartementsData}
                    options={{
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard

// src/pages/Admin/ModuleEdit.jsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../../components/ui/tabs"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  AlertCircle,
  FileText,
  HelpCircle
} from "lucide-react"
import { moduleService } from "../../services/moduleService"
import { formationService } from "../../services/formationService"
import { quizService } from "../../services/quizService"
import Swal from 'sweetalert2'
import ModuleSupportsManager from "../../components/ModuleSupportsManager"
import QuizManager from "../../components/Admin/QuizManager"

const ModuleEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("details")
  const [formations, setFormations] = useState([])
  const [module, setModule] = useState({
    titre: "",
    description: "",
    formationId: "",
    supports: [],
    quizs: []
  })
  const [moduleSupports, setModuleSupports] = useState([])
  const [moduleQuiz, setModuleQuiz] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch formations for the dropdown
      const formationsData = await formationService.getAllFormations()
      setFormations(formationsData)

      // If editing, fetch module data
      if (id) {
        const moduleData = await moduleService.getModuleById(id)
        setModule(moduleData)
        
        // Set supports
        setModuleSupports(moduleData.supports || [])
        
        // Fetch quiz data with questions
        try {
          const quizzesWithQuestions = await quizService.getQuizzesByModule(id)
          if (quizzesWithQuestions && quizzesWithQuestions.length > 0) {
            setModuleQuiz(quizzesWithQuestions[0])
          } else {
            setModuleQuiz(null)
          }
        } catch (quizError) {
          console.error("Error fetching quiz data:", quizError)
          setModuleQuiz(null)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Impossible de charger les données du module.")
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de charger les données.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setModule(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (value) => {
    setModule(prev => ({
      ...prev,
      formationId: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!module.titre.trim()) {
      setError("Le titre est requis.")
      setActiveTab("details")
      return
    }

    if (!module.formationId) {
      setError("Veuillez sélectionner une formation.")
      setActiveTab("details")
      return
    }

    try {
      setSaving(true)
      
      const moduleData = {
        titre: module.titre,
        description: module.description,
        formationId: module.formationId
      }
      
      if (id) {
        await moduleService.updateModule(id, moduleData)
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Module mis à jour avec succès.'
        })
      } else {
        const response = await moduleService.createModule({ formationId: module.formationId }, moduleData)
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Module créé avec succès.'
        })
        // Redirect to edit the newly created module
        navigate(`/admin/modules/${response.id}`)
        return
      }
    } catch (error) {
      console.error("Error saving module:", error)
      setError("Impossible de sauvegarder le module.")
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de sauvegarder le module.'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSupports = (updatedSupports) => {
    setModuleSupports(updatedSupports)
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: 'Les contenus du module ont été mis à jour avec succès.'
    })
  }

  const handleUpdateQuiz = async (updatedQuiz) => {
    try {
      // Refresh quiz data to get the latest version
      const quizzesWithQuestions = await quizService.getQuizzesByModule(id)
      if (quizzesWithQuestions && quizzesWithQuestions.length > 0) {
        setModuleQuiz(quizzesWithQuestions[0])
      } else {
        setModuleQuiz(null)
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Le quiz du module a été mis à jour avec succès.'
      })
    } catch (error) {
      console.error("Error updating quiz:", error)
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la mise à jour du quiz.'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/admin/modules")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {id ? "Modifier le module" : "Nouveau module"}
          </h1>
          {id && module.titre && (
            <p className="text-gray-500 mt-1">{module.titre}</p>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="contents" disabled={!id}>
            Contenus ({moduleSupports.length})
          </TabsTrigger>
          <TabsTrigger value="quiz" disabled={!id}>
            Quiz {moduleQuiz ? "✓" : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du module</CardTitle>
              <CardDescription>
                Modifiez les informations de base du module
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre</Label>
                  <Input
                    id="titre"
                    name="titre"
                    value={module.titre}
                    onChange={handleChange}
                    placeholder="Entrez le titre du module"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={module.description}
                    onChange={handleChange}
                    placeholder="Entrez la description du module"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formationId">Formation</Label>
                  <Select
                    value={module.formationId}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une formation" />
                    </SelectTrigger>
                    <SelectContent>
                      {formations.map((formation) => (
                        <SelectItem key={formation.id} value={formation.id}>
                          {formation.titre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/modules")}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {id ? "Mise à jour..." : "Création..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {id ? "Mettre à jour" : "Créer"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contents" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gestion des contenus
              </CardTitle>
              <CardDescription>
                Ajoutez et gérez les supports pédagogiques de ce module (PDF, vidéos, textes)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!id ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Sauvegardez d'abord le module pour pouvoir ajouter des contenus.
                  </AlertDescription>
                </Alert>
              ) : (
                <ModuleSupportsManager
                  moduleId={id}
                  initialSupports={moduleSupports}
                  onSave={handleUpdateSupports}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Gestion du quiz
              </CardTitle>
              <CardDescription>
                Créez et gérez un quiz d'évaluation pour ce module
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!id ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Sauvegardez d'abord le module pour pouvoir ajouter un quiz.
                  </AlertDescription>
                </Alert>
              ) : (
                <QuizManager
                  moduleId={id}
                  initialQuiz={moduleQuiz}
                  onSave={handleUpdateQuiz}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick info panel for existing modules */}
      {id && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{moduleSupports.length}</span>
                  <span className="text-gray-600">contenu(s)</span>
                </div>
                <div className="flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{moduleQuiz ? "1" : "0"}</span>
                  <span className="text-gray-600">quiz</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Module ID: {id}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ModuleEdit
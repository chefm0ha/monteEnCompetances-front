"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Switch } from "../components/ui/switch"
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"
import { moduleService } from "../services/moduleService"
import { formationService } from "../services/formationService"
import { useToast } from "../components/ui/use-toast"

const ModuleEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formations, setFormations] = useState([])
  const [module, setModule] = useState({
    title: "",
    formationId: "",
    hasQuiz: false,
    quiz: {
      title: "",
      questions: []
    },
    contents: []
  })

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
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données."
      })
      navigate("/admin/modules")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (id) {
        await moduleService.updateModule(id, module)
        toast({
          title: "Succès",
          description: "Module mis à jour avec succès."
        })
      } else {
        await moduleService.createModule(module)
        toast({
          title: "Succès",
          description: "Module créé avec succès."
        })
      }
      navigate("/admin/modules")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder le module."
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setModule(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleQuizToggle = (checked) => {
    setModule(prev => ({
      ...prev,
      hasQuiz: checked,
      quiz: checked ? { title: "", questions: [] } : null
    }))
  }

  const handleQuizChange = (e) => {
    const { name, value } = e.target
    setModule(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        [name]: value
      }
    }))
  }

  const addQuestion = () => {
    setModule(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: [
          ...prev.quiz.questions,
          {
            id: Date.now(),
            title: "",
            choices: [
              { text: "", isCorrect: false },
              { text: "", isCorrect: false }
            ]
          }
        ]
      }
    }))
  }

  const removeQuestion = (questionId) => {
    setModule(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.filter(q => q.id !== questionId)
      }
    }))
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
        <Button variant="ghost" onClick={() => navigate("/admin/modules")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {id ? "Modifier le module" : "Nouveau module"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations du module</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                name="title"
                value={module.title}
                onChange={handleChange}
                placeholder="Entrez le titre du module"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formationId">Formation</Label>
              <Select
                value={module.formationId}
                onValueChange={(value) => handleChange({ target: { name: "formationId", value } })}
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

            <div className="flex items-center space-x-2">
              <Switch
                id="hasQuiz"
                checked={module.hasQuiz}
                onCheckedChange={handleQuizToggle}
              />
              <Label htmlFor="hasQuiz">Inclure un quiz</Label>
            </div>
          </CardContent>
        </Card>

        {module.hasQuiz && (
          <Card>
            <CardHeader>
              <CardTitle>Configuration du quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quizTitle">Titre du quiz</Label>
                <Input
                  id="quizTitle"
                  name="title"
                  value={module.quiz.title}
                  onChange={handleQuizChange}
                  placeholder="Entrez le titre du quiz"
                  required={module.hasQuiz}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Questions</Label>
                  <Button type="button" variant="outline" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une question
                  </Button>
                </div>

                {module.quiz.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <Label>Question {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <Input
                        value={question.title}
                        onChange={(e) => {
                          const newQuestions = [...module.quiz.questions]
                          newQuestions[index].title = e.target.value
                          handleQuizChange({
                            target: { name: "questions", value: newQuestions }
                          })
                        }}
                        placeholder="Entrez la question"
                        className="mb-2"
                        required={module.hasQuiz}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/modules")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {id ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ModuleEdit 
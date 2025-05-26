"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
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
import { ArrowLeft, Loader2 } from "lucide-react"
import { moduleService } from "../../services/moduleService"
import { formationService } from "../../services/formationService"
import { useToast } from "../../hooks/use-toast"

const ModuleEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formations, setFormations] = useState([])
  const [module, setModule] = useState({
    titre: "",
    description: "", // Added description field
    formationId: "",
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

    if (!module.titre.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le titre est requis."
      })
      return
    }

    if (!module.formationId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner une formation."
      })
      return
    }

    try {
      setSaving(true)
      if (id) {
        await moduleService.updateModule(id, module)
        toast({
          title: "Succès",
          description: "Module mis à jour avec succès."
        })
      } else {
        await moduleService.createModule({ formationId: module.formationId }, module)
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
          </CardContent>
        </Card>

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
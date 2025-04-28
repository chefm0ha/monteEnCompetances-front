"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { formationService } from "../services/formationService"
import { useToast } from "../components/ui/use-toast"

const FormationEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formation, setFormation] = useState({
    title: "",
    description: "",
    duration: "",
  })

  useEffect(() => {
    if (id) {
      fetchFormation()
    }
  }, [id])

  const fetchFormation = async () => {
    try {
      setLoading(true)
      const data = await formationService.getFormationById(id)
      setFormation(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la formation."
      })
      navigate("/admin/formations")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (id) {
        await formationService.updateFormation(id, formation)
        toast({
          title: "Succès",
          description: "Formation mise à jour avec succès."
        })
      } else {
        await formationService.createFormation(formation)
        toast({
          title: "Succès",
          description: "Formation créée avec succès."
        })
      }
      navigate("/admin/formations")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder la formation."
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormation(prev => ({
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
        <Button variant="ghost" onClick={() => navigate("/admin/formations")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {id ? "Modifier la formation" : "Nouvelle formation"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la formation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                name="title"
                value={formation.title}
                onChange={handleChange}
                placeholder="Entrez le titre de la formation"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formation.description}
                onChange={handleChange}
                placeholder="Entrez la description de la formation"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée (en heures)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="0"
                step="0.5"
                value={formation.duration}
                onChange={handleChange}
                placeholder="Entrez la durée de la formation"
                required
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/formations")}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {id ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default FormationEdit 
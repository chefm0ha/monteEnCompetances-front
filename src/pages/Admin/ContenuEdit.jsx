"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { ArrowLeft, Loader2, Upload } from "lucide-react"
import { contenuService } from "../../services/contenuService"
import { moduleService } from "../../services/moduleService"
import { formationService } from "../../services/formationService"
import { useToast } from "../../hooks/use-toast"

const ContenuEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modules, setModules] = useState([])
  const [formations, setFormations] = useState([])
  const [selectedFormation, setSelectedFormation] = useState("")
  const [filteredModules, setFilteredModules] = useState([])
  const [contenu, setContenu] = useState({
    title: "",
    description: "",
    type: "TEXT", // PDF, TEXT, VIDEO
    content: "",
    fileUrl: "",
    duration: "",
    moduleId: ""
  })
  const [file, setFile] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  useEffect(() => {
    // Filter modules based on selected formation
    if (selectedFormation) {
      const modulesForFormation = modules.filter(m => m.formationId === selectedFormation)
      setFilteredModules(modulesForFormation)
      // Reset module selection if current module is not in the filtered list
      if (!modulesForFormation.find(m => m.id === contenu.moduleId)) {
        setContenu(prev => ({ ...prev, moduleId: "" }))
      }
    } else {
      setFilteredModules(modules)
    }
  }, [selectedFormation, modules])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [modulesData, formationsData] = await Promise.all([
        moduleService.getAllModules(),
        formationService.getAllFormations()
      ])
      setModules(modulesData)
      setFormations(formationsData)

      if (id) {
        const contenuData = await contenuService.getContenuById(id)
        setContenu(contenuData)
        // Set selected formation based on module
        const module = modulesData.find(m => m.id === contenuData.moduleId)
        if (module) {
          setSelectedFormation(module.formationId)
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données."
      })
      navigate("/admin/contenus")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)

      // Handle file upload if there's a new file
      if (file && (contenu.type === "PDF" || contenu.type === "VIDEO")) {
        const fileUrl = await contenuService.uploadFile(file)
        setContenu(prev => ({ ...prev, fileUrl }))
      }

      if (id) {
        await contenuService.updateContenu(id, contenu)
        toast({
          title: "Succès",
          description: "Contenu mis à jour avec succès."
        })
      } else {
        await contenuService.createContenu(contenu)
        toast({
          title: "Succès",
          description: "Contenu créé avec succès."
        })
      }
      navigate("/admin/contenus")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder le contenu."
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setContenu(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFile(file)
      // Update the content with the file name
      setContenu(prev => ({
        ...prev,
        content: file.name
      }))
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
        <Button variant="ghost" onClick={() => navigate("/admin/contenus")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {id ? "Modifier le contenu" : "Nouveau contenu"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations du contenu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                name="title"
                value={contenu.title}
                onChange={handleChange}
                placeholder="Entrez le titre du contenu"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={contenu.description}
                onChange={handleChange}
                placeholder="Entrez la description du contenu"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de contenu</Label>
              <Select
                value={contenu.type}
                onValueChange={(value) => handleChange({ target: { name: "type", value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="TEXT">Texte</SelectItem>
                  <SelectItem value="VIDEO">Vidéo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée (en minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={contenu.duration}
                onChange={handleChange}
                placeholder="Entrez la durée estimée"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Formation</Label>
              <Select
                value={selectedFormation}
                onValueChange={setSelectedFormation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une formation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select_formation">Sélectionnez une formation</SelectItem>
                  {formations.map((formation) => (
                    <SelectItem key={formation.id} value={formation.id}>
                      {formation.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moduleId">Module</Label>
              <Select
                value={contenu.moduleId}
                onValueChange={(value) => handleChange({ target: { name: "moduleId", value } })}
                disabled={!selectedFormation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select_module">Sélectionnez un module</SelectItem>
                  {filteredModules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {contenu.type === "TEXT" ? (
              <div className="space-y-2">
                <Label htmlFor="content">Contenu</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={contenu.content}
                  onChange={handleChange}
                  placeholder="Entrez le contenu textuel"
                  className="min-h-[200px]"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="file">Fichier ({contenu.type})</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    accept={contenu.type === "PDF" ? ".pdf" : "video/*"}
                    onChange={handleFileChange}
                    className="flex-1"
                    required={!id}
                  />
                  {contenu.fileUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.open(contenu.fileUrl, "_blank")}
                    >
                      Voir le fichier actuel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/contenus")}
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

export default ContenuEdit 
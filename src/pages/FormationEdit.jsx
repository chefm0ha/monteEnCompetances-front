"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../components/ui/tabs"
import { Alert, AlertDescription } from "../components/ui/alert"
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  Video, 
  Eye, 
  Pencil, 
  MoveUp, 
  MoveDown, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2
} from "lucide-react"
import { formationService } from "../services/formationService"
import { moduleService } from "../services/moduleService"
import { useToast } from "../hooks/use-toast"
import ImageUpload from "../components/ImageUpload"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog"

const FormationEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [error, setError] = useState(null)
  const [formation, setFormation] = useState({
    titre: "",
    description: "",
    duree: "",
    type: "",
    lienPhoto: null,
    imageFile: null
  })
  const [modules, setModules] = useState([])
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [newModule, setNewModule] = useState({
    title: "",
    description: "",
    formationId: ""
  })
  const [modulesChanged, setModulesChanged] = useState(false)
  
  const formationTypes = [
    "Technique",
    "Management",
    "Soft Skills",
    "Conformité",
    "Sécurité",
    "Autre"
  ]

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
      
      // Fetch modules for this formation
      try {
        const modulesData = await moduleService.getModulesByFormation(id)
        setModules(modulesData)
      } catch (moduleError) {
        console.error("Erreur lors de la récupération des modules:", moduleError)
        // If modules fetch fails, we still have the formation data
        setModules([])
        toast({
          variant: "warning",
          title: "Avertissement",
          description: "Impossible de récupérer les modules de la formation."
        })
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la formation:", error)
      setError("Impossible de récupérer les détails de la formation.")
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la formation."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormation(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSelectChange = (value) => {
    setFormation(prev => ({
      ...prev,
      type: value
    }))
  }
  
  const handleImageSelected = (imageFile) => {
    setFormation(prev => ({
      ...prev,
      imageFile: imageFile
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formation.titre.trim()) {
      setError("Le titre est obligatoire")
      setActiveTab("details")
      return
    }
    
    if (!formation.description.trim()) {
      setError("La description est obligatoire")
      setActiveTab("details")
      return
    }
    
    if (!formation.type) {
      setError("Le type de formation est obligatoire")
      setActiveTab("details")
      return
    }

    if (!formation.duree || isNaN(formation.duree) || Number(formation.duree) <= 0) {
      setError("Veuillez entrer une durée valide (en heures)")
      setActiveTab("details")
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      let response
      if (id) {
        // Update existing formation
        response = await formationService.updateFormation(id, formation)
        
        // If modules order was changed, save that too
        if (modulesChanged) {
          await saveModulesOrder()
        }
        
        toast({
          title: "Formation mise à jour",
          description: "La formation a été mise à jour avec succès."
        })
      } else {
        // Create new formation
        response = await formationService.createFormation(formation)
        toast({
          title: "Formation créée",
          description: "La formation a été créée avec succès."
        })
      }
      
      // Navigate to the formation details page
      setTimeout(() => {
        navigate(`/admin/formations/${response.id || id}`)
      }, 500)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la formation:", error)
      setError("Impossible de sauvegarder la formation. Veuillez réessayer plus tard.")
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder la formation."
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddModule = () => {
    if (!id) {
      toast({
        variant: "destructive",
        title: "Information",
        description: "Veuillez d'abord sauvegarder la formation avant d'ajouter des modules."
      })
      return
    }
    
    setNewModule({
      title: "",
      description: "",
      formationId: id
    })
    setIsModuleDialogOpen(true)
  }

  const handleModuleInputChange = (e) => {
    const { name, value } = e.target
    setNewModule(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateModule = async () => {
    // Validation
    if (!newModule.title.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le titre du module est obligatoire."
      })
      return
    }

    try {
      const moduleData = {
        ...newModule,
        formationId: id
      }
      
      const response = await moduleService.createModule(moduleData)
      toast({
        title: "Module ajouté",
        description: "Le module a été ajouté avec succès."
      })
      
      // Add the new module to the list
      setModules([...modules, response])
      
      // Close dialog
      setIsModuleDialogOpen(false)
      setNewModule({
        title: "",
        description: "",
        formationId: id
      })
    } catch (error) {
      console.error("Erreur lors de l'ajout du module:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le module."
      })
    }
  }

  const handleMoveModuleUp = (index) => {
    if (index === 0) return
    
    const updatedModules = [...modules]
    const module = updatedModules[index]
    updatedModules[index] = updatedModules[index - 1]
    updatedModules[index - 1] = module
    
    setModules(updatedModules)
    setModulesChanged(true)
  }

  const handleMoveModuleDown = (index) => {
    if (index === modules.length - 1) return
    
    const updatedModules = [...modules]
    const module = updatedModules[index]
    updatedModules[index] = updatedModules[index + 1]
    updatedModules[index + 1] = module
    
    setModules(updatedModules)
    setModulesChanged(true)
  }

  const saveModulesOrder = async () => {
    if (!modulesChanged) return
    
    try {
      setSaving(true)
      
      // Extract the module IDs in the new order
      const moduleIds = modules.map(module => module.id)
      
      // Use the formationService to update the module order
      await formationService.reorderModules(id, moduleIds)
      
      setModulesChanged(false)
      
      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des modules a été mis à jour avec succès."
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'ordre des modules:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour l'ordre des modules."
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditModule = (module) => {
    navigate(`/admin/modules/${module.id}`)
  }

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) {
      return
    }
    
    try {
      await moduleService.deleteModule(moduleId)
      toast({
        title: "Module supprimé",
        description: "Le module a été supprimé avec succès."
      })
      
      // Remove module from the list
      setModules(modules.filter(m => m.id !== moduleId))
    } catch (error) {
      console.error("Erreur lors de la suppression du module:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le module."
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/admin/formations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {id ? "Modifier la formation" : "Nouvelle formation"}
          </h1>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="modules" disabled={!id}>Modules</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la formation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre</Label>
                <Input
                  id="titre"
                  name="titre"
                  value={formation.titre}
                  onChange={handleChange}
                  placeholder="Entrez le titre de la formation"
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
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formation.type}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {formationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duree">Durée (en heures)</Label>
                  <Input
                    id="duree"
                    name="duree"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formation.duree}
                    onChange={handleChange}
                    placeholder="Entrez la durée de la formation"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Image de la formation</Label>
                <ImageUpload 
                  onImageSelected={handleImageSelected}
                  initialImage={formation.lienPhoto}
                />
              </div>
              
              <div className="flex justify-end mt-6">
                <Button type="button" onClick={handleSubmit} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {id ? "Mise à jour..." : "Création..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {id ? "Mettre à jour" : "Créer la formation"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="modules" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Modules de la formation</CardTitle>
                <CardDescription>
                  Gérez les modules de cette formation. Vous pouvez réorganiser les modules en utilisant les flèches.
                </CardDescription>
              </div>
              <Button onClick={handleAddModule}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un module
              </Button>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <div className="text-center py-10 border rounded-md bg-gray-50">
                  <p className="text-gray-500">Aucun module dans cette formation.</p>
                  <p className="text-sm text-gray-400">Cliquez sur "Ajouter un module" pour commencer.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <div 
                      key={module.id} 
                      className="border rounded-md p-4 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium">{module.title}</h3>
                          <p className="text-gray-500 text-sm mt-1">{module.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {module.contents?.length || 0} contenus
                            </span>
                            {module.hasQuiz && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Quiz
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMoveModuleUp(index)}
                            disabled={index === 0 || saving}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMoveModuleDown(index)}
                            disabled={index === modules.length - 1 || saving}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditModule(module)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {modulesChanged && (
                <div className="mt-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      L'ordre des modules a été modifié. N'oubliez pas de sauvegarder pour appliquer les changements.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-end mt-4">
                    <Button onClick={saveModulesOrder} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Sauvegarder l'ordre
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Ajouter un module</DialogTitle>
            <DialogDescription>
              Créez un nouveau module pour cette formation. Vous pourrez ajouter du contenu après la création.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="moduleTitle">Titre du module</Label>
              <Input
                id="moduleTitle"
                name="title"
                value={newModule.title}
                onChange={handleModuleInputChange}
                placeholder="Entrez le titre du module"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="moduleDescription">Description</Label>
              <Textarea
                id="moduleDescription"
                name="description"
                value={newModule.description}
                onChange={handleModuleInputChange}
                placeholder="Entrez une description du module"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateModule}>
              Créer le module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FormationEdit
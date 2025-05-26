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
  Save, 
  Plus, 
  Trash2, 
  Pencil, 
  MoveUp, 
  MoveDown, 
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle
} from "lucide-react"
import { formationService } from "../../services/formationService"
import { moduleService } from "../../services/moduleService"
import Swal from 'sweetalert2'
import ImageUpload from "../../components/shared/ImageUpload"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import ModuleSupportsManager from "../../components/ModuleSupportsManager"
import QuizManager from "../../components/Admin/QuizManager"
import { quizService } from "../../services/quizService";

const FormationEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [error, setError] = useState(null)
  const [formation, setFormation] = useState({
    titre: "",
    description: "",
    type: "",
    lienPhoto: null,
    imageFile: null
  })
  const [modules, setModules] = useState([])
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [newModule, setNewModule] = useState({
    titre: "",
    description: "",
    formationId: ""
  })
  const [modulesChanged, setModulesChanged] = useState(false)
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(null)
  const [selectedModuleSupports, setSelectedModuleSupports] = useState([])
  const [selectedModuleQuiz, setSelectedModuleQuiz] = useState(null)
  const [activeFeatureTab, setActiveFeatureTab] = useState("supports")
  
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

    if (!id && !formation.imageFile) {
      setError("L'image est obligatoire pour créer une formation")
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
        
        // Show success sweet alert
        await Swal.fire({
          title: "Formation créée!",
          text: "La formation a été créée avec succès.",
          icon: "success",
          timer: 1000,
          showConfirmButton: false
        })
      }
      
      // Navigate to the formation details page
      navigate(`/admin/formations/${response.id || id}`)
      
    } catch (error) {
      setError(error.message || "Impossible de sauvegarder la formation. Veuillez réessayer plus tard.")
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la formation."
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
      titre: "",
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
    if (!newModule.titre.trim()) {
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
      
      const response = await moduleService.createModule({ formationId: id }, moduleData)
      toast({
        title: "Module ajouté",
        description: "Le module a été ajouté avec succès."
      })
      
      // Add the new module to the list
      setModules([...modules, response])
      
      // Close dialog
      setIsModuleDialogOpen(false)
      setNewModule({
        titre: "",
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
    try {
      const result = await Swal.fire({
        title: "Êtes-vous sûr ?",
        text: "La suppression d'un module est irréversible !",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler",
        buttonsStyling: true,
        customClass: {
          confirmButton: 'swal2-confirm swal2-styled',
          cancelButton: 'swal2-cancel swal2-styled'
        }
      });
      
      if (result.isConfirmed) {
        await moduleService.deleteModule(moduleId);
        
        await Swal.fire({
          title: "Supprimé !",
          text: "Le module a été supprimé avec succès.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        
        // Remove module from the list
        setModules(modules.filter(m => m.id !== moduleId));

        // If the deleted module was the selected one, reset selection
        if (selectedModuleIndex !== null && modules[selectedModuleIndex]?.id === moduleId) {
          setSelectedModuleIndex(null);
          setSelectedModuleSupports([]);
          setSelectedModuleQuiz(null);
        }
      }
    } catch (error) {
      await Swal.fire({
        title: "Erreur",
        text: "Impossible de supprimer le module. Veuillez réessayer plus tard.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: 'swal2-confirm swal2-styled'
        }
      });
    }
  }

  const handleSelectModule = async (index) => {
  setSelectedModuleIndex(index);
  const moduleId = modules[index].id;
  
  try {
    // Get module details for supports
    const moduleDetails = await moduleService.getModuleById(moduleId);
    console.log("Module details:", moduleDetails);
    setSelectedModuleSupports(moduleDetails.supports || []);
    
    // Get quizzes with complete data (questions and choices included) - ADD THIS
    try {
      const quizzesWithQuestions = await quizService.getQuizzesByModule(moduleId);
      
      if (quizzesWithQuestions && quizzesWithQuestions.length > 0) {
        setSelectedModuleQuiz(quizzesWithQuestions[0]); // First quiz with complete data
      } else {
        setSelectedModuleQuiz(null);
      }
    } catch (quizError) {
      console.error("Error fetching quiz data:", quizError);
      setSelectedModuleQuiz(null);
    }
    
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du module:", error);
    setSelectedModuleSupports([]);
    setSelectedModuleQuiz(null);
    toast({
      variant: "warning",
      title: "Avertissement",
      description: "Impossible de récupérer les détails du module."
    });
  }
};

  const handleUpdateModuleSupports = async (updatedSupports) => {
    if (selectedModuleIndex === null) return;
    
    // Just update the local state with the updated supports
    // The actual API calls are now handled by the ModuleSupportsManager component
    setSelectedModuleSupports(updatedSupports);
    
    toast({
      title: "Contenu mis à jour",
      description: "Les contenus du module ont été mis à jour avec succès."
    });
  };

  const handleUpdateModuleQuiz = async (updatedQuiz) => {
  if (selectedModuleIndex === null) return;
  
  try {
    // Just refresh the module selection to reload all data
    await handleSelectModule(selectedModuleIndex);
    
    toast({
      title: "Quiz mis à jour",
      description: "Le quiz du module a été mis à jour avec succès."
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Erreur lors de la mise à jour du quiz."
    });
  }
};

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
          <TabsTrigger value="contents" disabled={!id || modules.length === 0}>Contenus & Quiz</TabsTrigger>
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
                <Label htmlFor="type">Type de formation</Label>
                <Select
                  value={formation.type}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
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
                          <h3 className="text-lg font-medium">{module.titre}</h3>
                          <p className="text-gray-500 text-sm mt-1">{module.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <FileText className="h-3 w-3 mr-1" />
                              {module.supports?.length || 0} contenus
                            </span>
                            {module.quizs && module.quizs.length > 0 && (
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

        <TabsContent value="contents" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des contenus et quiz</CardTitle>
              <CardDescription>
                Sélectionnez un module pour gérer ses contenus et son quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="select-module">Module</Label>
                <Select
                  onValueChange={(value) => handleSelectModule(parseInt(value))}
                  value={selectedModuleIndex !== null ? selectedModuleIndex.toString() : ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module, index) => (
                      <SelectItem key={module.id} value={index.toString()}>
                        {module.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedModuleIndex !== null && (
                <Tabs 
                  defaultValue="supports" 
                  value={activeFeatureTab} 
                  onValueChange={setActiveFeatureTab}
                  className="mt-6"
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="supports" className="flex-1">Contenus</TabsTrigger>
                    <TabsTrigger value="quiz" className="flex-1">Quiz</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="supports" className="mt-4">
                    <ModuleSupportsManager
                      moduleId={modules[selectedModuleIndex].id}
                      initialSupports={selectedModuleSupports}
                      onSave={handleUpdateModuleSupports}
                    />
                  </TabsContent>
                  
                  <TabsContent value="quiz" className="mt-4">
                    <QuizManager
                      moduleId={modules[selectedModuleIndex].id}
                      initialQuiz={selectedModuleQuiz}
                      onSave={handleUpdateModuleQuiz}
                    />
                  </TabsContent>
                </Tabs>
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
              <Label htmlFor="moduleTitre">Titre du module</Label>
              <Input
                id="moduleTitre"
                name="titre"
                value={newModule.titre}
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
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../components/ui/tabs"
import { Plus, Pencil, Trash2, Search, FolderPlus, ExternalLink, LayoutGrid, List } from "lucide-react"
import { formationService } from "../services/formationService"
import { moduleService } from "../services/moduleService"
import { useToast } from "../hooks/use-toast"

// Create a simple Loader component since Loader2 is not available
const Loader = () => (
  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
);

const FormationsManagement = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [formations, setFormations] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFormation, setSelectedFormation] = useState(null)
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [activeModuleTab, setActiveModuleTab] = useState("new")
  const [newModule, setNewModule] = useState({
    title: "",
    description: "",
    formationId: ""
  })
  const [selectedModuleId, setSelectedModuleId] = useState("")
  const [viewType, setViewType] = useState("table") // 'table' or 'grid'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [formationsData, modulesData] = await Promise.all([
        formationService.getAllFormations(),
        moduleService.getAllModules()
      ])
      setFormations(formationsData)
      setModules(modulesData)
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les formations."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      try {
        await formationService.deleteFormation(id)
        toast({
          title: "Succès",
          description: "Formation supprimée avec succès."
        })
        fetchData()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de supprimer la formation."
        })
      }
    }
  }

  const handleAddModuleClick = (formation) => {
    setSelectedFormation(formation)
    setNewModule({
      title: "",
      description: "",
      formationId: formation.id
    })
    setIsModuleDialogOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewModule(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Get modules not already assigned to the selected formation
  const getAvailableModules = () => {
    if (!selectedFormation) return []
    return modules.filter(module => module.formationId !== selectedFormation.id)
  }

  const handleAddModule = async (action) => {
    try {
      if (action === "create") {
        // Create a new module
        if (!newModule.title) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Le titre du module est obligatoire."
          })
          return
        }

        const response = await moduleService.createModule(newModule)
        toast({
          title: "Module créé",
          description: "Le module a été ajouté à la formation avec succès."
        })
        
        // Update local state
        setModules(prev => [...prev, response])
        
        // Update the formation modules count
        const updatedFormation = formations.find(f => f.id === selectedFormation.id)
        if (updatedFormation) {
          updatedFormation.modules = [...(updatedFormation.modules || []), response]
          setFormations(formations.map(f => 
            f.id === updatedFormation.id ? updatedFormation : f
          ))
        }
      } else if (action === "link") {
        // Link an existing module
        if (!selectedModuleId) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Veuillez sélectionner un module à lier."
          })
          return
        }

        const moduleToUpdate = modules.find(m => m.id === selectedModuleId)
        
        if (moduleToUpdate) {
          const updatedModule = { 
            ...moduleToUpdate, 
            formationId: selectedFormation.id 
          }
          
          await moduleService.updateModule(selectedModuleId, updatedModule)
          
          toast({
            title: "Module lié",
            description: "Le module a été lié à la formation avec succès."
          })
          
          // Update modules state
          setModules(modules.map(m => 
            m.id === selectedModuleId ? updatedModule : m
          ))
          
          // Update the formation modules count
          const updatedFormation = formations.find(f => f.id === selectedFormation.id)
          if (updatedFormation) {
            updatedFormation.modules = [...(updatedFormation.modules || []), updatedModule]
            setFormations(formations.map(f => 
              f.id === updatedFormation.id ? updatedFormation : f
            ))
          }
        }
      }

      // Reset state and close dialog
      setNewModule({
        title: "",
        description: "",
        formationId: ""
      })
      setSelectedModuleId("")
      setIsModuleDialogOpen(false)
      
      // Optional: refresh data from server
      // fetchData()
    } catch (error) {
      console.error("Erreur lors de l'ajout du module:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le module à la formation."
      })
    }
  }

  const filteredFormations = formations.filter(formation =>
    formation.titre && formation.titre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getModuleCount = (formationId) => {
    return modules.filter(module => module.formationId === formationId).length
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des formations</h1>
          <p className="text-gray-500">Gérez les formations de la plateforme et leur contenu</p>
        </div>
        <Button onClick={() => navigate("/admin/formations/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle formation
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center flex-1">
          <Search className="h-4 w-4 mr-2 text-gray-500" />
          <Input
            placeholder="Rechercher une formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant={viewType === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewType("table")}
          >
            <List className="h-4 w-4 mr-2" />
            Tableau
          </Button>
          <Button 
            variant={viewType === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewType("grid")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Grille
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des formations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : filteredFormations.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Aucune formation trouvée.</p>
            </div>
          ) : viewType === "table" ? (
            // Table View
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Modules</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFormations.map((formation) => (
                    <TableRow key={formation.id}>
                      <TableCell>
                        <div className="w-24 h-16 relative rounded-md overflow-hidden">
                          <img
                            src={formation.lienPhoto || "/course_placeholder.png"}
                            alt={formation.titre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>{formation.titre}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {formation.description}
                      </TableCell>
                      <TableCell>{formation.duree} heures</TableCell>
                      <TableCell>{getModuleCount(formation.id)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddModuleClick(formation)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Module
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/formations/${formation.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(formation.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Grid View
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredFormations.map((formation) => (
                <Card key={formation.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={formation.lienPhoto || "/course_placeholder.png"}
                      alt={formation.titre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{formation.titre}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-2">{formation.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{formation.duree} heures</span>
                      <span>{getModuleCount(formation.id)} modules</span>
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0 flex justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddModuleClick(formation)}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Module
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/formations/${formation.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(formation.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for adding a new module or linking an existing one */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Ajouter un module à {selectedFormation?.titre}
            </DialogTitle>
            <DialogDescription>
              Créez un nouveau module ou liez un module existant à cette formation
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="new" value={activeModuleTab} onValueChange={setActiveModuleTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">Nouveau module</TabsTrigger>
              <TabsTrigger 
                value="existing" 
                disabled={getAvailableModules().length === 0}
              >
                Module existant
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="new" className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newModule.title}
                    onChange={handleInputChange}
                    placeholder="Entrez le titre du module"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newModule.description}
                    onChange={handleInputChange}
                    placeholder="Entrez la description du module"
                    rows={3}
                  />
                </div>
                
                <DialogFooter className="mt-6">
                  <Button 
                    onClick={() => handleAddModule("create")} 
                    disabled={!newModule.title}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Créer et ajouter
                  </Button>
                </DialogFooter>
              </div>
            </TabsContent>
            
            <TabsContent value="existing" className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="moduleId">Sélectionner un module</Label>
                  {getAvailableModules().length > 0 ? (
                    <Select 
                      value={selectedModuleId} 
                      onValueChange={setSelectedModuleId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un module" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableModules().map(module => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Aucun module disponible à lier à cette formation.
                    </p>
                  )}
                </div>
                
                <DialogFooter className="mt-6">
                  <Button 
                    onClick={() => handleAddModule("link")}
                    disabled={!selectedModuleId || getAvailableModules().length === 0}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lier à la formation
                  </Button>
                </DialogFooter>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FormationsManagement
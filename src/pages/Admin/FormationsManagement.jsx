"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Plus, Pencil, Trash2, Search, FolderPlus, LayoutGrid, List, Loader2 } from "lucide-react"
import { formationService } from "../../services/formationService"
import Swal from "sweetalert2"

const FormationsManagement = () => {
  const navigate = useNavigate()
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFormation, setSelectedFormation] = useState(null)
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [newModule, setNewModule] = useState({
    titre: "",
    description: "",
    formationId: ""
  })
  const [viewType, setViewType] = useState("table") // 'table' or 'grid'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Use the new endpoint that returns formations with module counts
      const formationsData = await formationService.getAllFormationsSummary()
      setFormations(formationsData)
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error)
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de charger les formations.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler"
    });

    if (result.isConfirmed) {
      try {
        await formationService.deleteFormation(id)
        
        await Swal.fire({
          title: "Supprimé !",
          text: "La formation a été supprimée avec succès.",
          icon: "success",
          timer: 1000,
          showConfirmButton: false
        })
        
        fetchData()
      } catch (error) {
        Swal.fire({
          title: 'Erreur',
          text: 'Impossible de supprimer la formation.',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    }
  }

  const handleAddModuleClick = (formation) => {
    setSelectedFormation(formation)
    setNewModule({
      titre: "",
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

  const handleAddModule = async () => {
    try {
      // Create a new module
      if (!newModule.titre) {
        Swal.fire({
          title: 'Erreur',
          text: 'Le titre du module est obligatoire.',
          icon: 'error',
          confirmButtonText: 'OK'
        })
        return
      }

      await formationService.createModule(selectedFormation.id, newModule)
      Swal.fire({
        title: 'Module créé',
        text: 'Le module a été ajouté à la formation avec succès.',
        icon: 'success',
        confirmButtonText: 'OK'
      })

      // Reset state and close dialog
      setNewModule({
        titre: "",
        description: "",
        formationId: ""
      })
      setIsModuleDialogOpen(false)
      
      // Refresh data to get updated module counts
      fetchData()
    } catch (error) {
      console.error("Erreur lors de l'ajout du module:", error)
      Swal.fire({
        title: 'Erreur',
        text: "Impossible d'ajouter le module à la formation.",
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
  }

  const filteredFormations = formations.filter(formation =>
    formation.titre && formation.titre.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                      <TableCell>{formation.duree ?? 0} heures</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{formation.numberOfModules} modules</span>
                        </div>
                      </TableCell>
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
                      <span>{formation.duree ?? 0} heures</span>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FolderPlus className="h-4 w-4 mr-1" />
                        {formation.numberOfModules} modules
                      </span>
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

      {/* Dialog for adding a new module */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Ajouter un module à {selectedFormation?.titre}
            </DialogTitle>
            <DialogDescription>
              Créez un nouveau module pour cette formation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                name="titre"
                value={newModule.titre}
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
                onClick={handleAddModule} 
                disabled={!newModule.titre}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Créer et ajouter
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FormationsManagement
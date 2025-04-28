"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, AlertCircle, Search, Plus, Edit, Trash2, Filter, ArrowUpDown, RefreshCcw } from "lucide-react"
import { collaborateurService } from "../services/collaborateurService"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useToast } from "../hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import Swal from 'sweetalert2'

const CollaborateursManagement = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [collaborateurs, setCollaborateurs] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [collaborateurToDelete, setCollaborateurToDelete] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCollaborateur, setNewCollaborateur] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "COLLABORATEUR",
    poste: "",
  })
  const [formError, setFormError] = useState("")
  const [filters, setFilters] = useState({
    poste: "",
    sortBy: "recent"
  })
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  // Liste des postes pour les sélecteurs
  const postes = ["Développeur", "Designer", "Chef de projet", "Marketing", "RH", "Finance", "Autre"]

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    if (currentUser && currentUser.role !== "ADMIN") {
      navigate("/dashboard")
      return
    }

    fetchCollaborateurs()
  }, [currentUser, navigate, filters])

  const fetchCollaborateurs = async () => {
    try {
      setLoading(true)
      // Pass the filters to the service
      const searchParams = {
        ...filters,
        search: searchTerm
      }
      const data = await collaborateurService.getAllCollaborateurs(searchParams)
      setCollaborateurs(data)
    } catch (error) {
      console.error("Error fetching collaborateurs:", error)
      setError("Impossible de récupérer la liste des collaborateurs. Veuillez réessayer plus tard.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchCollaborateurs()
  }

  const handleRefresh = () => {
    fetchCollaborateurs()
  }

  const handleDeleteClick = (collaborateur) => {
    setCollaborateurToDelete(collaborateur)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!collaborateurToDelete) return

    try {
      await collaborateurService.deleteCollaborateur(collaborateurToDelete.id)
      setCollaborateurs(collaborateurs.filter((c) => c.id !== collaborateurToDelete.id))
      setIsDeleteDialogOpen(false)
      setCollaborateurToDelete(null)
      
      toast({
        title: "Collaborateur supprimé",
        description: `${collaborateurToDelete.firstName} ${collaborateurToDelete.lastName} a été supprimé avec succès.`,
      })
    } catch (error) {
      console.error("Error deleting collaborateur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le collaborateur. Veuillez réessayer plus tard.",
        variant: "destructive"
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCollaborateur((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setNewCollaborateur((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      poste: "",
      sortBy: "recent"
    })
    setIsFilterDialogOpen(false)
  }

  const validateForm = () => {
    if (!newCollaborateur.firstName.trim()) {
      setFormError("Le prénom est requis")
      return false
    }
    if (!newCollaborateur.lastName.trim()) {
      setFormError("Le nom est requis")
      return false
    }
    if (!newCollaborateur.email.trim()) {
      setFormError("L'email est requis")
      return false
    }
    if (!newCollaborateur.password.trim()) {
      setFormError("Le mot de passe est requis")
      return false
    }
    if (!newCollaborateur.poste) {
      setFormError("Le poste est requis")
      return false
    }
    return true
  }

  const handleAddCollaborateur = async () => {
    setFormError("")
    if (!validateForm()) return

    try {
      const response = await collaborateurService.createCollaborateur(newCollaborateur)
      setCollaborateurs([response, ...collaborateurs])
      setIsAddDialogOpen(false)
      setNewCollaborateur({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "COLLABORATEUR",
        poste: "",
      })
      
      // Sweet Alert success notification
      Swal.fire({
        title: 'Succès!',
        text: `${response.firstName} ${response.lastName} a été ajouté avec succès.`,
        icon: 'success',
        timer: 1000,
        showConfirmButton: false
      })
      
      // Refresh the list after adding
      fetchCollaborateurs()
    } catch (error) {
      console.error("Error adding collaborateur:", error)
      
      // Check if error is due to duplicate email
      const isDuplicateEmail = error.response?.data?.message?.toLowerCase().includes('duplicate key value') && 
                              error.response?.data?.message?.toLowerCase().includes('email');

      if (isDuplicateEmail) {
        setFormError("Cette adresse email est déjà utilisée.")
      } else {
        setFormError("Impossible d'ajouter le collaborateur. Veuillez réessayer plus tard.")
      }
    }
  }

  const activeFiltersCount = Object.values(filters).filter(value => value !== "").length

  if (loading && collaborateurs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && collaborateurs.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des collaborateurs</h1>
          <p className="text-gray-500">Gérez les collaborateurs de la plateforme</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un collaborateur
        </Button>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Rechercher un collaborateur..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <Button type="submit" variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Rechercher
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsFilterDialogOpen(true)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtrer
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        <Button type="button" variant="ghost" onClick={handleRefresh}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </form>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Liste des collaborateurs</CardTitle>
          <div className="text-sm text-gray-500">
            {collaborateurs.length} collaborateur{collaborateurs.length !== 1 ? 's' : ''}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nom</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Poste</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collaborateurs.map((collab) => (
                  <tr key={collab.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {collab.firstName} {collab.lastName}
                    </td>
                    <td className="py-3 px-4">{collab.email}</td>
                    <td className="py-3 px-4">{collab.poste}</td>
                    <td className="py-3 px-4 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/collaborateurs/${collab.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Éditer
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(collab)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
                {collaborateurs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      Aucun collaborateur trouvé
                      {activeFiltersCount > 0 && " avec les filtres appliqués"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le collaborateur {collaborateurToDelete?.firstName}{" "}
              {collaborateurToDelete?.lastName} ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'ajout de collaborateur */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        if (!open) {
          // Reset form data when closing the modal
          setNewCollaborateur({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: "COLLABORATEUR",
            poste: "",
          });
          setFormError(""); // Clear any error messages
        }
        setIsAddDialogOpen(open);
      }}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Ajouter un collaborateur</DialogTitle>
            <DialogDescription>Remplissez le formulaire pour ajouter un nouveau collaborateur.</DialogDescription>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={newCollaborateur.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" name="lastName" value={newCollaborateur.lastName} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={newCollaborateur.email} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={newCollaborateur.password} 
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poste">Poste</Label>
              <Select value={newCollaborateur.poste} onValueChange={(value) => handleSelectChange("poste", value)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Sélectionner un poste" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {postes.map((poste) => (
                    <SelectItem key={poste} value={poste}>
                      {poste}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddCollaborateur}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de filtre */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrer les collaborateurs</DialogTitle>
            <DialogDescription>Sélectionnez les critères pour filtrer la liste des collaborateurs.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="poste-filter">Poste</Label>
              <Select
                value={filters.poste}
                onValueChange={(value) => handleFilterChange("poste", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les postes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les postes</SelectItem>
                  {postes.map((poste) => (
                    <SelectItem key={poste} value={poste}>
                      {poste}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort-filter">Trier par</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récent</SelectItem>
                  <SelectItem value="name">Nom (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={clearFilters}>
              Réinitialiser les filtres
            </Button>
            <Button onClick={() => {
              fetchCollaborateurs();
              setIsFilterDialogOpen(false);
            }}>
              Appliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CollaborateursManagement
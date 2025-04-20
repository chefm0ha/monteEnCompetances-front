"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, AlertCircle, Search, Plus, Edit, Trash2 } from "lucide-react"
import { collaborateurService } from "../services/collaborateurService"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
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

const CollaborateursManagement = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
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
    poste: "",
    departement: "",
  })
  const [formError, setFormError] = useState("")

  // Liste des postes et départements pour les sélecteurs
  const postes = ["Développeur", "Designer", "Chef de projet", "Marketing", "RH", "Finance", "Autre"]
  const departements = ["IT", "Marketing", "RH", "Finance", "Direction", "Autre"]

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    if (currentUser && currentUser.role !== "ADMIN") {
      navigate("/dashboard")
      return
    }

    fetchCollaborateurs()
  }, [currentUser, navigate])

  const fetchCollaborateurs = async () => {
    try {
      setLoading(true)
      const data = await collaborateurService.getAllCollaborateurs()
      setCollaborateurs(data)
    } catch (error) {
      console.error("Error fetching collaborateurs:", error)
      setError("Impossible de récupérer la liste des collaborateurs. Veuillez réessayer plus tard.")
      // Utiliser des données fictives pour le développement
      setCollaborateurs([
        {
          id: 1,
          firstName: "Jean",
          lastName: "Dupont",
          email: "jean.dupont@example.com",
          poste: "Développeur",
          departement: "IT",
        },
        {
          id: 2,
          firstName: "Marie",
          lastName: "Martin",
          email: "marie.martin@example.com",
          poste: "Designer",
          departement: "IT",
        },
        {
          id: 3,
          firstName: "Pierre",
          lastName: "Durand",
          email: "pierre.durand@example.com",
          poste: "Chef de projet",
          departement: "IT",
        },
        {
          id: 4,
          firstName: "Sophie",
          lastName: "Lefebvre",
          email: "sophie.lefebvre@example.com",
          poste: "Marketing",
          departement: "Marketing",
        },
        {
          id: 5,
          firstName: "Thomas",
          lastName: "Moreau",
          email: "thomas.moreau@example.com",
          poste: "RH",
          departement: "RH",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const filteredCollaborateurs = collaborateurs.filter((collab) => {
    const fullName = `${collab.firstName} ${collab.lastName}`.toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return (
      fullName.includes(searchLower) ||
      collab.email.toLowerCase().includes(searchLower) ||
      collab.poste?.toLowerCase().includes(searchLower) ||
      collab.departement?.toLowerCase().includes(searchLower)
    )
  })

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
    } catch (error) {
      console.error("Error deleting collaborateur:", error)
      setError("Impossible de supprimer le collaborateur. Veuillez réessayer plus tard.")
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
    if (!newCollaborateur.poste) {
      setFormError("Le poste est requis")
      return false
    }
    if (!newCollaborateur.departement) {
      setFormError("Le département est requis")
      return false
    }
    return true
  }

  const handleAddCollaborateur = async () => {
    setFormError("")
    if (!validateForm()) return

    try {
      const response = await collaborateurService.createCollaborateur(newCollaborateur)
      setCollaborateurs([...collaborateurs, response])
      setIsAddDialogOpen(false)
      setNewCollaborateur({
        firstName: "",
        lastName: "",
        email: "",
        poste: "",
        departement: "",
      })
    } catch (error) {
      console.error("Error adding collaborateur:", error)
      setFormError("Impossible d'ajouter le collaborateur. Veuillez réessayer plus tard.")
    }
  }

  if (loading) {
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

      <div className="flex items-center space-x-2">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des collaborateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nom</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Poste</th>
                  <th className="text-left py-3 px-4">Département</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCollaborateurs.map((collab) => (
                  <tr key={collab.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {collab.firstName} {collab.lastName}
                    </td>
                    <td className="py-3 px-4">{collab.email}</td>
                    <td className="py-3 px-4">{collab.poste}</td>
                    <td className="py-3 px-4">{collab.departement}</td>
                    <td className="py-3 px-4 flex space-x-2">
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
                {filteredCollaborateurs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      Aucun collaborateur trouvé
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
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poste">Poste</Label>
                <Select value={newCollaborateur.poste} onValueChange={(value) => handleSelectChange("poste", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un poste" />
                  </SelectTrigger>
                  <SelectContent>
                    {postes.map((poste) => (
                      <SelectItem key={poste} value={poste}>
                        {poste}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departement">Département</Label>
                <Select
                  value={newCollaborateur.departement}
                  onValueChange={(value) => handleSelectChange("departement", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departements.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
    </div>
  )
}

export default CollaborateursManagement

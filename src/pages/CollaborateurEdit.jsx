"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, AlertCircle, Save, ArrowLeft, Trash2 } from "lucide-react"
import { collaborateurService } from "../services/collaborateurService"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useToast } from "../hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"

const CollaborateurEdit = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isNewCollaborateur, setIsNewCollaborateur] = useState(false)
  const [collaborateur, setCollaborateur] = useState({
    firstName: "",
    lastName: "",
    email: "",
    poste: "",
  })

  // Liste des postes pour les sélecteurs
  const postes = ["Développeur", "Designer", "Chef de projet", "Marketing", "RH", "Finance", "Autre"]

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    if (currentUser && currentUser.role !== "ADMIN") {
      navigate("/dashboard")
      return
    }

    // Determine if this is a new collaborateur or editing an existing one
    if (id === "new") {
      setIsNewCollaborateur(true)
      setLoading(false)
      return
    }

    const fetchCollaborateur = async () => {
      try {
        setLoading(true)
        const data = await collaborateurService.getCollaborateurById(id)
        setCollaborateur(data)
      } catch (error) {
        console.error(`Error fetching collaborateur with ID ${id}:`, error)
        setError("Impossible de récupérer les informations du collaborateur. Veuillez réessayer plus tard.")
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les informations du collaborateur.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCollaborateur()
  }, [id, currentUser, navigate, toast])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCollaborateur((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setCollaborateur((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!collaborateur.firstName.trim()) {
      setFormError("Le prénom est requis")
      return false
    }
    if (!collaborateur.lastName.trim()) {
      setFormError("Le nom est requis")
      return false
    }
    if (!collaborateur.email.trim()) {
      setFormError("L'email est requis")
      return false
    }
    if (!collaborateur.poste) {
      setFormError("Le poste est requis")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!validateForm()) return

    try {
      setSaving(true)
      
      if (isNewCollaborateur) {
        // Create new collaborateur
        const newCollaborateur = await collaborateurService.createCollaborateur(collaborateur)
        toast({
          title: "Collaborateur créé",
          description: `${newCollaborateur.firstName} ${newCollaborateur.lastName} a été ajouté avec succès.`,
        })
      } else {
        // Update existing collaborateur
        await collaborateurService.updateCollaborateur(id, collaborateur)
        toast({
          title: "Collaborateur mis à jour",
          description: `Les modifications ont été enregistrées avec succès.`,
        })
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/admin/collaborateurs")
      }, 1000)
    } catch (error) {
      console.error(`Error ${isNewCollaborateur ? 'creating' : 'updating'} collaborateur:`, error)
      setFormError(`Impossible de ${isNewCollaborateur ? 'créer' : 'mettre à jour'} le collaborateur. Veuillez réessayer plus tard.`)
      toast({
        title: "Erreur",
        description: `Impossible de ${isNewCollaborateur ? 'créer' : 'mettre à jour'} le collaborateur.`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true)
      await collaborateurService.deleteCollaborateur(id)
      setIsDeleteDialogOpen(false)
      
      toast({
        title: "Collaborateur supprimé",
        description: `${collaborateur.firstName} ${collaborateur.lastName} a été supprimé avec succès.`,
      })
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/admin/collaborateurs")
      }, 1000)
    } catch (error) {
      console.error(`Error deleting collaborateur with ID ${id}:`, error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le collaborateur.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !isNewCollaborateur) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNewCollaborateur ? "Ajouter un collaborateur" : "Éditer un collaborateur"}
          </h1>
          <p className="text-gray-500">
            {isNewCollaborateur 
              ? "Créez un nouveau collaborateur" 
              : `Modifiez les informations de ${collaborateur.firstName} ${collaborateur.lastName}`}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate("/admin/collaborateurs")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          {!isNewCollaborateur && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du collaborateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={collaborateur.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" name="lastName" value={collaborateur.lastName} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={collaborateur.email} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="poste">Poste</Label>
                <Select value={collaborateur.poste} onValueChange={(value) => handleSelectChange("poste", value)}>
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
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => navigate("/admin/collaborateurs")}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isNewCollaborateur ? "Création..." : "Enregistrement..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isNewCollaborateur ? "Créer" : "Enregistrer"}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le collaborateur {collaborateur.firstName}{" "}
              {collaborateur.lastName} ? Cette action est irréversible.
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
    </div>
  )
}

export default CollaborateurEdit
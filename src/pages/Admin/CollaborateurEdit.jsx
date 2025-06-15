"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Loader2, AlertCircle, Save, ArrowLeft, Trash2 } from "lucide-react"
import { collaborateurService } from "../../services/collaborateurService"
import { Button } from "../../components/ui/button"
import Swal from 'sweetalert2'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,  DialogTitle,
} from "../../components/ui/dialog"
import CollaborateurForm from "../../components/Collaborateur/CollaborateurForm"

const CollaborateurEdit = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNewCollaborateur, setIsNewCollaborateur] = useState(false)
  const [collaborateur, setCollaborateur] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "COLLABORATEUR",
    poste: "",
  })
  // Liste des postes pour les sélecteurs
  const postes = ["Stagiaire", "Embauché"]

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
        Swal.fire({
          title: "Erreur",
          text: "Impossible de récupérer les informations du collaborateur.",
          icon: "error",
          confirmButtonText: "OK",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCollaborateur()
  }, [id, currentUser, navigate])

  const handleSubmit = async (formData) => {
    setFormError("")

    // Validation is now handled in the form component

    try {
      setSaving(true)
      
      if (isNewCollaborateur) {
        // Create new collaborateur
        const newCollaborateur = await collaborateurService.createCollaborateur(formData)
        Swal.fire({
          title: 'Succès!',
          text: `${newCollaborateur.firstName} ${newCollaborateur.lastName} a été ajouté avec succès.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        // Update existing collaborateur
        await collaborateurService.updateCollaborateur(id, formData)
        
        // Show SweetAlert success notification for 1 second
        Swal.fire({
          title: 'Succès!',
          text: `${formData.firstName} ${formData.lastName} a été modifié avec succès.`,
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        })
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/admin/collaborateurs")
      }, 1000)
    } catch (error) {
      setSaving(false)
      console.error(`Error ${isNewCollaborateur ? 'creating' : 'updating'} collaborateur:`, error)
      
      if (error.emailConflict) {
        // Set the form error message for the Alert component
        setFormError(error.message)
        // No toast for email conflicts, we want to show it in the form only
        return; // Prevent navigation
      } else {
        setFormError(`Impossible de ${isNewCollaborateur ? 'créer' : 'mettre à jour'} le collaborateur. Veuillez réessayer plus tard.`)
        Swal.fire({
          title: 'Erreur',
          text: `Impossible de ${isNewCollaborateur ? 'créer' : 'mettre à jour'} le collaborateur.`,
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
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
      
      Swal.fire({
        title: 'Succès!',
        text: `${collaborateur.firstName} ${collaborateur.lastName} a été supprimé avec succès.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/admin/collaborateurs")
      }, 1000)
    } catch (error) {
      console.error(`Error deleting collaborateur with ID ${id}:`, error)
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de supprimer le collaborateur.',
        icon: 'error',
        confirmButtonText: 'OK'
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

      <Card>
        <CardHeader>
          <CardTitle>Informations du collaborateur</CardTitle>
        </CardHeader>
        <CardContent>
          <CollaborateurForm
            collaborateur={collaborateur}
            formError={formError}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin/collaborateurs")}
            submitLabel={saving ? (isNewCollaborateur ? "Création..." : "Enregistrement...") : (isNewCollaborateur ? "Créer" : "Enregistrer")}
            cancelLabel="Annuler"
          />
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white">
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
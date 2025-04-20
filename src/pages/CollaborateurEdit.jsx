"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, AlertCircle, Save, ArrowLeft } from "lucide-react"
import { collaborateurService } from "../services/collaborateurService"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

const CollaborateurEdit = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState("")
  const [success, setSuccess] = useState(false)
  const [collaborateur, setCollaborateur] = useState({
    firstName: "",
    lastName: "",
    email: "",
    poste: "",
    departement: "",
  })

  // Liste des postes et départements pour les sélecteurs
  const postes = ["Développeur", "Designer", "Chef de projet", "Marketing", "RH", "Finance", "Autre"]
  const departements = ["IT", "Marketing", "RH", "Finance", "Direction", "Autre"]

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    if (currentUser && currentUser.role !== "ADMIN") {
      navigate("/dashboard")
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
        // Données fictives pour le développement
        setCollaborateur({
          id: Number.parseInt(id),
          firstName: "Jean",
          lastName: "Dupont",
          email: "jean.dupont@example.com",
          poste: "Développeur",
          departement: "IT",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCollaborateur()
  }, [id, currentUser, navigate])

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
    if (!collaborateur.departement) {
      setFormError("Le département est requis")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")
    setSuccess(false)

    if (!validateForm()) return

    try {
      setLoading(true)
      await collaborateurService.updateCollaborateur(id, collaborateur)
      setSuccess(true)
      // Rediriger après un court délai
      setTimeout(() => {
        navigate("/admin/collaborateurs")
      }, 2000)
    } catch (error) {
      console.error(`Error updating collaborateur with ID ${id}:`, error)
      setFormError("Impossible de mettre à jour le collaborateur. Veuillez réessayer plus tard.")
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

  if (error) {
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
          <h1 className="text-3xl font-bold tracking-tight">Éditer un collaborateur</h1>
          <p className="text-gray-500">Modifiez les informations du collaborateur</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/collaborateurs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-500 text-green-700">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Les modifications ont été enregistrées avec succès.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du collaborateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={collaborateur.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={collaborateur.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={collaborateur.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
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
              <div className="space-y-2">
                <Label htmlFor="departement">Département</Label>
                <Select
                  value={collaborateur.departement}
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
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => navigate("/admin/collaborateurs")}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default CollaborateurEdit

// src/pages/Admin/AffectationsManagement.jsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Checkbox } from "../../components/ui/checkbox"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../../components/ui/tabs"
import { Progress } from "../../components/ui/progress"
import { 
  Loader2, 
  AlertCircle, 
  Search, 
  UserPlus, 
  UserMinus, 
  Users, 
  BookOpen,
  RefreshCw,
  Filter,
  X
} from "lucide-react"
import { formationService } from "../../services/formationService"
import { collaborateurService } from "../../services/collaborateurService"
import { affectationService } from "../../services/affectationService"
import Swal from 'sweetalert2'

const AffectationsManagement = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("assign")
    // Data states
  const [formations, setFormations] = useState([])
  const [allCollaborateurs, setAllCollaborateurs] = useState([])
  const [participants, setParticipants] = useState([])
  
  // Selection states
  const [selectedFormation, setSelectedFormation] = useState("")
  const [selectedCollaborateurs, setSelectedCollaborateurs] = useState([])
    // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPoste, setSelectedPoste] = useState("")
  
  // Liste des postes pour les filtres
  const postes = ["stagiaire", "embauche"]
  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    if (currentUser && currentUser.role !== "ADMIN") {
      navigate("/dashboard")
      return
    }

    fetchInitialData()
  }, [currentUser, navigate])

  useEffect(() => {
    if (selectedFormation) {
      fetchParticipants()
    }  }, [selectedFormation])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [formationsData, collaborateursData] = await Promise.all([
        formationService.getAllFormations(),
        collaborateurService.getAllCollaborateurs()
      ])
      setFormations(formationsData)
      setAllCollaborateurs(collaborateursData)
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error)
      setError("Impossible de récupérer les données initiales.")
    } finally {
      setLoading(false)    }
  }

  // Static filter function using JavaScript
  const getFilteredCollaborateurs = () => {
    let filteredCollaborateurs = [...allCollaborateurs]
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filteredCollaborateurs = filteredCollaborateurs.filter(collab => 
        collab.firstName.toLowerCase().includes(searchLower) ||
        collab.lastName.toLowerCase().includes(searchLower) ||
        collab.email.toLowerCase().includes(searchLower)
      )
    }
    
    // Filter by poste
    if (selectedPoste && selectedPoste !== "all") {
      filteredCollaborateurs = filteredCollaborateurs.filter(collab => 
        collab.poste === selectedPoste
      )
    }
    
    return filteredCollaborateurs
  }

  const fetchParticipants = async () => {
    if (!selectedFormation) return
    
    try {
      const participantsData = await affectationService.getFormationParticipants(selectedFormation)
      setParticipants(participantsData)
    } catch (error) {
      console.error("Erreur lors de la récupération des participants:", error)
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de récupérer la liste des participants.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
  }

  const handleFormationSelect = (formationId) => {
    setSelectedFormation(formationId)
    setSelectedCollaborateurs([])
  }

  const handleCollaborateurSelect = (collaborateurId) => {
    setSelectedCollaborateurs(prev => {
      if (prev.includes(collaborateurId)) {
        return prev.filter(id => id !== collaborateurId)
      } else {
        return [...prev, collaborateurId]
      }    })
  }

  const handleSelectAll = () => {
    const participantIds = participants.map(p => p.collaborateurId)
    const filteredCollaborateurs = getFilteredCollaborateurs()
    const nonAssignedCollaborateurs = filteredCollaborateurs.filter(c => !participantIds.includes(c.id))
    
    if (selectedCollaborateurs.length === nonAssignedCollaborateurs.length) {
      setSelectedCollaborateurs([])
    } else {
      setSelectedCollaborateurs(nonAssignedCollaborateurs.map(c => c.id))
    }
  }

  const handleAssignCollaborateurs = async () => {
    if (!selectedFormation) {
      Swal.fire({
        title: 'Erreur',
        text: 'Veuillez sélectionner une formation.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
      return
    }

    if (selectedCollaborateurs.length === 0) {
      Swal.fire({
        title: 'Erreur',
        text: 'Veuillez sélectionner au moins un collaborateur.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
      return
    }

    try {
      setAssigning(true)
      
      const result = await affectationService.assignMultipleCollaborateursToFormation(
        selectedFormation, 
        selectedCollaborateurs
      )
      
      if (result.failed === 0) {
        Swal.fire({
          title: 'Succès!',
          text: `${result.successful} collaborateur(s) ont été affectés à la formation.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        Swal.fire({
          title: 'Partiellement réussi',
          text: `${result.successful} collaborateur(s) affectés, ${result.failed} échecs.`,
          icon: 'warning',
          confirmButtonText: 'OK'
        })
      }
        // Reset selection and refresh data
      setSelectedCollaborateurs([])
      fetchParticipants()
      setActiveTab("participants")
      
    } catch (error) {
      console.error("Erreur lors de l'affectation:", error)
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible d\'affecter les collaborateurs à la formation.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveParticipant = async (collaborateurId) => {
    if (!selectedFormation) return

    try {
      const result = await Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: 'Voulez-vous retirer ce collaborateur de la formation ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, retirer',
        cancelButtonText: 'Annuler'
      })

      if (result.isConfirmed) {
        await affectationService.removeCollaborateurFromFormation(selectedFormation, collaborateurId)
        
        Swal.fire({
          title: 'Retiré!',
          text: 'Le collaborateur a été retiré de la formation.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
        
        fetchParticipants()
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de retirer le collaborateur de la formation.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedPoste("")
  }
  const isCollaborateurAssigned = (collaborateurId) => {
    return participants.some(p => p.collaborateurId === collaborateurId)
  }

  const getSelectedFormationName = () => {
    const formation = formations.find(f => f.id === selectedFormation)
    return formation ? formation.titre : ""
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Affectation des formations</h1>
        <p className="text-gray-500">Gérez les affectations des collaborateurs aux formations</p>
      </div>

      {/* Sélection de la formation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sélection de la formation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="formation">Formation</Label>
            <Select value={selectedFormation} onValueChange={handleFormationSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une formation" />
              </SelectTrigger>
              <SelectContent>
                {formations.map((formation) => (
                  <SelectItem key={formation.id} value={formation.id}>
                    {formation.titre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedFormation && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assign">
              Affecter des collaborateurs
            </TabsTrigger>
            <TabsTrigger value="participants">
              Participants ({participants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assign" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Affecter à: {getSelectedFormationName()}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filtres */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Rechercher un collaborateur..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedPoste} onValueChange={setSelectedPoste}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Tous les postes" />
                    </SelectTrigger>                    <SelectContent>
                      <SelectItem value="all">Tous les postes</SelectItem>
                      {postes.map((poste) => (
                        <SelectItem key={poste} value={poste}>
                          {poste}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>                  {(searchTerm || selectedPoste) && (
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Effacer
                    </Button>
                  )}
                </div>

                {/* Table des collaborateurs */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              getFilteredCollaborateurs().length > 0 &&
                              selectedCollaborateurs.length ===
                                getFilteredCollaborateurs().filter(c => !isCollaborateurAssigned(c.id)).length
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Poste</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>                    <TableBody>
                      {getFilteredCollaborateurs().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Aucun collaborateur trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredCollaborateurs().map((collaborateur) => {
                          const isAssigned = isCollaborateurAssigned(collaborateur.id)
                          return (
                            <TableRow key={collaborateur.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedCollaborateurs.includes(collaborateur.id)}
                                  onCheckedChange={() => handleCollaborateurSelect(collaborateur.id)}
                                  disabled={isAssigned}
                                />
                              </TableCell>
                              <TableCell>
                                {collaborateur.firstName} {collaborateur.lastName}
                              </TableCell>
                              <TableCell>{collaborateur.email}</TableCell>
                              <TableCell>{collaborateur.poste}</TableCell>
                              <TableCell>
                                {isAssigned ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Déjà affecté
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Non affecté
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Bouton d'affectation */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleAssignCollaborateurs}
                    disabled={selectedCollaborateurs.length === 0 || assigning}
                  >
                    {assigning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Affectation en cours...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Affecter ({selectedCollaborateurs.length})
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants: {getSelectedFormationName()}
                  </div>
                  <Button variant="outline" onClick={fetchParticipants}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <div className="text-center py-10 border rounded-md bg-gray-50">
                    <p className="text-gray-500">Aucun participant affecté à cette formation.</p>
                    <p className="text-sm text-gray-400">
                      Utilisez l'onglet "Affecter des collaborateurs" pour commencer.
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Progression</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>                        {participants.map((participant) => (
                          <TableRow key={participant.collaborateurId}>
                            <TableCell>
                              {participant.collaborateurFullName || `${participant.collaborateurPrenom} ${participant.collaborateurNom}`}
                            </TableCell>                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress
                                  value={Math.round(participant.progress) || 0}
                                  className="w-full h-2 max-w-[100px]"
                                />
                                <span className="text-xs font-medium min-w-[35px]">
                                  {Math.round(participant.progress) || 0}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>                              {participant.completed ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Terminé
                                </span>
                              ) : participant.progress > 0 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  En cours
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Non commencé
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveParticipant(participant.collaborateurId)}
                              >
                                <UserMinus className="h-4 w-4 mr-1" />
                                Retirer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!selectedFormation && (
        <Card>
          <CardContent className="text-center py-10">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Sélectionnez une formation pour commencer à gérer les affectations.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AffectationsManagement
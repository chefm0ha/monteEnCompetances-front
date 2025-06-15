import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Progress } from "../../components/ui/progress";
import { 
  ArrowLeft, 
  Loader2, 
  Search, 
  UserPlus, 
  X, 
  Mail, 
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw
} from "lucide-react";
import { formationService } from "../../services/formationService";
import { collaborateurService } from "../../services/collaborateurService";
import Swal from 'sweetalert2';

const FormationAssignmentPage = () => {
  const { formationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [formation, setFormation] = useState(null);
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [assignedCollaborateurs, setAssignedCollaborateurs] = useState([]);
  const [selectedCollaborateurs, setSelectedCollaborateurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPoste, setSelectedPoste] = useState("");  const [activeTab, setActiveTab] = useState("assign");
  // Liste des postes pour le filtre
  const postes = ["Stagiaire", "Embauché"];

  useEffect(() => {
    fetchData();
  }, [formationId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les détails de la formation
      const formationData = await formationService.getFormationById(formationId);
      setFormation(formationData);
      
      // Récupérer la liste des collaborateurs
      fetchCollaborateurs();
      
      // Récupérer la liste des collaborateurs assignés
      fetchAssignedCollaborateurs();
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setError("Impossible de récupérer les données nécessaires.");
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de récupérer les données nécessaires.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchCollaborateurs = async () => {
    try {
      const filters = {};
      if (selectedPoste && selectedPoste !== "all") {
        filters.poste = selectedPoste;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const collaborateursData = await collaborateurService.getAllCollaborateurs(filters);
      setCollaborateurs(collaborateursData);
    } catch (error) {
      console.error("Erreur lors de la récupération des collaborateurs:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de récupérer la liste des collaborateurs.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const fetchAssignedCollaborateurs = async () => {
    try {
      const assignedData = await formationService.getAssignedCollaborateurs(formationId);
      setAssignedCollaborateurs(assignedData);
    } catch (error) {
      console.error("Erreur lors de la récupération des collaborateurs assignés:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de récupérer les collaborateurs assignés.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleSearch = () => {
    fetchCollaborateurs();
  };

  const handleSelectPoste = (poste) => {
    setSelectedPoste(poste);
    fetchCollaborateurs();
  };

  const handleSelectCollaborateur = (collaborateurId) => {
    setSelectedCollaborateurs(prev => {
      if (prev.includes(collaborateurId)) {
        return prev.filter(id => id !== collaborateurId);
      } else {
        return [...prev, collaborateurId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCollaborateurs.length === collaborateurs.length) {
      // Désélectionner tous
      setSelectedCollaborateurs([]);
    } else {
      // Sélectionner tous les collaborateurs non déjà assignés
      const assignedIds = assignedCollaborateurs.map(c => c.id);
      const nonAssignedIds = collaborateurs
        .filter(c => !assignedIds.includes(c.id))
        .map(c => c.id);
      setSelectedCollaborateurs(nonAssignedIds);
    }
  };

  const handleAssign = async () => {
    if (selectedCollaborateurs.length === 0) {
      Swal.fire({
        title: 'Erreur',
        text: 'Veuillez sélectionner au moins un collaborateur.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    try {
      setAssigning(true);
      
      await formationService.assignFormation(formationId, selectedCollaborateurs);
      
      Swal.fire({
        title: 'Succès!',
        text: `Formation assignée à ${selectedCollaborateurs.length} collaborateur(s).`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Réinitialiser la sélection
      setSelectedCollaborateurs([]);
      
      // Rafraîchir la liste des assignés
      fetchAssignedCollaborateurs();
      
      // Passer à l'onglet des assignés
      setActiveTab("assigned");
    } catch (error) {
      console.error("Erreur lors de l'assignation de la formation:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible d\'assigner la formation aux collaborateurs sélectionnés.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (collaborateurId) => {
    try {
      await formationService.removeAssignment(formationId, collaborateurId);
      
      Swal.fire({
        title: 'Succès!',
        text: 'L\'assignation a été supprimée avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Rafraîchir la liste des assignés
      fetchAssignedCollaborateurs();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'assignation:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de supprimer l\'assignation.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleSendReminder = async (collaborateurId) => {
    try {
      await formationService.sendReminderEmail(formationId, collaborateurId);
      
      Swal.fire({
        title: 'Succès!',
        text: 'Un email de rappel a été envoyé au collaborateur.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du rappel:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible d\'envoyer le rappel.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const isCollaborateurAssigned = (collaborateurId) => {
    return assignedCollaborateurs.some(c => c.id === collaborateurId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!formation) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Formation introuvable.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate(`/admin/formations/${formationId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la formation
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-4">
            Assignation de la formation: {formation.titre}
          </h1>
          <p className="text-gray-500">{formation.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Durée: {formation.duree} heures</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <UserPlus className="h-4 w-4" />
              <span>{assignedCollaborateurs.length} collaborateur(s) assigné(s)</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="assign">Assigner des collaborateurs</TabsTrigger>
          <TabsTrigger value="assigned">Collaborateurs assignés ({assignedCollaborateurs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="assign" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigner des collaborateurs</CardTitle>
              <CardDescription>
                Sélectionnez les collaborateurs à qui vous souhaitez assigner cette formation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Rechercher un collaborateur..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Select value={selectedPoste} onValueChange={handleSelectPoste}>
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
                  </Select>
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                  <Button variant="outline" onClick={fetchCollaborateurs}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              collaborateurs.length > 0 &&
                              selectedCollaborateurs.length ===
                                collaborateurs.filter(
                                  (c) => !isCollaborateurAssigned(c.id)
                                ).length
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Poste</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collaborateurs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Aucun collaborateur trouvé avec ces critères
                          </TableCell>
                        </TableRow>
                      ) : (
                        collaborateurs.map((collaborateur) => {
                          const isAssigned = isCollaborateurAssigned(collaborateur.id);
                          return (
                            <TableRow key={collaborateur.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedCollaborateurs.includes(collaborateur.id)}
                                  onCheckedChange={() => handleSelectCollaborateur(collaborateur.id)}
                                  disabled={isAssigned}
                                />
                              </TableCell>
                              <TableCell>
                                {collaborateur.prenom} {collaborateur.nom}
                              </TableCell>
                              <TableCell>{collaborateur.email}</TableCell>
                              <TableCell>{collaborateur.poste}</TableCell>
                              <TableCell>                                {isAssigned ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Déjà assigné
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Non assigné
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleAssign}
                    disabled={selectedCollaborateurs.length === 0 || assigning}
                  >
                    {assigning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Assignation en cours...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assigner ({selectedCollaborateurs.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Collaborateurs assignés</CardTitle>
              <CardDescription>
                Liste des collaborateurs assignés à cette formation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedCollaborateurs.length === 0 ? (
                <div className="text-center py-10 border rounded-md bg-gray-50">
                  <p className="text-gray-500">Aucun collaborateur assigné à cette formation.</p>
                  <p className="text-sm text-gray-400">
                    Utilisez l'onglet "Assigner des collaborateurs" pour commencer.
                  </p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Poste</TableHead>
                        <TableHead>Progression</TableHead>
                        <TableHead>Dernière activité</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedCollaborateurs.map((collaborateur) => (
                        <TableRow key={collaborateur.id}>
                          <TableCell>
                            {collaborateur.prenom} {collaborateur.nom}
                          </TableCell>
                          <TableCell>{collaborateur.email}</TableCell>
                          <TableCell>{collaborateur.poste}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={collaborateur.progression || 0}
                                className="w-full h-2"
                              />
                              <span className="text-xs font-medium">
                                {collaborateur.progression || 0}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {collaborateur.derniereActivite ? (
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(collaborateur.derniereActivite).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Jamais connecté</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendReminder(collaborateur.id)}
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Rappel
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveAssignment(collaborateur.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Retirer
                              </Button>
                            </div>
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
    </div>
  );
};

export default FormationAssignmentPage;
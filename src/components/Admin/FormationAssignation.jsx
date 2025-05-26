import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Search, UserPlus, Loader2, Check, X, Mail } from "lucide-react";
import Swal from 'sweetalert2';
import { collaborateurService } from "../../services/collaborateurService";
import { formationService } from "../../services/formationService";

const FormationAssignation = ({ formationId = null }) => {
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPoste, setSelectedPoste] = useState("");
  const [formations, setFormations] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState(formationId || "");
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [selectedCollaborateurs, setSelectedCollaborateurs] = useState([]);
  const [alreadyAssigned, setAlreadyAssigned] = useState([]);
  const [activeTab, setActiveTab] = useState("assign");

  // Liste des postes pour le filtre
  const postes = [
    "Développeur",
    "Designer",
    "Chef de projet",
    "Ressources Humaines",
    "Marketing",
    "Commercial",
    "Support",
    "Finance",
    "Direction",
    "Administratif",
    "Autre"
  ];

  useEffect(() => {
    fetchData();
  }, [formationId]);

  useEffect(() => {
    if (selectedFormation) {
      fetchAssignedCollaborateurs();
    }
  }, [selectedFormation]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Récupérer la liste des formations
      const formationsData = await formationService.getAllFormations();
      setFormations(formationsData);

      // Si un formationId est fourni, le sélectionner
      if (formationId) {
        setSelectedFormation(formationId);
      } else if (formationsData.length > 0) {
        setSelectedFormation(formationsData[0].id);
      }

      // Récupérer la liste des collaborateurs
      fetchCollaborateurs();
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
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
      // Filtres pour la récupération des collaborateurs
      const filters = {};
      if (selectedPoste) {
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
    if (!selectedFormation) return;

    try {
      const assignedData = await formationService.getAssignedCollaborateurs(selectedFormation);
      setAlreadyAssigned(assignedData.map(c => c.id));
    } catch (error) {
      console.error("Erreur lors de la récupération des assignations:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de récupérer les assignations existantes.',
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

  const handleSelectFormation = (formationId) => {
    setSelectedFormation(formationId);
    setSelectedCollaborateurs([]);
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
      const nonAssignedIds = collaborateurs
        .filter(c => !alreadyAssigned.includes(c.id))
        .map(c => c.id);
      setSelectedCollaborateurs(nonAssignedIds);
    }
  };

  const handleAssign = async () => {
    if (!selectedFormation) {
      Swal.fire({
        title: 'Erreur',
        text: 'Veuillez sélectionner une formation.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (selectedCollaborateurs.length === 0) {
      Swal.fire({
        title: 'Erreur',
        text: 'Veuillez sélectionner au moins un collaborateur.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    setAssigning(true);
    try {
      await formationService.assignFormation(selectedFormation, selectedCollaborateurs);
      
      Swal.fire({
        title: 'Succès!',
        text: `Formation assignée à ${selectedCollaborateurs.length} collaborateur(s).`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Rafraîchir la liste des collaborateurs déjà assignés
      fetchAssignedCollaborateurs();
      
      // Réinitialiser la sélection
      setSelectedCollaborateurs([]);
      
      // Passer à l'onglet des assignations
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
    if (!selectedFormation) return;

    try {
      await formationService.removeAssignment(selectedFormation, collaborateurId);
      
      Swal.fire({
        title: 'Succès!',
        text: 'Assignation supprimée avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Rafraîchir la liste des collaborateurs déjà assignés
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
    if (!selectedFormation) return;

    try {
      await formationService.sendReminderEmail(selectedFormation, collaborateurId);
      
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

  // Filtrer les collaborateurs assignés
  const assignedCollaborateurs = collaborateurs.filter(c => alreadyAssigned.includes(c.id));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestion des assignations</CardTitle>
        <CardDescription>
          Assignez des formations à des collaborateurs ou gérez les assignations existantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="formation">Formation</Label>
            <Select
              value={selectedFormation}
              onValueChange={handleSelectFormation}
              disabled={!!formationId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une formation" />
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

          {selectedFormation && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assign">Assigner</TabsTrigger>
                <TabsTrigger value="assigned">
                  Collaborateurs assignés ({alreadyAssigned.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assign" className="space-y-4 pt-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher par nom, prénom ou email..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      />
                    </div>
                  </div>
                  <Select
                    value={selectedPoste}
                    onValueChange={handleSelectPoste}
                  >
                    <SelectTrigger className="w-[200px]">
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
                  <Button onClick={handleSearch}>Rechercher</Button>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              collaborateurs.length > 0 &&
                              selectedCollaborateurs.length ===
                                collaborateurs.filter(
                                  (c) => !alreadyAssigned.includes(c.id)
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
                            Aucun collaborateur trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        collaborateurs.map((collaborateur) => {
                          const isAssigned = alreadyAssigned.includes(collaborateur.id);
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
                              <TableCell>
                                {isAssigned ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <Check className="h-3 w-3 mr-1" />
                                    Déjà assigné
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
                    disabled={
                      selectedCollaborateurs.length === 0 || assigning
                    }
                  >
                    {assigning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Assignation...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assigner ({selectedCollaborateurs.length})
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="assigned" className="pt-4">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Poste</TableHead>
                        <TableHead>Progression</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alreadyAssigned.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Aucun collaborateur assigné à cette formation
                          </TableCell>
                        </TableRow>
                      ) : (
                        assignedCollaborateurs.map((collaborateur) => (
                          <TableRow key={collaborateur.id}>
                            <TableCell>
                              {collaborateur.prenom} {collaborateur.nom}
                            </TableCell>
                            <TableCell>{collaborateur.email}</TableCell>
                            <TableCell>{collaborateur.poste}</TableCell>
                            <TableCell>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-green-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${collaborateur.progression || 0}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {collaborateur.progression || 0}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSendReminder(collaborateur.id)}
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveAssignment(collaborateur.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FormationAssignation;
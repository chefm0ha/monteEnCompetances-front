import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  MoveUp, 
  MoveDown,
  BookOpen,
  FileText,
  Video,
  CheckCircle, 
  AlertCircle
} from "lucide-react";
import { moduleService } from "../services/moduleService";
import { formationService } from "../services/formationService";
import Swal from "sweetalert2";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const FormationModulesList = () => {
  const { formationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formation, setFormation] = useState(null);
  const [modules, setModules] = useState([]);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    fetchData();
  }, [formationId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les détails de la formation
      const formationData = await formationService.getFormationById(formationId);
      setFormation(formationData);
      
      // Récupérer la liste des modules
      const modulesData = await moduleService.getModulesByFormation(formationId);
      setModules(modulesData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setError("Impossible de récupérer les données de la formation et des modules.");
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de récupérer les données.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      const result = await Swal.fire({
        title: "Êtes-vous sûr ?",
        text: "La suppression d'un module est irréversible !",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler"
      });
      
      if (result.isConfirmed) {
        await moduleService.deleteModule(moduleId);
        
        await Swal.fire({
          title: "Supprimé !",
          text: "Le module a été supprimé avec succès.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        
        // Mettre à jour la liste des modules
        setModules(modules.filter(m => m.id !== moduleId));
      }
    } catch (error) {
      await Swal.fire({
        title: "Erreur",
        text: "Impossible de supprimer le module. Veuillez réessayer plus tard.",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    
    const newModules = [...modules];
    const temp = newModules[index];
    newModules[index] = newModules[index - 1];
    newModules[index - 1] = temp;
    
    setModules(newModules);
    saveModulesOrder(newModules);
  };

  const handleMoveDown = (index) => {
    if (index === modules.length - 1) return;
    
    const newModules = [...modules];
    const temp = newModules[index];
    newModules[index] = newModules[index + 1];
    newModules[index + 1] = temp;
    
    setModules(newModules);
    saveModulesOrder(newModules);
  };

  const onDragEnd = (result) => {
    // Si l'élément a été déposé en dehors de la liste ou à la même position
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    // Réorganiser les modules
    const newModules = [...modules];
    const [removed] = newModules.splice(result.source.index, 1);
    newModules.splice(result.destination.index, 0, removed);
    
    setModules(newModules);
    saveModulesOrder(newModules);
  };

  const saveModulesOrder = async (orderedModules) => {
    try {
      setReordering(true);
      
      // Extraire les IDs dans l'ordre
      const moduleIds = orderedModules.map(m => m.id);
      
      // Envoyer l'ordre au serveur
      const response = await moduleService.reorderModules(formationId, moduleIds);
      
      if (response.success) {
        // Update the modules list with the returned ordered modules if available
        if (response.modules && response.modules.length > 0) {
          setModules(response.modules);
        }
        
        Swal.fire({
          title: "Ordre mis à jour",
          text: response.message || "L'ordre des modules a été mis à jour avec succès.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error(response.error || "Échec de la réorganisation des modules");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'ordre des modules:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || 'Impossible de mettre à jour l\'ordre des modules.',
      });
      
      // Revert the local changes on error
      fetchData();
    } finally {
      setReordering(false);
    }
  };

  const getModuleStats = (module) => {
    const supportsCount = module.supports?.length || 0;
    const hasQuiz = module.hasQuiz || false;
    
    // Déterminer les types de supports
    const pdfCount = module.supports?.filter(s => s.type === "PDF").length || 0;
    const videoCount = module.supports?.filter(s => s.type === "VIDEO").length || 0;
    const textCount = module.supports?.filter(s => s.type === "TEXT").length || 0;
    
    return { supportsCount, hasQuiz, pdfCount, videoCount, textCount };
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
            <Button variant="outline" onClick={() => navigate("/admin/formations")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux formations
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-4">{formation.titre}</h1>
          <p className="text-gray-500">{formation.description}</p>
        </div>
        <Button onClick={() => navigate(`/admin/formations/${formationId}/modules/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un module
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modules de la formation</CardTitle>
          <CardDescription>
            Gérez les modules de cette formation. Vous pouvez réorganiser les modules en les faisant glisser ou en utilisant les flèches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="text-center py-10 border rounded-md bg-gray-50">
              <p className="text-gray-500">Aucun module dans cette formation.</p>
              <p className="text-sm text-gray-400">Cliquez sur "Ajouter un module" pour commencer.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="modules">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {modules.map((module, index) => {
                      const stats = getModuleStats(module);
                      
                      return (
                        <Draggable
                          key={module.id}
                          draggableId={module.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="border rounded-md p-4 bg-white shadow-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="text-lg font-medium">{module.titre}</h3>
                                  <p className="text-gray-500 text-sm mt-1">{module.description}</p>
                                  
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {stats.pdfCount > 0 && (
                                      <Badge className="bg-red-100 text-red-800">
                                        <FileText className="h-3 w-3 mr-1" />
                                        {stats.pdfCount} PDF
                                      </Badge>
                                    )}
                                    {stats.videoCount > 0 && (
                                      <Badge className="bg-purple-100 text-purple-800">
                                        <Video className="h-3 w-3 mr-1" />
                                        {stats.videoCount} Vidéo{stats.videoCount > 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                    {stats.textCount > 0 && (
                                      <Badge className="bg-blue-100 text-blue-800">
                                        <FileText className="h-3 w-3 mr-1" />
                                        {stats.textCount} Texte{stats.textCount > 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                    {stats.hasQuiz && (
                                      <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Quiz
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMoveUp(index)}
                                    disabled={index === 0 || reordering}
                                  >
                                    <MoveUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMoveDown(index)}
                                    disabled={index === modules.length - 1 || reordering}
                                  >
                                    <MoveDown className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/admin/formations/${formationId}/modules/${module.id}`)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteModule(module.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Définir le composant Badge ici car il n'est pas importé
const Badge = ({ children, className }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
};

export default FormationModulesList;
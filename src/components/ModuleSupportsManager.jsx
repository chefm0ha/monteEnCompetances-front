import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { 
  FileText, 
  Video, 
  Plus, 
  Trash2,
  Clock, 
  Loader2,
  Check
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { contenuService } from "../services/contenuService";
import { useToast } from "../hooks/use-toast";

const ModuleSupportsManager = ({ moduleId, initialSupports = [], onSave, readOnly = false }) => {
  const { toast } = useToast();
  const [supports, setSupports] = useState(initialSupports);
  const [currentSupport, setCurrentSupport] = useState({
    type: "PDF",
    titre: "",
    description: "",
    duree: "",
    lien: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Update supports if initialSupports changes
    setSupports(initialSupports);
  }, [initialSupports]);

  const resetForm = () => {
    setCurrentSupport({
      type: "PDF",
      titre: "",
      description: "",
      duree: "",
      lien: "",
    });
    setFile(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSupport(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (value) => {
    // Reset file-related states when changing type
    setFile(null);
    
    setCurrentSupport(prev => ({
      ...prev,
      type: value,
      lien: "", // Reset lien when changing type
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validation du type de fichier
      if (currentSupport.type === "PDF" && selectedFile.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Type de fichier incorrect",
          description: "Veuillez sélectionner un fichier PDF valide",
        });
        return;
      }
      
      if (currentSupport.type === "VIDEO" && !selectedFile.type.startsWith("video/")) {
        toast({
          variant: "destructive",
          title: "Type de fichier incorrect",
          description: "Veuillez sélectionner un fichier vidéo valide",
        });
        return;
      }
      
      if (currentSupport.type === "TEXT" && !selectedFile.type.startsWith("text/")) {
        toast({
          variant: "destructive",
          title: "Type de fichier incorrect",
          description: "Veuillez sélectionner un fichier texte valide (.txt, .md, etc.)",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const validateSupport = () => {
    if (!currentSupport.titre.trim()) {
      setError("Le titre est obligatoire");
      return false;
    }

    if (!currentSupport.duree || isNaN(currentSupport.duree) || Number(currentSupport.duree) <= 0) {
      setError("Veuillez entrer une durée valide (en minutes)");
      return false;
    }

    // Pour tous les types, un fichier est requis pour un nouveau support
    if (!isEditing && !file) {
      setError("Veuillez sélectionner un fichier");
      return false;
    }

    return true;
  };

  const handleAddSupport = async () => {
    setError(null);
    setLoading(true);
    
    if (!validateSupport()) {
      setLoading(false);
      return;
    }

    try {
      // Create the support data object
      const supportData = {
        ...currentSupport,
        moduleId,
      };
      
      // Call the contenuService API to add the support
      const addedSupport = await contenuService.createContenu({
        ...supportData,
        file: file
      });
      
      // Update the local state with the newly added support
      const updatedSupports = [...supports, addedSupport];
      setSupports(updatedSupports);
      
      // Call the parent component's save function with the updated supports
      if (onSave) {
        onSave(updatedSupports);
      }
      
      // Reset the form
      resetForm();
      setIsAdding(false);
      
      toast({
        title: "Contenu ajouté",
        description: "Le contenu a été ajouté avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout du contenu:", error);
      setError("Une erreur est survenue lors de l'ajout du contenu.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSupport = async () => {
    setError(null);
    setLoading(true);
    
    if (!validateSupport()) {
      setLoading(false);
      return;
    }

    try {
      const supportToUpdate = supports[editIndex];
      
      // Update the support via the API
      const updatedSupport = await contenuService.updateContenu(
        supportToUpdate.id,
        {
          ...currentSupport,
          file: file
        }
      );
      
      // Update the support in the local state
      const updatedSupports = [...supports];
      updatedSupports[editIndex] = updatedSupport;
      
      setSupports(updatedSupports);
      
      // Call the parent component's save function with the updated supports
      if (onSave) {
        onSave(updatedSupports);
      }
      
      // Reset the form
      resetForm();
      setIsAdding(false);
      setIsEditing(false);
      setEditIndex(null);
      
      toast({
        title: "Contenu mis à jour",
        description: "Le contenu a été mis à jour avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du contenu:", error);
      setError("Une erreur est survenue lors de la mise à jour du contenu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupport = async (index) => {
    // Ask for confirmation
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?")) {
      return;
    }

    const supportToDelete = supports[index];
    setLoading(true);
    
    try {
      // Delete the support via the contenuService API
      await contenuService.deleteSupport(supportToDelete.id);
      
      // Update the local state
      const updatedSupports = [...supports];
      updatedSupports.splice(index, 1);
      
      setSupports(updatedSupports);
      
      // Call the parent component's save function
      if (onSave) {
        onSave(updatedSupports);
      }
      
      toast({
        title: "Contenu supprimé",
        description: "Le contenu a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du contenu:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du contenu.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditSupport = (index) => {
    setIsEditing(true);
    setEditIndex(index);
    setIsAdding(true);
    
    const supportToEdit = supports[index];
    setCurrentSupport({
      ...supportToEdit,
      // Don't include the file since we don't have access to it,
      // user will need to select a new file if they want to update it
    });
    
    // If it's a PDF or VIDEO with an existing link, note it but don't set file
    setFile(null); // Reset the file state since we can't retrieve the original file
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "VIDEO":
        return <Video className="h-5 w-5 text-purple-500" />;
      case "TEXT":
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contenus du module</CardTitle>
        <CardDescription>
          Ajoutez des documents PDF, des textes ou des vidéos à ce module.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* List of existing supports */}
        {supports.length > 0 ? (
          <div className="space-y-4">
            {supports.map((support, index) => (
              <div 
                key={support.id} 
                className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getTypeIcon(support.type)}
                  <div>
                    <h4 className="font-medium">{support.titre}</h4>
                    <p className="text-sm text-gray-500">{support.description}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{support.duree} minutes</span>
                    </div>
                  </div>
                </div>
                {!readOnly && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditSupport(index)}
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteSupport(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border rounded-md bg-gray-50">
            <p className="text-gray-500">Aucun contenu ajouté pour ce module.</p>
            <p className="text-sm text-gray-400">Utilisez le formulaire ci-dessous pour ajouter des contenus.</p>
          </div>
        )}

        {!readOnly && (
          <>
            {/* Add new support button */}
            {!isAdding && (
              <div className="flex justify-center">
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un contenu
                </Button>
              </div>
            )}

            {/* Add/Edit support form */}
            {isAdding && (
              <Card className="border-2 border-blue-100">
                <CardHeader>
                  <CardTitle>{isEditing ? "Modifier le contenu" : "Ajouter un contenu"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type de contenu</Label>
                      <Select value={currentSupport.type} onValueChange={handleTypeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="TEXT">Texte</SelectItem>
                          <SelectItem value="VIDEO">Vidéo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duree">Durée estimée (minutes)</Label>
                      <Input
                        id="duree"
                        name="duree"
                        type="number"
                        min="1"
                        step="1"
                        value={currentSupport.duree}
                        onChange={handleChange}
                        placeholder="Ex: 15"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titre">Titre</Label>
                    <Input
                      id="titre"
                      name="titre"
                      value={currentSupport.titre}
                      onChange={handleChange}
                      placeholder="Entrez le titre du contenu"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={currentSupport.description}
                      onChange={handleChange}
                      placeholder="Décrivez brièvement ce contenu"
                      rows={2}
                    />
                  </div>

                  {currentSupport.type === "TEXT" ? (
                    <div className="space-y-2">
                      <Label htmlFor="file">Fichier texte</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".txt,.md,.rtf,.text,text/plain"
                        onChange={handleFileChange}
                      />
                      {file && (
                        <div className="p-2 border rounded-md">
                          <div className="flex items-center text-blue-600">
                            <FileText className="h-5 w-5 mr-2" />
                            <span>{file.name}</span>
                          </div>
                        </div>
                      )}
                      
                      {currentSupport.lien && !file && isEditing && (
                        <div className="p-2 border rounded-md">
                          <div className="flex items-center text-blue-600">
                            <FileText className="h-5 w-5 mr-2" />
                            <a href={currentSupport.lien} target="_blank" rel="noopener noreferrer" className="underline">
                              Voir le fichier texte actuel
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="file">
                          {currentSupport.type === "PDF" ? "Fichier PDF" : "Fichier vidéo"}
                        </Label>
                        <Input
                          id="file"
                          type="file"
                          accept={currentSupport.type === "PDF" ? ".pdf" : "video/*"}
                          onChange={handleFileChange}
                        />
                      </div>

                      {file && (
                        <div className="p-2 border rounded-md">
                          <div className="flex items-center text-blue-600">
                            {currentSupport.type === "PDF" ? (
                              <FileText className="h-5 w-5 mr-2" />
                            ) : (
                              <Video className="h-5 w-5 mr-2" />
                            )}
                            <span>{file.name}</span>
                          </div>
                        </div>
                      )}

                      {currentSupport.lien && !file && isEditing && (
                        <div className="p-2 border rounded-md">
                          <div className="flex items-center text-blue-600">
                            {currentSupport.type === "PDF" ? (
                              <FileText className="h-5 w-5 mr-2" />
                            ) : (
                              <Video className="h-5 w-5 mr-2" />
                            )}
                            <a href={currentSupport.lien} target="_blank" rel="noopener noreferrer" className="underline">
                              {currentSupport.type === "PDF" ? "Voir le PDF actuel" : "Voir la vidéo actuelle"}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => {
                      resetForm();
                      setIsAdding(false);
                      setIsEditing(false);
                      setEditIndex(null);
                    }} disabled={loading}>
                      Annuler
                    </Button>
                    <Button
                      onClick={isEditing ? handleUpdateSupport : handleAddSupport}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isEditing ? "Mise à jour..." : "Ajout..."}
                        </>
                      ) : (
                        isEditing ? "Mettre à jour" : "Ajouter"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ModuleSupportsManager;
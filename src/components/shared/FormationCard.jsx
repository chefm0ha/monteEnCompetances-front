import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Clock, 
  ArrowRight, 
  Plus, 
  ExternalLink,
  FolderPlus 
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const FormationCard = ({ formation, onAddModule, allModules = [], navigate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("new");
  const [newModule, setNewModule] = useState({
    title: "",
    description: "",
    formationId: formation.id
  });
  const [selectedModuleId, setSelectedModuleId] = useState("");

  // Filter out modules that already belong to this formation
  const availableModules = allModules.filter(
    module => module.formationId !== formation.id
  );

  const getStatusBadge = () => {
    if (formation.progress === 100) {
      return <Badge className="bg-green-500">Terminée</Badge>;
    } else if (formation.progress > 0) {
      return <Badge className="bg-blue-500">En cours</Badge>;
    } else {
      return <Badge className="bg-gray-500">Non commencée</Badge>;
    }
  };

  const handleCardClick = () => {
    navigate(`/formation/${formation.id}`);
  };

  const handleAddModuleClick = (e) => {
    e.stopPropagation(); // Prevent card click from triggering
    setIsDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewModule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitNewModule = (e) => {
    e.preventDefault();
    // Call the provided onAddModule function with the new module data
    onAddModule(newModule, "create");
    
    // Reset form and close dialog
    setNewModule({
      title: "",
      description: "",
      formationId: formation.id
    });
    setIsDialogOpen(false);
  };

  const handleLinkModule = (e) => {
    e.preventDefault();
    if (!selectedModuleId) return;
    
    // Call the provided onAddModule function with the selected module ID
    onAddModule({ id: selectedModuleId, formationId: formation.id }, "link");
    
    // Reset selection and close dialog
    setSelectedModuleId("");
    setIsDialogOpen(false);
  };

  return (
    <>
      <Card 
        className="h-full flex flex-col overflow-hidden cursor-pointer relative hover:shadow-md transition-shadow duration-200"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{formation.title}</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <div className="relative w-full h-48">
          <img
            src={formation.lienPhoto || "/course_placeholder.png"}
            alt={formation.title}
            className="w-full h-full object-cover"
          />
          <Button 
            size="sm" 
            variant="default" 
            className="absolute bottom-3 right-3 opacity-90 hover:opacity-100"
            onClick={handleAddModuleClick}
          >
            <Plus className="h-4 w-4 mr-1" />
            Module
          </Button>
        </div>
        <CardContent className="flex-grow pt-6">
          <p className="text-gray-600 mb-4 line-clamp-3">{formation.description}</p>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formation.duration} heures</span>
          </div>
          <ProgressBar value={formation.completedModules} total={formation.totalModules} />
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            {formation.progress === 0 ? "Voir les détails" : "Continuer"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog for adding a new module or linking an existing one */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un module à {formation.title}</DialogTitle>
            <DialogDescription>
              Créez un nouveau module ou liez un module existant à cette formation
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">Nouveau module</TabsTrigger>
              <TabsTrigger value="existing" disabled={availableModules.length === 0}>
                Module existant
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="new" className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newModule.title}
                    onChange={handleInputChange}
                    placeholder="Entrez le titre du module"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newModule.description}
                    onChange={handleInputChange}
                    placeholder="Entrez la description du module"
                    rows={3}
                  />
                </div>
                
                <DialogFooter className="mt-6">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmitNewModule(e);
                    }} 
                    disabled={!newModule.title}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Créer et ajouter
                  </Button>
                </DialogFooter>
              </div>
            </TabsContent>
            
            <TabsContent value="existing" className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="moduleId">Sélectionner un module</Label>
                  {availableModules.length > 0 ? (
                    <Select 
                      value={selectedModuleId} 
                      onValueChange={setSelectedModuleId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un module" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModules.map(module => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Aucun module disponible à lier à cette formation.
                    </p>
                  )}
                </div>
                
                <DialogFooter className="mt-6">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLinkModule(e);
                    }}
                    disabled={!selectedModuleId || availableModules.length === 0}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lier à la formation
                  </Button>
                </DialogFooter>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormationCard;
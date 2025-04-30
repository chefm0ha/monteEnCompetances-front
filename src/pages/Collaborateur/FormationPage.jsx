// src/pages/FormationsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { formationService } from "../../services/formationService";
import { moduleService } from "../../services/moduleService";
import FormationCard from "../../components/shared/FormationCard";

const FormationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formations, setFormations] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  
  const formationTypes = [
    "Technique",
    "Management",
    "Soft Skills",
    "Conformité",
    "Sécurité",
    "Autre"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [formationsData, modulesData] = await Promise.all([
        formationService.getAllFormations(),
        moduleService.getAllModules()
      ]);
      
      // Transform the data to match the FormationCard component props
      const formattedFormations = formationsData.map(formation => ({
        id: formation.id,
        title: formation.titre,
        description: formation.description,
        duration: formation.duree,
        lienPhoto: formation.lienPhoto,
        type: formation.type,
        progress: calculateProgress(formation.id),
        totalModules: formation.modules?.length || 0,
        completedModules: calculateCompletedModules(formation.id)
      }));
      
      setFormations(formattedFormations);
      setModules(modulesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load formations. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate formation progress (mock implementation)
  const calculateProgress = (formationId) => {
    // In a real implementation, this would come from the user's progress data
    // For now, just return a random value between 0 and 100
    return Math.floor(Math.random() * 101);
  };
  
  // Helper function to calculate completed modules (mock implementation)
  const calculateCompletedModules = (formationId) => {
    // In a real implementation, this would come from the user's progress data
    // For now, just return a random value
    const formation = formations.find(f => f.id === formationId);
    const totalModules = formation?.totalModules || Math.floor(Math.random() * 10);
    return Math.floor(Math.random() * (totalModules + 1));
  };
  
  const handleAddModule = async (moduleData, action) => {
    try {
      if (action === "create") {
        // Create a new module
        const response = await moduleService.createModule(moduleData);
        toast({
          title: "Module créé",
          description: "Le module a été ajouté à la formation avec succès."
        });
        
        // Update the modules list
        setModules(prev => [...prev, response]);
        
        // Update the formations list
        setFormations(prev => 
          prev.map(formation => 
            formation.id === moduleData.formationId 
              ? { 
                  ...formation, 
                  totalModules: formation.totalModules + 1 
                } 
              : formation
          )
        );
      } else if (action === "link") {
        // Link an existing module to this formation
        const moduleToUpdate = modules.find(m => m.id === moduleData.id);
        
        if (moduleToUpdate) {
          const updatedModule = { 
            ...moduleToUpdate, 
            formationId: moduleData.formationId 
          };
          
          // Update the module in the API
          await moduleService.updateModule(moduleData.id, updatedModule);
          
          toast({
            title: "Module lié",
            description: "Le module existant a été lié à la formation avec succès."
          });
          
          // Update the modules list
          setModules(prev => 
            prev.map(m => m.id === moduleData.id ? updatedModule : m)
          );
          
          // Update the formations list
          setFormations(prev => 
            prev.map(formation => 
              formation.id === moduleData.formationId 
                ? { 
                    ...formation, 
                    totalModules: formation.totalModules + 1 
                  } 
                : formation
            )
          );
        }
      }
    } catch (error) {
      console.error("Error adding module:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le module. Veuillez réessayer."
      });
    }
  };
  
  const handleCreateFormation = () => {
    navigate("/admin/formations/new");
  };
  
  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        formation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || formation.type === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formations</h1>
          <p className="text-gray-500">Parcourez les formations disponibles ou créez-en une nouvelle</p>
        </div>
        <Button onClick={handleCreateFormation}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle formation
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Rechercher une formation..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {formationTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredFormations.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-gray-50">
          <p className="text-gray-500">Aucune formation trouvée</p>
          <p className="text-sm text-gray-400 mt-2">
            {searchTerm || selectedType !== "all" 
              ? "Essayez de modifier vos critères de recherche" 
              : "Créez une nouvelle formation pour commencer"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFormations.map(formation => (
            <FormationCard 
              key={formation.id}
              formation={formation}
              allModules={modules}
              onAddModule={handleAddModule}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FormationsPage;

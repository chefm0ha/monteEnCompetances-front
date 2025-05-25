import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { moduleService } from "../services/moduleService";
import { formationService } from "../services/formationService";
import { useToast } from "../hooks/use-toast";
import ModuleSupportsManager from "../components/ModuleSupportsManager";
import QuizFormWithPreview from "../components/QuizFormWithPreview";

const ModuleForm = () => {
  const { formationId, moduleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(moduleId ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [formations, setFormations] = useState([]);
  const [module, setModule] = useState({
    titre: "",
    description: "",
    formationId: formationId || "",
    supports: [],
    hasQuiz: false,
    quiz: {
      titre: "Quiz du module",
      description: "Évaluez vos connaissances sur ce module",
      moduleId: moduleId || "",
      seuilReussite: 70,
      questions: []
    }
  });

  useEffect(() => {
    fetchFormations();
    if (moduleId) {
      fetchModule(moduleId);
    }
  }, [moduleId]);

  const fetchFormations = async () => {
    try {
      const data = await formationService.getAllFormations();
      setFormations(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des formations:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer la liste des formations."
      });
    }
  };

  const fetchModule = async (id) => {
    try {
      setLoading(true);
      const data = await moduleService.getModuleById(id);
      
      // Initialize the quiz state properly
      const hasQuiz = data.quizs && data.quizs.length > 0;
      const quiz = hasQuiz ? data.quizs[0] : {
        titre: "Quiz du module",
        description: "Évaluez vos connaissances sur ce module",
        moduleId: id,
        seuilReussite: 70,
        questions: []
      };
      
      setModule({
        ...data,
        hasQuiz,
        quiz
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du module:", error);
      setError("Impossible de récupérer les détails du module.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les détails du module."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setModule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuizToggle = (checked) => {
    setModule(prev => ({
      ...prev,
      hasQuiz: checked
    }));
  };

  const handleQuizChange = (updatedQuiz) => {
    setModule(prev => ({
      ...prev,
      quiz: updatedQuiz
    }));
  };

  const handleSupportsChange = (updatedSupports) => {
    // Just update the local state with the received supports
    // The actual API calls are now handled by the ModuleSupportsManager component
    setModule(prev => ({
      ...prev,
      supports: updatedSupports
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!module.titre.trim()) {
      setError("Le titre du module est obligatoire");
      setActiveTab("details");
      return;
    }
    
    if (!module.formationId) {
      setError("Veuillez sélectionner une formation");
      setActiveTab("details");
      return;
    }

    // Préparation des données
    const moduleData = { 
      ...module,
      // Include or exclude quiz based on hasQuiz flag
      quizs: module.hasQuiz ? [module.quiz] : []
    };

    // Delete the hasQuiz field as it's not needed in the API
    delete moduleData.hasQuiz;
    
    try {
      setSaving(true);
      setError(null);

      let response;
      if (moduleId) {
        // Mise à jour d'un module existant
        response = await moduleService.updateModule(moduleId, moduleData);
        toast({
          title: "Module mis à jour",
          description: "Le module a été mis à jour avec succès."
        });
      } else {
        // Création d'un nouveau module
        response = await moduleService.createModule(
          { formationId: module.formationId },
          moduleData
        );
        toast({
          title: "Module créé",
          description: "Le module a été créé avec succès."
        });
      }
      
      // Redirection vers la liste des modules après un court délai
      setTimeout(() => {
        navigate(`/admin/formations/${module.formationId}/modules`);
      }, 1000);
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du module:", error);
      setError("Impossible de sauvegarder le module. Veuillez réessayer plus tard.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder le module."
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate(`/admin/formations/${module.formationId}/modules`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {moduleId ? "Modifier le module" : "Nouveau module"}
          </h1>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="supports">Contenus</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Informations du module</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre</Label>
                  <Input
                    id="titre"
                    name="titre"
                    value={module.titre}
                    onChange={handleChange}
                    placeholder="Entrez le titre du module"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={module.description}
                    onChange={handleChange}
                    placeholder="Entrez la description du module"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formationId">Formation</Label>
                  <Select
                    value={module.formationId}
                    onValueChange={(value) => handleSelectChange("formationId", value)}
                    disabled={!!formationId}
                  >
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
          </TabsContent>

          <TabsContent value="supports">
            <ModuleSupportsManager
              moduleId={moduleId}
              initialSupports={module.supports || []}
              onSave={handleSupportsChange}
            />
          </TabsContent>

          <TabsContent value="quiz">
            <Card>
              <CardHeader>
                <CardTitle>Quiz du module</CardTitle>
                <CardDescription>
                  Configurer le quiz d'évaluation pour ce module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasQuiz"
                    checked={module.hasQuiz}
                    onCheckedChange={handleQuizToggle}
                  />
                  <Label htmlFor="hasQuiz">Inclure un quiz</Label>
                </div>

                {module.hasQuiz && (
                  <div className="mt-4">
                    <QuizFormWithPreview
                      onSave={handleQuizChange}
                      initialData={module.quiz}
                      moduleId={moduleId}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {moduleId ? "Mettre à jour" : "Créer le module"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
};

export default ModuleForm;
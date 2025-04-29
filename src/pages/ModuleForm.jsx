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
import { AlertCircle, ArrowLeft, FileText, Loader2, Plus, Save, Trash2, Video } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { moduleService } from "../services/moduleService";
import { formationService } from "../services/formationService";
import { useToast } from "../hooks/use-toast";
import SupportForm from "../components/SupportForm";

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
    quizs: [],
  });
  const [newSupport, setNewSupport] = useState({
    type: "PDF",
    titre: "",
    description: "",
    lien: "",
    duree: "",
  });
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quiz, setQuiz] = useState({
    titre: "Quiz du module",
    questions: [],
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
      setModule(data);
      
      // Si le module a des quiz, initialiser l'état
      if (data.quizs && data.quizs.length > 0) {
        setHasQuiz(true);
        setQuiz(data.quizs[0]);
      }
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

  const handleSupportChange = (e) => {
    const { name, value } = e.target;
    setNewSupport(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSupportSelectChange = (name, value) => {
    setNewSupport(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSupport = () => {
    // Validation des champs obligatoires
    if (!newSupport.titre.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le titre du contenu est obligatoire."
      });
      return;
    }

    if (!newSupport.duree || isNaN(newSupport.duree) || Number(newSupport.duree) <= 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer une durée valide (en minutes)."
      });
      return;
    }

    // Ajouter le nouveau support avec un ID temporaire
    const tempId = Date.now().toString();
    const support = {
      ...newSupport,
      id: tempId,
      moduleId: moduleId || tempId
    };

    setModule(prev => ({
      ...prev,
      supports: [...prev.supports, support]
    }));

    // Réinitialiser le formulaire
    setNewSupport({
      type: "PDF",
      titre: "",
      description: "",
      lien: "",
      duree: "",
    });

    toast({
      title: "Contenu ajouté",
      description: "Le contenu a été ajouté à la liste. N'oubliez pas de sauvegarder le module."
    });
  };

  const removeSupport = (supportId) => {
    setModule(prev => ({
      ...prev,
      supports: prev.supports.filter(support => support.id !== supportId)
    }));

    toast({
      title: "Contenu supprimé",
      description: "Le contenu a été supprimé de la liste."
    });
  };

  const handleQuizToggle = (checked) => {
    setHasQuiz(checked);
  };

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      contenu: "",
      choix: [
        { id: `${Date.now()}-1`, contenu: "", estCorrect: true },
        { id: `${Date.now()}-2`, contenu: "", estCorrect: false },
        { id: `${Date.now()}-3`, contenu: "", estCorrect: false },
        { id: `${Date.now()}-4`, contenu: "", estCorrect: false }
      ]
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (questionId) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleQuestionChange = (questionId, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, contenu: value } : q
      )
    }));
  };

  const handleChoiceChange = (questionId, choiceId, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              choix: q.choix.map(c => 
                c.id === choiceId ? { ...c, contenu: value } : c
              ) 
            } 
          : q
      )
    }));
  };

  const handleCorrectAnswerChange = (questionId, choiceId) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              choix: q.choix.map(c => ({ ...c, estCorrect: c.id === choiceId }))
            } 
          : q
      )
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

    // Vérifier les questions du quiz si activé
    if (hasQuiz) {
      if (!quiz.titre.trim()) {
        setError("Le titre du quiz est obligatoire");
        setActiveTab("quiz");
        return;
      }

      if (quiz.questions.length === 0) {
        setError("Ajoutez au moins une question au quiz");
        setActiveTab("quiz");
        return;
      }

      // Vérifier que chaque question a un contenu et des choix valides
      for (const question of quiz.questions) {
        if (!question.contenu.trim()) {
          setError("Toutes les questions doivent avoir un contenu");
          setActiveTab("quiz");
          return;
        }

        for (const choix of question.choix) {
          if (!choix.contenu.trim()) {
            setError("Tous les choix de réponse doivent avoir un contenu");
            setActiveTab("quiz");
            return;
          }
        }
      }
    }

    try {
      setSaving(true);
      setError(null);

      // Préparer les données du module
      const moduleData = { ...module };
      
      // Ajouter le quiz si activé
      if (hasQuiz) {
        moduleData.quizs = [quiz];
      } else {
        moduleData.quizs = [];
      }

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
        response = await moduleService.createModule(moduleData);
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
            <Card>
              <CardHeader>
                <CardTitle>Contenus du module</CardTitle>
                <CardDescription>
                  Ajoutez les différents contenus de ce module (documents PDF, textes, vidéos)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Liste des supports existants */}
                {module.supports && module.supports.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contenus ajoutés</h3>
                    {module.supports.map((support) => (
                      <div key={support.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center space-x-3">
                          {support.type === "PDF" && <FileText className="h-5 w-5 text-red-500" />}
                          {support.type === "VIDEO" && <Video className="h-5 w-5 text-purple-500" />}
                          {support.type === "TEXT" && <FileText className="h-5 w-5 text-blue-500" />}
                          <div>
                            <h4 className="font-medium">{support.titre}</h4>
                            <p className="text-sm text-gray-500">{support.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-gray-500">{support.duree} min</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeSupport(support.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-md bg-gray-50">
                    <p className="text-gray-500">Aucun contenu ajouté pour ce module.</p>
                    <p className="text-sm text-gray-400">Utilisez le formulaire ci-dessous pour ajouter des contenus.</p>
                  </div>
                )}

                {/* Formulaire d'ajout de support */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Ajouter un nouveau contenu</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="supportType">Type de contenu</Label>
                        <Select
                          value={newSupport.type}
                          onValueChange={(value) => handleSupportSelectChange("type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PDF">PDF</SelectItem>
                            <SelectItem value="TEXT">Texte</SelectItem>
                            <SelectItem value="VIDEO">Vidéo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="supportDuree">Durée estimée (minutes)</Label>
                        <Input
                          id="supportDuree"
                          name="duree"
                          type="number"
                          min="1"
                          value={newSupport.duree}
                          onChange={handleSupportChange}
                          placeholder="Durée en minutes"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supportTitre">Titre</Label>
                      <Input
                        id="supportTitre"
                        name="titre"
                        value={newSupport.titre}
                        onChange={handleSupportChange}
                        placeholder="Entrez le titre du contenu"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supportDescription">Description</Label>
                      <Textarea
                        id="supportDescription"
                        name="description"
                        value={newSupport.description}
                        onChange={handleSupportChange}
                        placeholder="Entrez une description du contenu"
                        rows={2}
                      />
                    </div>

                    {newSupport.type !== "TEXT" && (
                      <div className="space-y-2">
                        <Label htmlFor="supportLien">
                          {newSupport.type === "PDF" ? "Fichier PDF" : "Vidéo"}
                        </Label>
                        <Input
                          id="supportLien"
                          name="lien"
                          type="file"
                          accept={newSupport.type === "PDF" ? ".pdf" : "video/*"}
                          onChange={(e) => {
                            // Pour l'instant, on stocke juste le nom du fichier
                            if (e.target.files && e.target.files[0]) {
                              handleSupportChange({
                                target: {
                                  name: "lien",
                                  value: e.target.files[0].name
                                }
                              });
                            }
                          }}
                        />
                      </div>
                    )}

                    {newSupport.type === "TEXT" && (
                      <div className="space-y-2">
                        <Label htmlFor="supportContenu">Contenu</Label>
                        <Textarea
                          id="supportContenu"
                          name="lien"
                          value={newSupport.lien}
                          onChange={handleSupportChange}
                          placeholder="Entrez le texte du contenu"
                          rows={5}
                        />
                      </div>
                    )}

                    <Button type="button" onClick={addSupport}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter ce contenu
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                    checked={hasQuiz}
                    onCheckedChange={handleQuizToggle}
                  />
                  <Label htmlFor="hasQuiz">Inclure un quiz</Label>
                </div>

                {hasQuiz && (
                  <div className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="quizTitre">Titre du quiz</Label>
                      <Input
                        id="quizTitre"
                        name="titre"
                        value={quiz.titre}
                        onChange={handleQuizChange}
                        placeholder="Entrez le titre du quiz"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Questions</h3>
                        <Button type="button" variant="outline" onClick={addQuestion}>
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une question
                        </Button>
                      </div>

                      {quiz.questions.length === 0 ? (
                        <div className="text-center py-10 border rounded-md bg-gray-50">
                          <p className="text-gray-500">Aucune question ajoutée.</p>
                          <p className="text-sm text-gray-400">Cliquez sur "Ajouter une question" pour commencer.</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {quiz.questions.map((question, qIndex) => (
                            <Card key={question.id}>
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeQuestion(question.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`question-${question.id}`}>Énoncé de la question</Label>
                                  <Textarea
                                    id={`question-${question.id}`}
                                    value={question.contenu}
                                    onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                                    placeholder="Entrez l'énoncé de la question"
                                    rows={2}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Réponses possibles</Label>
                                  <p className="text-xs text-gray-500">Cochez la réponse correcte</p>
                                  
                                  <div className="space-y-2">
                                    {question.choix.map((choix) => (
                                      <div key={choix.id} className="flex items-center space-x-2">
                                        <input
                                          type="radio"
                                          id={`choice-${choix.id}`}
                                          name={`correct-${question.id}`}
                                          checked={choix.estCorrect}
                                          onChange={() => handleCorrectAnswerChange(question.id, choix.id)}
                                          className="h-4 w-4 text-blue-600"
                                        />
                                        <Input
                                          value={choix.contenu}
                                          onChange={(e) => handleChoiceChange(question.id, choix.id, e.target.value)}
                                          placeholder="Entrez une réponse possible"
                                          className="flex-1"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
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
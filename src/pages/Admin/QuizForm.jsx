import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  AlertCircle, 
  Save, 
  Loader2, 
  Plus,
  Eye,
  Trash2
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { quizService } from "../../services/quizService";
import QuizManager from "./QuizManager";
import QuizPreviewModal from "./QuizPreviewModal";
import Swal from 'sweetalert2'

const QuizForm = ({ moduleId, onQuizSaved = null, readOnly = false }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("existing");

  useEffect(() => {
    if (moduleId) {
      fetchQuizzes();
    }
  }, [moduleId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const fetchedQuizzes = await quizService.getQuizzesByModule(moduleId);
      setQuizzes(fetchedQuizzes);
      
      // If there's a quiz, load it
      if (fetchedQuizzes.length > 0) {
        const quizWithDetails = await quizService.getQuizById(fetchedQuizzes[0].id);
        setCurrentQuiz(quizWithDetails);
        setActiveTab("existing");
      } else {
        setActiveTab("create");
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setError("Impossible de récupérer les quiz du module.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewQuiz = () => {
    setCurrentQuiz(null);
    setActiveTab("create");
  };

  const handleQuizSaved = async (savedQuiz) => {
    try {
      // Refresh the quiz list
      await fetchQuizzes();
      
      if (onQuizSaved) {
        onQuizSaved(savedQuiz);
      }
      
      toast({
        title: "Quiz sauvegardé",
        description: "Le quiz a été sauvegardé avec succès."
      });
    } catch (error) {
      console.error("Error after saving quiz:", error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz ?")) {
      return;
    }

    try {
      setSaving(true);
      await quizService.deleteQuiz(quizId);
      
      // Refresh the quiz list
      await fetchQuizzes();
      setCurrentQuiz(null);
      
      Swal.fire({
        title: 'Succès!',
        text: 'Le quiz a été supprimé avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de supprimer le quiz.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing" disabled={quizzes.length === 0}>
            Quiz existants ({quizzes.length})
          </TabsTrigger>
          <TabsTrigger value="create">
            {quizzes.length === 0 ? "Créer un quiz" : "Nouveau quiz"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          {quizzes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <p className="text-gray-500">Aucun quiz trouvé pour ce module.</p>
                <Button 
                  className="mt-4" 
                  onClick={handleCreateNewQuiz}
                  disabled={readOnly}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{quiz.titre}</CardTitle>
                        <CardDescription>{quiz.description}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewQuiz(quiz)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Aperçu
                        </Button>
                        {!readOnly && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                            Supprimer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      <p>Seuil de réussite: {quiz.seuilReussite}%</p>
                      <p>Questions: {quiz.questions?.length || 0}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {!readOnly && (
                <Card>
                  <CardContent className="text-center py-6">
                    <Button onClick={handleCreateNewQuiz}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un nouveau quiz
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <QuizManager
            moduleId={moduleId}
            initialQuiz={null}
            onSave={handleQuizSaved}
            readOnly={readOnly}
          />
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      <QuizPreviewModal 
        open={previewOpen} 
        onOpenChange={setPreviewOpen} 
        quiz={currentQuiz}
      />
    </div>
  );
};

export default QuizForm;
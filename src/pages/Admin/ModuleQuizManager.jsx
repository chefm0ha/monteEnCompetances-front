import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { moduleService } from "../services/moduleService";
import QuizFormWithPreview from "../components/QuizFormWithPreview";
import QuizPreviewModal from "../components/QuizPreviewModal";
import Swal from 'sweetalert2';

const ModuleQuizManager = ({ moduleId, initialHasQuiz = false, initialQuiz = null, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasQuiz, setHasQuiz] = useState(initialHasQuiz);
  const [quiz, setQuiz] = useState(initialQuiz);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialHasQuiz && !quiz && moduleId) {
      fetchQuiz();
    }
  }, [moduleId, initialHasQuiz]);

  useEffect(() => {
    // Notifier le composant parent des changements
    if (onChange) {
      onChange({ hasQuiz, quiz });
    }
  }, [hasQuiz, quiz, onChange]);

  const fetchQuiz = async () => {
    if (!moduleId) return;

    try {
      setLoading(true);
      const quizData = await moduleService.getQuiz(moduleId);
      setQuiz(quizData);
    } catch (error) {
      console.error("Erreur lors de la récupération du quiz:", error);
      setError("Impossible de récupérer le quiz. Il sera créé à partir de zéro.");
        // Initialiser un quiz vide
      setQuiz({
        titre: "Quiz d'évaluation",
        moduleId: moduleId,
        seuilReussite: 70,
        questions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuiz = (checked) => {
    setHasQuiz(checked);
      // Si on active le quiz et qu'il n'y a pas déjà un, en créer un nouveau
    if (checked && !quiz) {
      setQuiz({
        titre: "Quiz d'évaluation",
        moduleId: moduleId,
        seuilReussite: 70,
        questions: [],
      });
    }
  };

  const handleSaveQuiz = (updatedQuiz) => {
    setQuiz(updatedQuiz);
    
    // Optionnel: sauvegarder immédiatement sur le serveur
    if (moduleId) {
      saveQuizToServer(updatedQuiz);
    }
  };

  const saveQuizToServer = async (quizData) => {
    if (!moduleId) return;
    
    try {
      await moduleService.saveQuiz(moduleId, quizData);
      Swal.fire({
        title: 'Quiz sauvegardé',
        text: 'Le quiz a été sauvegardé avec succès.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du quiz:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de sauvegarder le quiz sur le serveur. Vos modifications sont conservées localement.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  // Si le module est en cours de création (pas d'ID), ne pas essayer de charger le quiz
  if (!moduleId && !initialQuiz) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz du module</CardTitle>
          <CardDescription>
            Configurez un quiz d'évaluation pour ce module. Sauvegardez d'abord le module pour configurer le quiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sauvegardez d'abord le module pour pouvoir ajouter un quiz.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz du module</CardTitle>
        <CardDescription>
          Configurez un quiz d'évaluation pour ce module
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="hasQuiz"
            checked={hasQuiz}
            onCheckedChange={handleToggleQuiz}
          />
          <Label htmlFor="hasQuiz">Inclure un quiz</Label>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasQuiz && quiz && (
          <div className="mt-4">
            <QuizFormWithPreview
              onSave={handleSaveQuiz}
              initialData={quiz}
              moduleId={moduleId}
            />
          </div>
        )}

        {hasQuiz && !quiz && loading && (
          <div className="text-center py-10">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Chargement du quiz...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModuleQuizManager;
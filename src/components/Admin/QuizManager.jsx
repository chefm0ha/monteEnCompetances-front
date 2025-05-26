import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  AlertCircle, 
  Plus, 
  Trash2, 
  Move, 
  Check, 
  Save, 
  Loader2, 
  HelpCircle,
  Eye,
  X
} from "lucide-react";
import Swal from 'sweetalert2';
import { quizService } from "../../services/quizService";
import QuizPreviewModal from "./QuizPreviewModal";

const QuizManager = ({ moduleId, initialQuiz = null, onSave, readOnly = false }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(
    initialQuiz ? quizService.transformQuizFromBackend(initialQuiz) : {
      titre: "Quiz d'évaluation",
      description: "Évaluez vos connaissances sur ce module",
      moduleId: moduleId,
      seuilReussite: 70,
      questions: [],
    }
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (moduleId && (!quiz.moduleId || quiz.moduleId !== moduleId)) {
      setQuiz(prev => ({ ...prev, moduleId }));
    }

    if (initialQuiz) {
      setQuiz(quizService.transformQuizFromBackend(initialQuiz));
    }
  }, [moduleId, initialQuiz]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (!isNaN(numValue)) {
      setQuiz((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `temp_${Date.now()}`, // Temporary ID for frontend
      contenu: "",
      choix: [
        { id: `temp_${Date.now()}_1`, contenu: "", estCorrect: true },
        { id: `temp_${Date.now()}_2`, contenu: "", estCorrect: false },
        { id: `temp_${Date.now()}_3`, contenu: "", estCorrect: false },
        { id: `temp_${Date.now()}_4`, contenu: "", estCorrect: false },
      ],
    };

    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const removeQuestion = (questionId) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
  };

  const moveQuestionUp = (index) => {
    if (index === 0) return;

    const newQuestions = [...quiz.questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[index - 1];
    newQuestions[index - 1] = temp;

    setQuiz((prev) => ({
      ...prev,
      questions: newQuestions,
    }));
  };

  const moveQuestionDown = (index) => {
    if (index === quiz.questions.length - 1) return;

    const newQuestions = [...quiz.questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[index + 1];
    newQuestions[index + 1] = temp;

    setQuiz((prev) => ({
      ...prev,
      questions: newQuestions,
    }));
  };

  const handleQuestionChange = (questionId, value) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, contenu: value } : q
      ),
    }));
  };

  const handleChoiceChange = (questionId, choiceId, value) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              choix: q.choix.map((c) =>
                c.id === choiceId ? { ...c, contenu: value } : c
              ),
            }
          : q
      ),
    }));
  };

  const handleCorrectAnswerChange = (questionId, choiceId) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              choix: q.choix.map((c) => ({
                ...c,
                estCorrect: c.id === choiceId,
              })),
            }
          : q
      ),
    }));
  };

  const addChoice = (questionId) => {
    const newChoiceId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              choix: [
                ...q.choix,
                { id: newChoiceId, contenu: "", estCorrect: false },
              ],
            }
          : q
      ),
    }));
  };

  const removeChoice = (questionId, choiceId) => {
    const question = quiz.questions.find(q => q.id === questionId);
    const choiceToRemove = question?.choix.find(c => c.id === choiceId);
    const isCorrectChoice = choiceToRemove?.estCorrect || false;
    
    if (question.choix.length <= 2) {
      Swal.fire({
        title: 'Erreur',
        text: 'Une question doit avoir au moins deux choix de réponse',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              choix: q.choix.filter((c) => c.id !== choiceId),
            }
          : q
      ),
    }));
    
    if (isCorrectChoice) {
      setTimeout(() => {
        const updatedQuestion = quiz.questions.find(q => q.id === questionId);
        if (updatedQuestion && updatedQuestion.choix.length > 0) {
          handleCorrectAnswerChange(questionId, updatedQuestion.choix[0].id);
        }
      }, 0);
    }
  };

  const validateQuiz = () => {
    if (!quiz.titre.trim()) {
      setError("Le titre du quiz est obligatoire");
      return false;
    }
    
    if (quiz.questions.length === 0) {
      setError("Le quiz doit contenir au moins une question");
      return false;
    }
    
    for (const question of quiz.questions) {
      if (!question.contenu.trim()) {
        setError("Toutes les questions doivent avoir un contenu");
        return false;
      }
      
      if (question.choix.length < 2) {
        setError("Chaque question doit avoir au moins deux choix de réponse");
        return false;
      }
      
      for (const choix of question.choix) {
        if (!choix.contenu.trim()) {
          setError("Tous les choix de réponse doivent avoir un contenu");
          return false;
        }
      }
      
      const hasCorrectAnswer = question.choix.some(c => c.estCorrect);
      if (!hasCorrectAnswer) {
        setError("Chaque question doit avoir une réponse correcte");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!validateQuiz()) {
      return;
    }
    
    setSaving(true);
    
    try {
      const backendQuizData = quizService.transformQuizForBackend(quiz);
      let savedQuiz;

      if (quiz.id && !quiz.id.toString().startsWith('temp_')) {
        // Update existing quiz
        savedQuiz = await quizService.updateCompleteQuiz(quiz.id, backendQuizData);
      } else {
        // Create new quiz
        savedQuiz = await quizService.createCompleteQuiz(moduleId, backendQuizData);
      }
      
      // Transform back to frontend format and update state
      const transformedQuiz = quizService.transformQuizFromBackend(savedQuiz);
      setQuiz(transformedQuiz);
      
      if (onSave) {
        onSave(savedQuiz);
      }
      
      Swal.fire({
        title: 'Succès!',
        text: 'Le quiz a été sauvegardé avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error saving quiz:", error);
      setError("Une erreur est survenue lors de la sauvegarde du quiz.");
      
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de sauvegarder le quiz. Veuillez réessayer plus tard.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setSaving(false);
    }
  };

  const getQuestionPointsValue = () => {
    if (quiz.questions.length === 0) return 0;
    return Math.round(100 / quiz.questions.length);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.id ? "Modifier le quiz" : "Créer un nouveau quiz"}</CardTitle>
          <CardDescription>
            {quiz.id
              ? "Modifiez les détails de votre quiz ci-dessous."
              : "Remplissez les informations du quiz et ajoutez des questions."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="titre">Titre du quiz</Label>
              <Input
                id="titre"
                name="titre"
                value={quiz.titre}
                onChange={handleChange}
                disabled={readOnly}
                placeholder="Entrez le titre du quiz"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={quiz.description}
                onChange={handleChange}
                disabled={readOnly}
                placeholder="Entrez une description pour le quiz"
              />
            </div>
            <div>
              <Label htmlFor="seuilReussite">Seuil de réussite (%)</Label>
              <Input
                id="seuilReussite"
                name="seuilReussite"
                type="number"
                value={quiz.seuilReussite}
                onChange={handleNumberChange}
                disabled={readOnly}
                placeholder="Entrez le seuil de réussite"
              />
            </div>
            <div>
              <Label>Questions</Label>
              {quiz.questions.length === 0 ? (
                <p>Aucune question ajoutée pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div key={question.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveQuestionUp(index)}
                            disabled={readOnly || index === 0}
                          >
                            <Move className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveQuestionDown(index)}
                            disabled={readOnly || index === quiz.questions.length - 1}
                          >
                            <Move className="w-4 h-4 rotate-180" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeQuestion(question.id)}
                            disabled={readOnly}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <Badge variant="outline">
                            Valeur: {getQuestionPointsValue()}%
                          </Badge>
                        </div>
                      </div>
                      <div className="mb-2">
                        <Label>Question</Label>
                        <Textarea
                          value={question.contenu}
                          onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                          disabled={readOnly}
                          placeholder="Entrez le contenu de la question"
                        />
                      </div>
                      <div>
                        <Label>Choix de réponse</Label>
                        {question.choix.map((choix) => (
                          <div key={choix.id} className="flex gap-2 items-center mb-2">
                            <Input
                              type="text"
                              value={choix.contenu}
                              onChange={(e) => handleChoiceChange(question.id, choix.id, e.target.value)}
                              disabled={readOnly}
                              placeholder="Entrez un choix de réponse"
                              className="flex-1"
                            />
                            <Button
                              variant={choix.estCorrect ? "default" : "outline"}
                              onClick={() => handleCorrectAnswerChange(question.id, choix.id)}
                              disabled={readOnly}
                              size="icon"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeChoice(question.id, choix.id)}
                              disabled={readOnly}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => addChoice(question.id)}
                          disabled={readOnly}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter un choix
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!readOnly && (
                <Button
                  variant="outline"
                  onClick={addQuestion}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une question
                </Button>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={readOnly}
            className="mr-2"
            isLoading={saving}
          >
            {quiz.id ? "Sauvegarder les modifications" : "Créer le quiz"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            disabled={readOnly}
          >
            <Eye className="w-4 h-4 mr-2" />
            Prévisualiser le quiz
          </Button>
        </CardFooter>
      </Card>
      <QuizPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        quiz={quiz}
      />
    </div>
  );
};

export default QuizManager;
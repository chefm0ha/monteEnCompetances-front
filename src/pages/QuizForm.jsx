import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Plus, Trash2, Move, Check, Save, Loader2, HelpCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const QuizForm = ({ onSave, initialData = null, moduleId = null, onChange = null }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(
    initialData || {
      titre: "Quiz d'évaluation",
      description: "Évaluez vos connaissances sur ce module",
      moduleId: moduleId,
      seuilReussite: 70, // Pourcentage de réussite requis
      questions: [],
    }
  );

  useEffect(() => {
    // Si on reçoit un nouveau moduleId, mettre à jour
    if (moduleId && (!quiz.moduleId || quiz.moduleId !== moduleId)) {
      setQuiz(prev => ({ ...prev, moduleId }));
    }
  }, [moduleId]);
  
  // Notifier le composant parent des changements
  useEffect(() => {
    if (onChange) {
      onChange(quiz);
    }
  }, [quiz, onChange]);

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
      id: Date.now().toString(),
      contenu: "",
      choix: [
        { id: `${Date.now()}-1`, contenu: "", estCorrect: true },
        { id: `${Date.now()}-2`, contenu: "", estCorrect: false },
        { id: `${Date.now()}-3`, contenu: "", estCorrect: false },
        { id: `${Date.now()}-4`, contenu: "", estCorrect: false },
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
    const newChoiceId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
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
    // Vérifier si le choix à supprimer est le choix correct
    const question = quiz.questions.find(q => q.id === questionId);
    const choiceToRemove = question?.choix.find(c => c.id === choiceId);
    const isCorrectChoice = choiceToRemove?.estCorrect || false;
    
    // S'assurer qu'on a au moins 2 choix
    if (question.choix.length <= 2) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une question doit avoir au moins deux choix de réponse",
      });
      return;
    }
    
    // Filtrer les choix
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
    
    // Si le choix supprimé était correct, marquer le premier choix restant comme correct
    if (isCorrectChoice) {
      setTimeout(() => {
        // Récupérer la question mise à jour
        const updatedQuestion = quiz.questions.find(q => q.id === questionId);
        if (updatedQuestion && updatedQuestion.choix.length > 0) {
          handleCorrectAnswerChange(questionId, updatedQuestion.choix[0].id);
        }
      }, 0);
    }
  };

  const validateQuiz = () => {
    // Validation de base
    if (!quiz.titre.trim()) {
      setError("Le titre du quiz est obligatoire");
      return false;
    }
    
    if (quiz.questions.length === 0) {
      setError("Le quiz doit contenir au moins une question");
      return false;
    }
    
    // Valider chaque question
    for (const question of quiz.questions) {
      if (!question.contenu.trim()) {
        setError("Toutes les questions doivent avoir un contenu");
        return false;
      }
      
      if (question.choix.length < 2) {
        setError("Chaque question doit avoir au moins deux choix de réponse");
        return false;
      }
      
      // Vérifier le contenu de chaque choix
      for (const choix of question.choix) {
        if (!choix.contenu.trim()) {
          setError("Tous les choix de réponse doivent avoir un contenu");
          return false;
        }
      }
      
      // Vérifier qu'il y a une réponse correcte
      const hasCorrectAnswer = question.choix.some(c => c.estCorrect);
      if (!hasCorrectAnswer) {
        setError("Chaque question doit avoir une réponse correcte");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateQuiz()) {
      return;
    }
    
    setSaving(true);
    
    try {
      // Préparer les données pour le quiz
      // S'assurer que tous les IDs sont des chaînes de caractères
      const preparedQuiz = {
        ...quiz,
        questions: quiz.questions.map(question => ({
          ...question,
          id: question.id.toString(),
          choix: question.choix.map(choix => ({
            ...choix,
            id: choix.id.toString()
          }))
        }))
      };
      
      onSave(preparedQuiz);
      
      toast({
        title: "Quiz sauvegardé",
        description: "Le quiz a été sauvegardé avec succès."
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du quiz:", error);
      setError("Une erreur est survenue lors de la sauvegarde du quiz.");
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder le quiz. Veuillez réessayer plus tard."
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
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Modifier le quiz" : "Créer un quiz"}</CardTitle>
        <CardDescription>
          Ajoutez des questions à choix multiples pour évaluer les connaissances
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre du quiz</Label>
              <Input
                id="titre"
                name="titre"
                value={quiz.titre}
                onChange={handleChange}
                placeholder="Entrez le titre du quiz"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={quiz.description}
                onChange={handleChange}
                placeholder="Décrivez l'objectif de ce quiz"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seuilReussite" className="flex items-center gap-2">
                Seuil de réussite (%)
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </Label>
              <Input
                id="seuilReussite"
                name="seuilReussite"
                type="number"
                min="1"
                max="100"
                value={quiz.seuilReussite}
                onChange={handleNumberChange}
                placeholder="Ex: 70"
              />
              <p className="text-xs text-gray-500">
                Pourcentage de bonnes réponses requis pour réussir le quiz
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Information:</strong> Chaque question vaut {getQuestionPointsValue()} points
                {quiz.questions.length > 0 ? 
                  ` (100 points répartis sur ${quiz.questions.length} questions)` : 
                  ". Ajoutez des questions ci-dessous."
                }
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Questions</h3>
              <Button type="button" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une question
              </Button>
            </div>

            {quiz.questions.length === 0 ? (
              <div className="text-center py-10 border rounded-md bg-gray-50">
                <p className="text-gray-500">Aucune question ajoutée.</p>
                <p className="text-sm text-gray-400">
                  Cliquez sur "Ajouter une question" pour commencer.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {quiz.questions.map((question, qIndex) => (
                  <Card key={question.id} className="border-2 border-gray-200">
                    <CardHeader className="bg-gray-50 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">
                            Question {qIndex + 1}
                          </CardTitle>
                          <Badge variant="outline" className="ml-2">
                            {getQuestionPointsValue()} points
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestionUp(qIndex)}
                            disabled={qIndex === 0}
                          >
                            <Move className="h-4 w-4 rotate-180" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestionDown(qIndex)}
                            disabled={qIndex === quiz.questions.length - 1}
                          >
                            <Move className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor={`question-${question.id}`}>
                          Énoncé de la question
                        </Label>
                        <Textarea
                          id={`question-${question.id}`}
                          value={question.contenu}
                          onChange={(e) =>
                            handleQuestionChange(question.id, e.target.value)
                          }
                          placeholder="Entrez l'énoncé de la question"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Réponses possibles</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addChoice(question.id)}
                            disabled={question.choix.length >= 6}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Ajouter une réponse
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Sélectionnez la réponse correcte
                        </p>

                        <RadioGroup
                          value={
                            question.choix.find((c) => c.estCorrect)?.id || ""
                          }
                          onValueChange={(value) =>
                            handleCorrectAnswerChange(question.id, value)
                          }
                          className="space-y-3"
                        >
                          {question.choix.map((choix, cIndex) => (
                            <div
                              key={choix.id}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={choix.id}
                                id={`choice-${choix.id}`}
                              />
                              <Input
                                value={choix.contenu}
                                onChange={(e) =>
                                  handleChoiceChange(
                                    question.id,
                                    choix.id,
                                    e.target.value
                                  )
                                }
                                placeholder={`Réponse ${cIndex + 1}`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeChoice(question.id, choix.id)
                                }
                                disabled={question.choix.length <= 2}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder le quiz
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuizForm;
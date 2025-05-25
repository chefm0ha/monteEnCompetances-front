import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Loader2, 
  X
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { quizService } from "../../services/quizService";

const QuizCRUDManager = ({ moduleId, onQuizChange = null }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isChoiceDialogOpen, setIsChoiceDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingChoice, setEditingChoice] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Form states
  const [questionForm, setQuestionForm] = useState({
    contenu: ""
  });
  const [choiceForm, setChoiceForm] = useState({
    contenu: "",
    estCorrect: false
  });

  useEffect(() => {
    if (moduleId) {
      fetchQuizzes();
    }
  }, [moduleId]);

  useEffect(() => {
    if (selectedQuiz) {
      fetchQuestions();
    }
  }, [selectedQuiz]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const fetchedQuizzes = await quizService.getQuizzesByModule(moduleId);
      setQuizzes(fetchedQuizzes);
      
      if (fetchedQuizzes.length > 0) {
        setSelectedQuiz(fetchedQuizzes[0]);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les quiz."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (!selectedQuiz) return;

    try {
      const fetchedQuestions = await quizService.getQuestionsByQuiz(selectedQuiz.id);
      
      // Fetch choices for each question
      const questionsWithChoices = await Promise.all(
        fetchedQuestions.map(async (question) => {
          try {
            const choices = await quizService.getChoicesByQuestion(question.id);
            return { ...question, choix: choices };
          } catch (error) {
            console.error(`Error fetching choices for question ${question.id}:`, error);
            return { ...question, choix: [] };
          }
        })
      );
      
      setQuestions(questionsWithChoices);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les questions."
      });
    }
  };

  // Quiz CRUD Operations
  const createQuiz = async (quizData) => {
    try {
      setSaving(true);
      const newQuiz = await quizService.createQuiz(moduleId, quizData);
      setQuizzes([...quizzes, newQuiz]);
      setSelectedQuiz(newQuiz);
      
      if (onQuizChange) onQuizChange(newQuiz);
      
      toast({
        title: "Quiz créé",
        description: "Le quiz a été créé avec succès."
      });
      
      return newQuiz;
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le quiz."
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateQuiz = async (quizId, quizData) => {
    try {
      setSaving(true);
      const updatedQuiz = await quizService.updateQuiz(quizId, quizData);
      
      setQuizzes(quizzes.map(q => q.id === quizId ? updatedQuiz : q));
      setSelectedQuiz(updatedQuiz);
      
      if (onQuizChange) onQuizChange(updatedQuiz);
      
      toast({
        title: "Quiz mis à jour",
        description: "Le quiz a été mis à jour avec succès."
      });
      
      return updatedQuiz;
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le quiz."
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz ?")) {
      return;
    }

    try {
      setSaving(true);
      await quizService.deleteQuiz(quizId);
      
      const updatedQuizzes = quizzes.filter(q => q.id !== quizId);
      setQuizzes(updatedQuizzes);
      
      if (selectedQuiz?.id === quizId) {
        setSelectedQuiz(updatedQuizzes.length > 0 ? updatedQuizzes[0] : null);
        setQuestions([]);
      }
      
      if (onQuizChange) onQuizChange(null);
      
      toast({
        title: "Quiz supprimé",
        description: "Le quiz a été supprimé avec succès."
      });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le quiz."
      });
    } finally {
      setSaving(false);
    }
  };

  // Question CRUD Operations
  const openQuestionDialog = (question = null) => {
    setEditingQuestion(question);
    setQuestionForm({
      contenu: question ? question.contenu : ""
    });
    setIsQuestionDialogOpen(true);
  };

  const handleQuestionSubmit = async () => {
    if (!questionForm.contenu.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le contenu de la question est obligatoire."
      });
      return;
    }

    try {
      setSaving(true);
      
      if (editingQuestion) {
        // Update existing question
        const updatedQuestion = await quizService.updateQuestion(editingQuestion.id, questionForm);
        setQuestions(questions.map(q => q.id === editingQuestion.id ? { ...updatedQuestion, choix: q.choix } : q));
      } else {
        // Create new question
        const newQuestion = await quizService.createQuestion(selectedQuiz.id, questionForm);
        setQuestions([...questions, { ...newQuestion, choix: [] }]);
      }
      
      setIsQuestionDialogOpen(false);
      setEditingQuestion(null);
      setQuestionForm({ contenu: "" });
      
      toast({
        title: editingQuestion ? "Question mise à jour" : "Question créée",
        description: `La question a été ${editingQuestion ? "mise à jour" : "créée"} avec succès.`
      });
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder la question."
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      return;
    }

    try {
      setSaving(true);
      await quizService.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
      
      toast({
        title: "Question supprimée",
        description: "La question a été supprimée avec succès."
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer la question."
      });
    } finally {
      setSaving(false);
    }
  };

  // Choice CRUD Operations
  const openChoiceDialog = (questionId, choice = null) => {
    setSelectedQuestion(questionId);
    setEditingChoice(choice);
    setChoiceForm({
      contenu: choice ? choice.contenu : "",
      estCorrect: choice ? choice.estCorrect : false
    });
    setIsChoiceDialogOpen(true);
  };

  const handleChoiceSubmit = async () => {
    if (!choiceForm.contenu.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le contenu du choix est obligatoire."
      });
      return;
    }

    try {
      setSaving(true);
      
      if (editingChoice) {
        // Update existing choice
        const updatedChoice = await quizService.updateChoice(editingChoice.id, choiceForm);
        setQuestions(questions.map(q => 
          q.id === selectedQuestion 
            ? { 
                ...q, 
                choix: q.choix.map(c => c.id === editingChoice.id ? updatedChoice : c)
              }
            : q
        ));
      } else {
        // Create new choice
        const newChoice = await quizService.createChoice(selectedQuestion, choiceForm);
        setQuestions(questions.map(q => 
          q.id === selectedQuestion 
            ? { ...q, choix: [...q.choix, newChoice] }
            : q
        ));
      }
      
      setIsChoiceDialogOpen(false);
      setEditingChoice(null);
      setSelectedQuestion(null);
      setChoiceForm({ contenu: "", estCorrect: false });
      
      toast({
        title: editingChoice ? "Choix mis à jour" : "Choix créé",
        description: `Le choix a été ${editingChoice ? "mis à jour" : "créé"} avec succès.`
      });
    } catch (error) {
      console.error("Error saving choice:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder le choix."
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteChoice = async (choiceId, questionId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce choix ?")) {
      return;
    }

    try {
      setSaving(true);
      await quizService.deleteChoice(choiceId);
      
      setQuestions(questions.map(q => 
        q.id === questionId 
          ? { ...q, choix: q.choix.filter(c => c.id !== choiceId) }
          : q
      ));
      
      toast({
        title: "Choix supprimé",
        description: "Le choix a été supprimé avec succès."
      });
    } catch (error) {
      console.error("Error deleting choice:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le choix."
      });
    } finally {
      setSaving(false);
    }
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
      {/* Quiz Selection and Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestion des Quiz</CardTitle>
              <CardDescription>
                Gérez les quiz, questions et choix de réponses
              </CardDescription>
            </div>
            <Button 
              onClick={() => createQuiz({
                titre: "Nouveau Quiz",
                description: "Description du quiz",
                seuilReussite: 70
              })}
              disabled={saving}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Aucun quiz trouvé pour ce module.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div 
                  key={quiz.id}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    selectedQuiz?.id === quiz.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                  onClick={() => setSelectedQuiz(quiz)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{quiz.titre}</h3>
                      <p className="text-sm text-gray-500">{quiz.description}</p>
                      <p className="text-xs text-gray-400">Seuil: {quiz.seuilReussite}%</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit quiz logic here
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuiz(quiz.id);
                        }}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions Management */}
      {selectedQuiz && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Questions - {selectedQuiz.titre}</CardTitle>
                <CardDescription>
                  Gérez les questions de ce quiz
                </CardDescription>
              </div>
              <Button onClick={() => openQuestionDialog()} disabled={saving}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Aucune question trouvée pour ce quiz.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <Card key={question.id} className="border-2">
                    <CardHeader className="bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            Question {index + 1}
                          </CardTitle>
                          <p className="text-sm mt-1">{question.contenu}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openQuestionDialog(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteQuestion(question.id)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="flex justify-between items-center">
                        <Label>Choix de réponses</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openChoiceDialog(question.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Ajouter un choix
                        </Button>
                      </div>
                      
                      {question.choix && question.choix.length > 0 ? (
                        <div className="space-y-2">
                          {question.choix.map((choice, choiceIndex) => (
                            <div
                              key={choice.id}
                              className={`flex items-center justify-between p-3 border rounded-md ${
                                choice.estCorrect ? "border-green-500 bg-green-50" : "border-gray-200"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">
                                  {String.fromCharCode(65 + choiceIndex)}.
                                </span>
                                <span className="text-sm">{choice.contenu}</span>
                                {choice.estCorrect && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Correct
                                  </span>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openChoiceDialog(question.id, choice)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteChoice(choice.id, question.id)}
                                  disabled={saving}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <p>Aucun choix de réponse pour cette question.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Modifier la question" : "Nouvelle question"}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion 
                ? "Modifiez le contenu de cette question"
                : "Créez une nouvelle question pour ce quiz"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question-content">Contenu de la question</Label>
              <Textarea
                id="question-content"
                value={questionForm.contenu}
                onChange={(e) => setQuestionForm({
                  ...questionForm,
                  contenu: e.target.value
                })}
                placeholder="Entrez le contenu de la question..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsQuestionDialogOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button onClick={handleQuestionSubmit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingQuestion ? "Modification..." : "Création..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingQuestion ? "Modifier" : "Créer"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Choice Dialog */}
      <Dialog open={isChoiceDialogOpen} onOpenChange={setIsChoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingChoice ? "Modifier le choix" : "Nouveau choix"}
            </DialogTitle>
            <DialogDescription>
              {editingChoice 
                ? "Modifiez ce choix de réponse"
                : "Créez un nouveau choix de réponse"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="choice-content">Contenu du choix</Label>
              <Input
                id="choice-content"
                value={choiceForm.contenu}
                onChange={(e) => setChoiceForm({
                  ...choiceForm,
                  contenu: e.target.value
                })}
                placeholder="Entrez le contenu du choix..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-correct"
                checked={choiceForm.estCorrect}
                onChange={(e) => setChoiceForm({
                  ...choiceForm,
                  estCorrect: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <Label htmlFor="is-correct">
                Cette réponse est correcte
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsChoiceDialogOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button onClick={handleChoiceSubmit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingChoice ? "Modification..." : "Création..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingChoice ? "Modifier" : "Créer"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizCRUDManager;
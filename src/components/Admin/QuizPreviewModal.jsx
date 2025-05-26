import { Dialog, DialogContent } from "../ui/dialog";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import { CheckCircle, AlertCircle, XCircle, ArrowRight, Loader2, RefreshCw } from "lucide-react";

const QuizPreviewModal = ({ open, onOpenChange, quiz }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <QuizPreview 
          quiz={quiz} 
          onClose={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

const QuizPreview = ({ quiz, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAnswerSelect = (questionId, choiceId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));
  };

  const handleNext = () => {
    // Vérifier si une réponse a été sélectionnée pour la question actuelle
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!answers[currentQuestion.id]) {
      return; // Ne pas avancer si aucune réponse n'est sélectionnée
    }

    // Passer à la question suivante si ce n'est pas la dernière
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Si c'est la dernière question, soumettre le quiz
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    setSubmitting(true);

    // Simuler un délai de traitement
    setTimeout(() => {
      // Calculer le résultat
      let correctAnswers = 0;
      let totalQuestions = quiz.questions.length;

      quiz.questions.forEach((question) => {
        const selectedChoiceId = answers[question.id];
        if (selectedChoiceId) {
          const selectedChoice = question.choix.find((c) => c.id === selectedChoiceId);
          if (selectedChoice && selectedChoice.estCorrect) {
            correctAnswers++;
          }
        }
      });

      // Calculer le score en pourcentage
      const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = scorePercentage >= quiz.seuilReussite;

      // Définir le résultat
      setResult({
        score: correctAnswers,
        total: totalQuestions,
        percentage: scorePercentage,
        passed,
        details: quiz.questions.map((question) => {
          const selectedChoiceId = answers[question.id];
          const selectedChoice = question.choix.find((c) => c.id === selectedChoiceId);
          const correctChoice = question.choix.find((c) => c.estCorrect);
          
          return {
            questionId: question.id,
            question: question.contenu,
            selectedChoiceId,
            selectedChoiceText: selectedChoice ? selectedChoice.contenu : "",
            correctChoiceId: correctChoice.id,
            correctChoiceText: correctChoice.contenu,
            isCorrect: selectedChoice && selectedChoice.estCorrect,
          };
        }),
      });

      setSubmitting(false);
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
  };

  // Si le quiz n'a pas de questions, afficher un message
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aperçu du quiz</CardTitle>
          <CardDescription>Ce quiz ne contient aucune question</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Veuillez ajouter des questions au quiz pour pouvoir l'apercevoir.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={onClose}>Fermer</Button>
        </CardFooter>
      </Card>
    );
  }

  // Si les résultats sont affichés
  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Résultats du quiz</CardTitle>
          <CardDescription>
            {result.passed
              ? "Félicitations! Vous avez réussi le quiz."
              : "Vous n'avez pas atteint le seuil de réussite."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            {result.passed ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
            <h2 className="text-2xl font-bold">
              {result.score} / {result.total}
            </h2>
            <div className="w-full max-w-md">
              <Progress value={result.percentage} className="h-2" />
            </div>
            <p className="text-sm text-gray-500">
              Score: {result.percentage}% (seuil de réussite: {quiz.seuilReussite}%)
            </p>
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Détails des réponses</h3>
            {result.details.map((detail, index) => (
              <div
                key={detail.questionId}
                className="border rounded-md p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  {detail.isCorrect ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Incorrect
                    </span>
                  )}
                </div>
                <p>{detail.question}</p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Votre réponse:</span>{" "}
                    {detail.selectedChoiceText}
                  </p>
                  {!detail.isCorrect && (
                    <p className="text-green-600">
                      <span className="font-medium">Réponse correcte:</span>{" "}
                      {detail.correctChoiceText}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetQuiz}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recommencer
          </Button>
          <Button onClick={onClose}>Fermer</Button>
        </CardFooter>
      </Card>
    );
  }

  // Afficher la question courante
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (    <Card>
      <CardHeader>
        <CardTitle>{quiz.titre}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            Question {currentQuestionIndex + 1} sur {quiz.questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.contenu}</h3>

          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.choix.map((choice) => (
              <div
                key={choice.id}
                className="flex items-center space-x-2 p-3 rounded-md border"
              >
                <RadioGroupItem value={choice.id} id={`choice-${choice.id}`} />
                <Label htmlFor={`choice-${choice.id}`} className="flex-grow cursor-pointer">
                  {choice.contenu}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion.id] || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Traitement...
            </>
          ) : currentQuestionIndex < quiz.questions.length - 1 ? (
            <>
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            "Terminer"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizPreviewModal;
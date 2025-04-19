"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { formationService } from "../services/formationService"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "../components/ui/breadcrumb"
import { Loader2, AlertCircle, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import QuizQuestion from "../components/QuizQuestion"

const Quiz = () => {
  const { formationId, moduleId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [quiz, setQuiz] = useState(null)
  const [formation, setFormation] = useState(null)
  const [module, setModule] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [quizResults, setQuizResults] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get formation details
        const formationData = await formationService.getFormationById(formationId)
        setFormation(formationData)

        // Get module details
        const moduleData = await formationService.getModuleById(formationId, moduleId)
        setModule(moduleData)

        // Get quiz
        const quizData = await formationService.getQuiz(formationId, moduleId)
        setQuiz(quizData)

        // Initialize answers object
        const initialAnswers = {}
        quizData.questions.forEach((question) => {
          initialAnswers[question.id] = null
        })
        setAnswers(initialAnswers)
      } catch (error) {
        console.error("Error fetching quiz:", error)
        setError("Impossible de récupérer le quiz. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [formationId, moduleId])

  const handleAnswerSelect = (questionId, choiceId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }))
  }

  const isQuizComplete = () => {
    if (!quiz) return false
    return quiz.questions.every((question) => answers[question.id] !== null)
  }

  const handleSubmitQuiz = async () => {
    if (!isQuizComplete()) {
      toast({
        title: "Quiz incomplet",
        description: "Veuillez répondre à toutes les questions avant de soumettre le quiz.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const results = await formationService.submitQuiz(formationId, moduleId, answers)
      setQuizResults(results)
      setShowResults(true)

      if (results.passed) {
        toast({
          title: "Quiz réussi !",
          description: `Vous avez obtenu ${results.score}/${quiz.questions.length} points.`,
          variant: "default",
        })
      } else {
        toast({
          title: "Quiz échoué",
          description: `Vous avez obtenu ${results.score}/${quiz.questions.length} points. Score minimum requis: ${results.requiredScore}.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      setError("Impossible de soumettre le quiz. Veuillez réessayer plus tard.")
      toast({
        title: "Erreur",
        description: "Impossible de soumettre le quiz. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetryQuiz = () => {
    // Reset answers and hide results
    const initialAnswers = {}
    quiz.questions.forEach((question) => {
      initialAnswers[question.id] = null
    })
    setAnswers(initialAnswers)
    setShowResults(false)
    setQuizResults(null)
  }

  const handleContinue = () => {
    navigate(`/formation/${formationId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!quiz || !formation || !module) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Quiz, module ou formation introuvable.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate("/dashboard")}>Tableau de bord</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate(`/formation/${formationId}`)}>{formation.title}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate(`/formation/${formationId}/module/${moduleId}`)}>
            {module.title}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>Quiz</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(`/formation/${formationId}/module/${moduleId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au module
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Quiz: {module.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {showResults && quizResults && (
            <div className="mb-6">
              <Alert variant={quizResults.passed ? "default" : "destructive"} className="mb-4">
                {quizResults.passed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertDescription>
                  {quizResults.passed
                    ? `Félicitations ! Vous avez réussi le quiz avec un score de ${quizResults.score}/${quiz.questions.length}.`
                    : `Vous avez obtenu ${quizResults.score}/${quiz.questions.length}. Score minimum requis: ${quizResults.requiredScore}.`}
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <QuizQuestion
                key={question.id}
                question={question}
                selectedAnswer={answers[question.id]}
                onAnswerSelect={(choiceId) => handleAnswerSelect(question.id, choiceId)}
                showResults={showResults}
                isCorrect={showResults ? question.choices.find((c) => c.id === answers[question.id])?.isCorrect : null}
              />
            ))}
          </div>

          <div className="flex justify-between mt-8">
            {showResults ? (
              <>
                {!quizResults.passed && <Button onClick={handleRetryQuiz}>Réessayer le quiz</Button>}
                <Button onClick={handleContinue} className={!quizResults.passed ? "ml-auto" : "w-full"}>
                  {quizResults.passed ? "Continuer" : "Revenir à la formation"}
                </Button>
              </>
            ) : (
              <Button onClick={handleSubmitQuiz} disabled={!isQuizComplete() || submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Soumission en cours...
                  </>
                ) : (
                  "Soumettre le quiz"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Quiz


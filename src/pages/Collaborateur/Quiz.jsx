// src/pages/Collaborateur/Quiz.jsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { formationService } from "../../services/formationService"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../../components/ui/breadcrumb"
import { Loader2, AlertCircle, ArrowLeft, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import Swal from 'sweetalert2'
import QuizQuestion from "../../components/Collaborateur/QuizQuestion"

const Quiz = () => {
  const { formationId, moduleId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
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
    fetchData()
  }, [formationId, moduleId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Fetching quiz data for formation:", formationId, "module:", moduleId);

      // Get formation details
      const formationData = await formationService.getCollaboratorFormationById(formationId)
      console.log("✅ Formation data loaded:", formationData);
      setFormation(formationData)

      // Get module details with all its information
      const moduleData = await formationService.getModuleById(formationId, moduleId)
      console.log("✅ Module data loaded:", moduleData);
      setModule(moduleData)

      // Get quiz using the new endpoint structure
      const quizData = await formationService.getQuiz(formationId, moduleId)
      console.log("✅ Quiz data loaded:", quizData);
      setQuiz(quizData)

      // Initialize answers object
      const initialAnswers = {}
      quizData.questions.forEach((question) => {
        initialAnswers[question.id] = null
      })
      setAnswers(initialAnswers)

    } catch (error) {
      console.error("❌ Error fetching quiz data:", error)
      
      if (error.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.")
      } else if (error.response?.status === 404) {
        setError("Quiz introuvable. Le module n'a peut-être pas de quiz associé.")
      } else if (error.response?.status === 403) {
        setError("Vous n'avez pas accès à ce quiz.")
      } else if (error.message.includes("Aucun quiz trouvé")) {
        setError("Ce module n'a pas encore de quiz. Contactez votre administrateur.")
      } else {
        setError("Impossible de récupérer le quiz. Veuillez réessayer plus tard.")
      }
    } finally {
      setLoading(false)
    }
  }

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
      Swal.fire({
        icon: 'warning',
        title: 'Quiz incomplet',
        text: 'Veuillez répondre à toutes les questions avant de soumettre le quiz.',
        confirmButtonText: 'Compris'
      })
      return
    }

    const result = await Swal.fire({
      title: 'Confirmer la soumission',
      text: 'Êtes-vous sûr de vouloir soumettre vos réponses ? Cette action ne peut pas être annulée.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, soumettre',
      cancelButtonText: 'Annuler'
    })

    if (!result.isConfirmed) return

    setSubmitting(true)
    try {
      console.log("📝 Submitting quiz answers:", answers);
      
      const results = await formationService.submitQuiz(formationId, moduleId, answers)
      console.log("✅ Quiz results received:", results);
      
      setQuizResults(results)
      setShowResults(true)

      if (results.passed) {
        Swal.fire({
          icon: 'success',
          title: 'Quiz réussi ! 🎉',
          text: `${results.message} Score: ${results.formattedScore} (${results.score}/${results.totalQuestions} questions correctes)`,
          confirmButtonText: 'Continuer'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Quiz échoué',
          text: `${results.message} Score: ${results.formattedScore} (${results.score}/${results.totalQuestions} questions correctes)`,
          confirmButtonText: 'Réessayer'
        })
      }
    } catch (error) {
      console.error("❌ Error submitting quiz:", error)
      
      let errorMessage = "Impossible de soumettre le quiz. Veuillez réessayer plus tard."
      
      if (error.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter."
      } else if (error.response?.status === 404) {
        errorMessage = "Quiz introuvable. Il a peut-être été supprimé."
      }
      
      setError(errorMessage)
      Swal.fire({
        icon: 'error',
        title: 'Erreur de soumission',
        text: errorMessage,
        confirmButtonText: 'OK'
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
    setError(null)
  }

  const handleContinue = () => {
    navigate(`/formation/${formationId}`)
  }

  const handleRefresh = () => {
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement du quiz...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/dashboard")}>Tableau de bord</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate(`/formation/${formationId}`)}>
                {formation?.title || "Formation"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Quiz</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex justify-center gap-4">
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
          <Button variant="outline" onClick={() => navigate(`/formation/${formationId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la formation
          </Button>
        </div>
      </div>
    )
  }

  if (!quiz || !formation || !module) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/dashboard")}>Tableau de bord</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate(`/formation/${formationId}`)}>Formation</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Quiz</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Quiz, module ou formation introuvable.</AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={() => navigate(`/formation/${formationId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la formation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/dashboard")}>Tableau de bord</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/formation/${formationId}`)}>{formation.title}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/formation/${formationId}/module/${moduleId}`)}>
              {module.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Quiz</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/formation/${formationId}/module/${moduleId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au module
          </Button>
          {!showResults && (
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Quiz: {module.title}</CardTitle>
          <p className="text-gray-600">
            {quiz.questions.length} question{quiz.questions.length > 1 ? 's' : ''}
            {!showResults && " • Répondez à toutes les questions pour soumettre le quiz"}
          </p>
        </CardHeader>
        <CardContent>
          {showResults && quizResults && (
            <div className="mb-6">
              <Alert variant={quizResults.passed ? "default" : "destructive"} className="mb-4">
                {quizResults.passed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertDescription>
                  {quizResults.passed
                    ? `Félicitations ! Vous avez réussi le quiz avec un score de ${quizResults.score}/${quizResults.totalQuestions}.`
                    : `Vous avez obtenu ${quizResults.score}/${quizResults.totalQuestions}. Score minimum requis: ${quiz?.seuilReussite || 70}%.`}
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

          <div className="flex justify-between items-center mt-8">
            {showResults ? (
              <div className="flex gap-3 w-full">
                {!quizResults?.passed && (
                  <Button onClick={handleRetryQuiz} variant="outline">
                    Réessayer le quiz
                  </Button>
                )}
                <Button 
                  onClick={handleContinue} 
                  className={!quizResults?.passed ? "ml-auto" : "w-full"}
                >
                  {quizResults?.passed ? "Continuer" : "Revenir à la formation"}
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-center w-full">
                <div className="text-sm text-gray-500">
                  {Object.values(answers).filter(answer => answer !== null).length} / {quiz.questions.length} questions répondues
                </div>
                <Button 
                  onClick={handleSubmitQuiz} 
                  disabled={!isQuizComplete() || submitting}
                  className="min-w-[200px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Soumission en cours...
                    </>
                  ) : (
                    "Soumettre le quiz"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help section */}
      {!showResults && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Instructions pour le quiz</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Lisez attentivement chaque question</li>
                  <li>• Sélectionnez une seule réponse par question</li>
                  <li>• Vous devez répondre à toutes les questions pour soumettre</li>
                  <li>• Une fois soumis, vous ne pourrez plus modifier vos réponses</li>
                  <li>• En cas d'échec, vous pourrez repasser le quiz</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Quiz
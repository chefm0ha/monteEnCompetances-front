// src/pages/Collaborateur/FormationDetails.jsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { formationService } from "../../services/formationService"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../../components/ui/breadcrumb"
import { Loader2, AlertCircle, Download, ArrowLeft, Clock, RefreshCw } from "lucide-react"
import ProgressBar from "../../components/shared/ProgressBar"
import ModuleAccordion from "../../components/Collaborateur/ModuleAccordion"
import Swal from 'sweetalert2'

const FormationDetails = () => {
  const { formationId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [formation, setFormation] = useState(null)
  const [userProgress, setUserProgress] = useState(null)
  const [formationProgress, setFormationProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFormationDetails()
  }, [formationId])

  const fetchFormationDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get formation details with modules, supports and quizzes using the new method
      const formationData = await formationService.getFormationWithDetails(formationId)
      setFormation(formationData)

      // Get user progress
      const progressData = await formationService.getFormationProgress(formationId)
      setUserProgress(progressData)

      // Get detailed formation progress with module completion status
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      const collaborateurId = userData.id
      if (collaborateurId) {
        const detailedProgressData = await formationService.getFormationProgressWithModules(formationId, collaborateurId)
        setFormationProgress(detailedProgressData)
      }

      // Get detailed formation progress with module completion status
      if (currentUser?.id) {
        const detailedProgressData = await formationService.getFormationProgressWithModules(formationId, currentUser.id)
        setFormationProgress(detailedProgressData)
      }

    } catch (error) {
      if (error.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.")
      } else if (error.response?.status === 404) {
        setError("Formation introuvable. Elle a peut-être été supprimée ou vous n'y avez pas accès.")
      } else if (error.response?.status === 403) {
        setError("Vous n'avez pas accès à cette formation.")
      } else {
        setError("Impossible de récupérer les détails de la formation. Veuillez réessayer plus tard.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = async () => {
    try {
      const certificateBlob = await formationService.generateCertificate(formationId)
      
      // Create download link
      const url = window.URL.createObjectURL(certificateBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `certificat_${formation.title.replace(/\s+/g, "_")}.html`
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      Swal.fire({
        title: 'Téléchargement terminé !',
        text: 'Votre certificat a été téléchargé avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error) {
      console.error("❌ Error downloading certificate:", error)
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de télécharger le certificat. Assurez-vous d\'avoir terminé la formation.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
  }

  const handleRefresh = () => {
    fetchFormationDetails()
  }

  // Helper function to get accurate completed modules count
  const getCompletedModulesCount = () => {
    if (formationProgress?.modules) {
      // Use the accurate API data that shows actual module completion status
      return formationProgress.modules.filter(module => module.completed === true).length
    }
    // Fallback to userProgress if formationProgress not available
    return userProgress?.completedModules?.length || 0
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des détails de la formation...</span>
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
              <BreadcrumbLink>Formation</BreadcrumbLink>
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
          <Button variant="outline" onClick={() => navigate("/mes-formations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux formations
          </Button>
        </div>
      </div>
    )
  }

  if (!formation) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/dashboard")}>Tableau de bord</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Formation</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Formation introuvable.</AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={() => navigate("/mes-formations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux formations
          </Button>
        </div>
      </div>
    )
  }

  const isFormationCompleted = userProgress?.progress === 100

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/dashboard")}>Tableau de bord</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/mes-formations")}>Mes formations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{formation.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/mes-formations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {isFormationCompleted && (
          <Button onClick={handleDownloadCertificate}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger le certificat
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{formation.title}</CardTitle>
              <CardDescription className="text-base">{formation.description}</CardDescription>
            </div>
            {formation.lienPhoto && (
              <img
                src={formation.lienPhoto}
                alt={formation.title}
                className="w-24 h-24 rounded-lg object-cover ml-4"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formation.duration} heures</span>
              </div>
              <span className="px-2 py-1 bg-muted rounded text-xs">{formation.type}</span>
            </div>
            {isFormationCompleted && (
              <span className="text-green-600 font-medium">✅ Formation terminée</span>
            )}
          </div>

          <div className="mb-6">
            <ProgressBar
              value={getCompletedModulesCount()}
              total={formation.modules?.length || 0}
              className="mb-2"
              showPercentage={true}
            />
            <div className="text-sm text-muted-foreground">
              {getCompletedModulesCount()} sur {formation.modules?.length || 0} modules complétés
            </div>
          </div>

          {formation.modules && formation.modules.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold mb-4">Modules</h3>
              <ModuleAccordion 
                formationId={formationId} 
                modules={formation.modules} 
                userProgress={userProgress} 
                formationProgress={formationProgress}
                collaborateurId={currentUser?.id}
              />
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Cette formation ne contient pas encore de modules. 
                Contactez votre administrateur pour plus d'informations.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Formation completion message */}
      {isFormationCompleted && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-green-900 mb-1">
                  Félicitations ! Vous avez terminé cette formation
                </h3>
                <p className="text-green-700 text-sm">
                  Votre certificat de réussite est maintenant disponible au téléchargement.
                </p>
              </div>
              <Button 
                onClick={handleDownloadCertificate}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le certificat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help and tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Comment progresser dans cette formation</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Consultez les modules dans l'ordre recommandé</li>
                <li>• Terminez tous les contenus d'un module avant de passer au quiz</li>
                <li>• Les quizzes sont débloqués après avoir consulté tous les contenus</li>
                <li>• Votre progression est sauvegardée automatiquement</li>
                {!isFormationCompleted && (
                  <li>• Terminez tous les modules pour obtenir votre certificat</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FormationDetails
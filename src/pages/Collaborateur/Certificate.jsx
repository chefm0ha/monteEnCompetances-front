// src/pages/Collaborateur/Certificate.jsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { formationService } from "../../services/formationService"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../../components/ui/breadcrumb"
import { Loader2, AlertCircle, ArrowLeft, Download, Printer, RefreshCw, CheckCircle } from "lucide-react"
import { APP_SETTINGS } from "../../config"
import Swal from 'sweetalert2'

const Certificate = () => {
  const { formationId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [formation, setFormation] = useState(null)
  const [userProgress, setUserProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const certificateRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [formationId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🏆 Fetching certificate data for formation:", formationId);

      // Get formation details
      const formationData = await formationService.getCollaboratorFormationById(formationId)
      console.log("✅ Formation data loaded:", formationData);
      setFormation(formationData)

      // Get user progress to verify completion
      const progressData = await formationService.getFormationProgress(formationId)
      console.log("✅ Progress data loaded:", progressData);
      setUserProgress(progressData)

      // Check if formation is completed
      if (progressData.progress < 100) {
        setError("Vous devez terminer la formation avant de pouvoir accéder au certificat.")
      }

    } catch (error) {
      console.error("❌ Error fetching certificate data:", error)
      
      if (error.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.")
      } else if (error.response?.status === 404) {
        setError("Formation introuvable.")
      } else if (error.response?.status === 403) {
        setError("Vous n'avez pas accès à cette formation.")
      } else {
        setError("Impossible de récupérer les données du certificat. Veuillez réessayer plus tard.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = async () => {
    if (!formation || !currentUser) {
      Swal.fire({
        title: 'Erreur',
        text: 'Données manquantes pour générer le certificat.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
      return
    }

    setDownloading(true)
    try {
      console.log("🏆 Downloading certificate for formation:", formationId);

      const certificateBlob = await formationService.generateCertificate(formationId)

      // Create a download link
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
        title: 'Téléchargement réussi !',
        text: 'Votre certificat a été téléchargé avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })

    } catch (error) {
      console.error("❌ Error downloading certificate:", error)
      
      let errorMessage = "Impossible de télécharger le certificat. Veuillez réessayer plus tard."
      
      if (error.response?.status === 403) {
        errorMessage = "Vous devez terminer la formation avant de pouvoir télécharger le certificat."
      } else if (error.response?.status === 404) {
        errorMessage = "Certificat non trouvé. Assurez-vous d'avoir terminé la formation."
      }
      
      Swal.fire({
        title: 'Erreur de téléchargement',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setDownloading(false)
    }
  }

  const handlePrintCertificate = () => {
    const printContent = document.getElementById("certificate-content")
    if (!printContent) {
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible d\'imprimer le certificat.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
      return
    }

    const originalContents = document.body.innerHTML
    document.body.innerHTML = printContent.innerHTML
    window.print()
    document.body.innerHTML = originalContents
    window.location.reload()
  }

  const handleRefresh = () => {
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement du certificat...</span>
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
              <BreadcrumbLink>Certificat</BreadcrumbLink>
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
              <BreadcrumbLink>Certificat</BreadcrumbLink>
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

  const today = new Date()
  const formattedDate = today.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const isCompleted = userProgress?.progress === 100

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
            <BreadcrumbLink onClick={() => navigate(`/formation/${formationId}`)}>{formation.title}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Certificat</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(`/formation/${formationId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la formation
        </Button>

        {isCompleted && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrintCertificate}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button onClick={handleDownloadCertificate} disabled={downloading}>
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Téléchargement...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Formation not completed warning */}
      {!isCompleted && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez terminer la formation à 100% pour pouvoir accéder au certificat. 
            Progression actuelle: {userProgress?.progress || 0}%
          </AlertDescription>
        </Alert>
      )}

      {/* Certificate preview/display */}
      <Card>
        <CardContent className="p-6">
          {isCompleted ? (
            <div
              id="certificate-content"
              ref={certificateRef}
              className="bg-white border-8 border-double border-gray-300 p-8 text-center min-h-[600px] flex flex-col justify-center"
            >
              <div className="mb-8">
                <img
                  src={APP_SETTINGS.logoUrl || "/placeholder.svg"}
                  alt={APP_SETTINGS.appName}
                  className="h-16 mx-auto"
                />
              </div>

              <h1 className="text-3xl font-bold uppercase mb-2 text-gray-800">Certificat de réussite</h1>
              <p className="text-lg mb-8 text-gray-600">Ce certificat est décerné à</p>

              <h2 className="text-2xl font-bold mb-8 text-gray-900">
                {currentUser?.firstName} {currentUser?.lastName}
              </h2>

              <p className="text-lg mb-2 text-gray-600">pour avoir complété avec succès la formation</p>
              <h3 className="text-xl font-bold mb-8 text-blue-600">{formation.title}</h3>

              <div className="mb-8">
                <p className="text-lg text-gray-600">Durée de la formation: {formation.duration} heures</p>
                <p className="text-lg text-gray-600">Type: {formation.type}</p>
              </div>

              <p className="text-lg mb-8 text-gray-600">Délivré le {formattedDate}</p>

              <div className="mt-16 pt-8 border-t border-gray-300">
                <p className="text-sm text-gray-500">
                  Ce certificat confirme que le collaborateur a suivi l'intégralité de la formation et a validé l'ensemble
                  des modules avec succès dans le cadre du programme de développement des compétences de {APP_SETTINGS.appName}.
                </p>
              </div>
            </div>
          ) : (
            /* Preview when formation not completed */
            <div className="bg-gray-100 border-8 border-dashed border-gray-300 p-8 text-center min-h-[600px] flex flex-col justify-center">
              <div className="mb-8">
                <CheckCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-500 mb-4">Certificat en attente</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Terminez la formation pour débloquer votre certificat de réussite. 
                  Il vous reste {100 - (userProgress?.progress || 0)}% à compléter.
                </p>
              </div>

              <div className="text-gray-400">
                <h3 className="text-lg font-medium mb-2">Aperçu du certificat</h3>
                <p className="text-sm">Votre nom apparaîtra ici</p>
                <p className="text-sm">Formation: {formation.title}</p>
                <p className="text-sm">Date de délivrance: {formattedDate}</p>
              </div>

              <div className="mt-8">
                <Button onClick={() => navigate(`/formation/${formationId}`)}>
                  Continuer la formation
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success message for completed formation */}
      {isCompleted && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-green-900 mb-1">
                  Félicitations ! Vous avez terminé cette formation
                </h3>
                <p className="text-green-700 text-sm">
                  Votre certificat de réussite est maintenant disponible. Vous pouvez le télécharger et l'imprimer.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handlePrintCertificate}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                <Button 
                  onClick={handleDownloadCertificate}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">À propos de votre certificat</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Le certificat est généré automatiquement à la fin de la formation</li>
                <li>• Il atteste de votre réussite et peut être utilisé dans votre dossier professionnel</li>
                <li>• Le certificat est disponible au format HTML pour une impression de qualité</li>
                <li>• Vous pouvez le télécharger autant de fois que nécessaire</li>
                {!isCompleted && (
                  <li>• Terminez tous les modules et quiz pour débloquer votre certificat</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Certificate
"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { formationService } from "../../services/formationService"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "../../components/ui/breadcrumb"
import { Loader2, AlertCircle, Download, ArrowLeft, Clock } from "lucide-react"
import ProgressBar from "../../components/shared/ProgressBar"
import ModuleAccordion from "../../components/Collaborateur/ModuleAccordion"
import Swal from 'sweetalert2'

const FormationDetails = () => {
  const { formationId } = useParams()
  const navigate = useNavigate()
  const [formation, setFormation] = useState(null)
  const [userProgress, setUserProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFormationDetails = async () => {
      try {
        const formationData = await formationService.getFormationById(formationId)
        setFormation(formationData)

        const progressData = await formationService.getFormationProgress(formationId)
        setUserProgress(progressData)
      } catch (error) {
        console.error("Error fetching formation details:", error)
        setError("Impossible de récupérer les détails de la formation. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchFormationDetails()
  }, [formationId])

  const handleDownloadCertificate = async () => {
    try {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading certificate:", error)
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de télécharger le certificat. Veuillez réessayer plus tard.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
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

  if (!formation) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Formation introuvable.</AlertDescription>
      </Alert>
    )
  }

  const isFormationCompleted = userProgress?.progress === 100

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate("/dashboard")}>Tableau de bord</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>{formation.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
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
          <CardTitle className="text-2xl">{formation.title}</CardTitle>
          <CardDescription>{formation.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formation.duration} heures</span>
          </div>

          <ProgressBar
            value={userProgress?.completedModules?.length || 0}
            total={formation.modules?.length || 0}
            className="mb-6"
          />

          <h3 className="text-lg font-semibold mb-4">Modules</h3>
          <ModuleAccordion formationId={formationId} modules={formation.modules} userProgress={userProgress} />
        </CardContent>
      </Card>
    </div>
  )
}

export default FormationDetails


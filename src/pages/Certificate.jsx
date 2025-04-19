"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { formationService } from "../services/formationService"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "../components/ui/breadcrumb"
import { Loader2, AlertCircle, ArrowLeft, Download, Printer } from "lucide-react"
import { APP_SETTINGS } from "../config"

const Certificate = () => {
  const { formationId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [formation, setFormation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const certificateRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get formation details
        const formationData = await formationService.getFormationById(formationId)
        setFormation(formationData)
      } catch (error) {
        console.error("Error fetching formation details:", error)
        setError("Impossible de récupérer les détails de la formation. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [formationId])

  const handleDownloadCertificate = async () => {
    try {
      const certificateBlob = await formationService.generateCertificate(formationId)

      // Create a download link
      const url = window.URL.createObjectURL(certificateBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `certificat_${formation.title.replace(/\s+/g, "_")}.pdf`
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading certificate:", error)
      setError("Impossible de télécharger le certificat. Veuillez réessayer plus tard.")
    }
  }

  const handlePrintCertificate = () => {
    const printContent = document.getElementById("certificate-content")
    const originalContents = document.body.innerHTML

    document.body.innerHTML = printContent.innerHTML
    window.print()
    document.body.innerHTML = originalContents
    window.location.reload()
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

  const today = new Date()
  const formattedDate = today.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

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
          <BreadcrumbLink>Certificat</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(`/formation/${formationId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la formation
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintCertificate}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button onClick={handleDownloadCertificate}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            id="certificate-content"
            ref={certificateRef}
            className="bg-white border-8 border-double border-gray-300 p-8 text-center"
          >
            <div className="mb-8">
              <img
                src={APP_SETTINGS.logoUrl || "/placeholder.svg"}
                alt={APP_SETTINGS.appName}
                className="h-16 mx-auto"
              />
            </div>

            <h1 className="text-3xl font-bold uppercase mb-2">Certificat de réussite</h1>
            <p className="text-lg mb-8">Ce certificat est décerné à</p>

            <h2 className="text-2xl font-bold mb-8">
              {currentUser?.firstName} {currentUser?.lastName}
            </h2>

            <p className="text-lg mb-2">pour avoir complété avec succès la formation</p>
            <h3 className="text-xl font-bold mb-8">{formation.title}</h3>

            <p className="text-lg mb-8">Délivré le {formattedDate}</p>

            <div className="mt-16 pt-8 border-t border-gray-300">
              <p className="text-sm text-gray-600">
                Ce certificat confirme que le collaborateur a suivi l'intégralité de la formation et a validé l'ensemble
                des modules avec succès.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Certificate


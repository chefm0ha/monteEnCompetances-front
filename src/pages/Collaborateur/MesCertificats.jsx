// src/pages/Collaborateur/MesCertificats.jsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { formationService } from "../../services/formationService"
import { useAuth } from "../../context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { 
  Loader2, 
  AlertCircle, 
  Award, 
  Download, 
  Calendar,
  Eye,
  FileText,
  CheckCircle
} from "lucide-react"

const MesCertificats = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      // Get only completed formations (100% progress)
      const formations = await formationService.getAssignedFormations()
      const completedFormations = formations.filter(f => f.progress === 100)
      
      // Transform to certificates format
      const certificatesData = completedFormations.map(formation => ({
        id: formation.id,
        formationTitle: formation.title,
        formationDescription: formation.description,
        completedDate: formation.completedDate || new Date().toISOString(),
        certificateUrl: `/formation/${formation.id}/certificate`,
        duration: formation.duration || 0,
        type: formation.type || "Formation"
      }))
      
      setCertificates(certificatesData)
    } catch (error) {
      console.error("Error fetching certificates:", error)
      setError("Impossible de récupérer vos certificats. Veuillez réessayer plus tard.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = (certificate) => {
    navigate(certificate.certificateUrl)
  }

  const handleViewCertificate = (certificate) => {
    // Open certificate in new tab for preview
    window.open(certificate.certificateUrl, '_blank')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes certificats</h1>
          <p className="text-gray-500">
            Consultez et téléchargez vos certificats de formation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Award className="h-4 w-4 mr-1" />
            {certificates.length} certificat{certificates.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Résumé de vos accomplissements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{certificates.length}</div>
              <div className="text-sm text-green-700">Formations complétées</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {certificates.reduce((total, cert) => total + cert.duration, 0)}h
              </div>
              <div className="text-sm text-blue-700">Heures de formation</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(certificates.map(cert => cert.type)).size}
              </div>
              <div className="text-sm text-purple-700">Types de formation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun certificat disponible
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Vous n'avez pas encore complété de formation. 
              Terminez vos formations assignées pour obtenir vos certificats.
            </p>
            <Button onClick={() => navigate('/mes-formations')}>
              Voir mes formations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {certificates.map((certificate) => (
            <Card 
              key={certificate.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {certificate.formationTitle}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Complétée le {formatDate(certificate.completedDate)}</span>
                      </div>
                      <Badge variant="outline">{certificate.type}</Badge>
                    </div>
                  </div>
                  <Award className="h-8 w-8 text-green-500 flex-shrink-0" />
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {certificate.formationDescription}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Durée: {certificate.duration} heures</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Certifié
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewCertificate(certificate)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Aperçu
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleDownloadCertificate(certificate)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">À propos de vos certificats</h3>
              <p className="text-blue-700 text-sm">
                Vos certificats sont générés automatiquement lorsque vous complétez une formation à 100%. 
                Ils attestent de votre réussite et peuvent être téléchargés au format PDF pour vos dossiers professionnels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MesCertificats
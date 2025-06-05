"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { formationService, markSupportAsSeen, isSupportSeen } from "../../services/formationService"
import { STORAGE_URL } from "../../config"

const ContentViewer = ({ formationId, moduleId, content, onContentRead, collaborateurId }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isRead, setIsRead] = useState(false)
  const [hasBeenSeen, setHasBeenSeen] = useState(false)

  useEffect(() => {
    // Check if support has been seen
    const checkSeenStatus = async () => {
      if (!content.id || !collaborateurId) return

      try {
        // Check if support is already seen
        const seen = await isSupportSeen(content.id, collaborateurId)
        setHasBeenSeen(seen)
        setIsRead(seen)
      } catch (error) {
        // Error handled silently
      }
    }

    checkSeenStatus()
  }, [content.id, collaborateurId])

  const handleMarkAsRead = async () => {
    if (hasBeenSeen) return

    setLoading(true)
    try {
      await markSupportAsSeen(content.id, collaborateurId)
      setHasBeenSeen(true)
      setIsRead(true)
      if (onContentRead) {
        onContentRead(content.id)
      }
    } catch (error) {
      setError("Impossible de marquer ce support comme lu. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadSupport = async () => {
    try {
      setLoading(true)
      const downloadUrl = await formationService.getSupportDownloadUrl(content.id)
      window.open(downloadUrl, '_blank')
    } catch (error) {
      console.error("Error downloading support:", error)
      setError("Impossible de télécharger le fichier. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    switch (content.type.toLowerCase()) {
      case "pdf":
        return (
          <div className="space-y-4">
            {(content.downloadUrl || content.lien) && (
              <div className="flex justify-center">
                <Button
                  onClick={() => handleDownloadSupport()}
                  variant="outline"
                >
                  Télécharger le PDF
                </Button>
              </div>
            )}
            {(content.url || content.lien) && (
              <div className="w-full h-[70vh]">
                <iframe 
                  src={content.url || content.lien} 
                  className="w-full h-full border-0" 
                  title={content.title || content.titre} 
                />
              </div>
            )}
          </div>
        )

      case "video":
        return (
          <div className="w-full">
            <video
              src={content.lien || content.url}
              controls
              className="w-full max-h-[70vh]"
            />
          </div>
        )

      case "text":
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          </div>
        )

      default:
        return (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Type de contenu non pris en charge.</AlertDescription>
          </Alert>
        )
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{content.title || content.titre}</h2>
          {content.description && <p className="text-gray-600 mt-2">{content.description}</p>}
        </div>

        {renderContent()}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 flex justify-between items-center">
          <Button 
            onClick={handleMarkAsRead} 
            disabled={loading || hasBeenSeen}
            variant={hasBeenSeen ? "secondary" : "default"}
            className={hasBeenSeen ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
          >
            {loading ? (
              "Marquage en cours..."
            ) : hasBeenSeen ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marqué comme lu
              </>
            ) : (
              "Marquer comme lu"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ContentViewer


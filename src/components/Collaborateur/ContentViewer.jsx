"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { formationService } from "../../services/formationService"
import { STORAGE_URL } from "../../config"

const ContentViewer = ({ formationId, moduleId, content, onContentRead }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isRead, setIsRead] = useState(false)

  useEffect(() => {
    // Reset state when content changes
    setIsRead(content.isRead || false)
  }, [content])

  const handleMarkAsRead = async () => {
    if (isRead) return

    setLoading(true)
    try {
      await formationService.markContentAsRead(formationId, moduleId, content.id)
      setIsRead(true)
      if (onContentRead) {
        onContentRead(content.id)
      }
    } catch (error) {
      console.error("Error marking content as read:", error)
      setError("Impossible de marquer ce contenu comme lu. Veuillez réessayer.")
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
            {content.downloadUrl && (
              <div className="flex justify-center">
                <Button
                  onClick={() => handleDownloadSupport()}
                  variant="outline"
                >
                  Télécharger le PDF
                </Button>
              </div>
            )}
            {content.url && (
              <div className="w-full h-[70vh]">
                <iframe 
                  src={content.url} 
                  className="w-full h-full border-0" 
                  title={content.title} 
                />
              </div>
            )}
          </div>
        )

      case "video":
        return (
          <div className="w-full">
            <video
              src={`${STORAGE_URL}/${content.url}`}
              controls
              className="w-full max-h-[70vh]"
              onEnded={handleMarkAsRead}
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
          <h2 className="text-2xl font-bold">{content.title}</h2>
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
          {isRead ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Contenu consulté</span>
            </div>
          ) : (
            <Button onClick={handleMarkAsRead} disabled={loading || isRead}>
              Marquer comme lu
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ContentViewer


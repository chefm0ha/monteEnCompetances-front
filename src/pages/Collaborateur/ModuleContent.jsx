"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { formationService } from "../../services/formationService"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "../../components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Loader2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react"
import ContentViewer from "../../components/Collaborateur/ContentViewer"

const ModuleContent = () => {
  const { formationId, moduleId } = useParams()
  const navigate = useNavigate()
  const [module, setModule] = useState(null)
  const [formation, setFormation] = useState(null)
  const [activeContent, setActiveContent] = useState(null)
  const [activeTab, setActiveTab] = useState("0")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userProgress, setUserProgress] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get formation details
        const formationData = await formationService.getFormationById(formationId)
        setFormation(formationData)

        // Get module details
        const moduleData = await formationService.getModuleById(formationId, moduleId)
        setModule(moduleData)

        // Get user progress
        const progressData = await formationService.getFormationProgress(formationId)
        setUserProgress(progressData)

        // Set active content to the first one
        if (moduleData.contents && moduleData.contents.length > 0) {
          setActiveContent(moduleData.contents[0])
          setActiveTab("0")
        }
      } catch (error) {
        console.error("Error fetching module content:", error)
        setError("Impossible de récupérer le contenu du module. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [formationId, moduleId])

  const handleContentChange = (index) => {
    if (module?.contents && module.contents[index]) {
      setActiveContent(module.contents[index])
      setActiveTab(index.toString())
    }
  }

  const handleContentRead = async (contentId) => {
    // Update local state to reflect the content has been read
    if (module && activeContent) {
      const updatedContents = module.contents.map((content) =>
        content.id === contentId ? { ...content, isRead: true } : content,
      )

      setModule({ ...module, contents: updatedContents })

      if (activeContent.id === contentId) {
        setActiveContent({ ...activeContent, isRead: true })
      }
    }
  }

  const isAllContentRead = () => {
    if (!module?.contents) return false
    return module.contents.every((content) => content.isRead || userProgress?.completedContents?.includes(content.id))
  }

  const handleStartQuiz = () => {
    navigate(`/formation/${formationId}/module/${moduleId}/quiz`)
  }

  const handleNextContent = () => {
    const currentIndex = Number.parseInt(activeTab)
    if (currentIndex < module.contents.length - 1) {
      handleContentChange(currentIndex + 1)
    }
  }

  const handlePreviousContent = () => {
    const currentIndex = Number.parseInt(activeTab)
    if (currentIndex > 0) {
      handleContentChange(currentIndex - 1)
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

  if (!module || !formation) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Module ou formation introuvable.</AlertDescription>
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
          <BreadcrumbLink>{module.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/formation/${formationId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la formation
          </Button>
        </div>

        <Button onClick={handleStartQuiz} disabled={!isAllContentRead()}>
          {isAllContentRead() ? "Commencer le quiz" : "Consultez tous les contenus pour débloquer le quiz"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">{module.title}</h2>

          <Tabs value={activeTab} onValueChange={handleContentChange}>
            <TabsList className="mb-4">
              {module.contents.map((content, index) => (
                <TabsTrigger key={content.id} value={index.toString()}>
                  {content.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {module.contents.map((content, index) => (
              <TabsContent key={content.id} value={index.toString()}>
                <ContentViewer
                  formationId={formationId}
                  moduleId={moduleId}
                  content={{
                    ...content,
                    isRead: content.isRead || userProgress?.completedContents?.includes(content.id),
                  }}
                  onContentRead={handleContentRead}
                />
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePreviousContent} disabled={Number.parseInt(activeTab) === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>

            <Button
              variant="outline"
              onClick={handleNextContent}
              disabled={Number.parseInt(activeTab) === module.contents.length - 1}
            >
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ModuleContent


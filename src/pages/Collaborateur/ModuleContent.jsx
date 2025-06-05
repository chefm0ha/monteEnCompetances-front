// src/pages/Collaborateur/ModuleContent.jsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { formationService, isSupportSeen } from "../../services/formationService"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../../components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Loader2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react"
import ContentViewer from "../../components/Collaborateur/ContentViewer"
import Swal from 'sweetalert2'

const ModuleContent = () => {
  const { formationId, moduleId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentUser } = useAuth()
  const [module, setModule] = useState(null)
  const [formation, setFormation] = useState(null)
  const [activeContent, setActiveContent] = useState(null)
  const [activeTab, setActiveTab] = useState("0")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userProgress, setUserProgress] = useState(null)
  const [allContentRead, setAllContentRead] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get formation details
        const formationData = await formationService.getCollaboratorFormationById(formationId)
        setFormation(formationData)

        // Get module details
        const moduleData = await formationService.getModuleById(formationId, moduleId)
        setModule(moduleData)

        // Get user progress
        const progressData = await formationService.getFormationProgress(formationId)
        setUserProgress(progressData)

        // FIXED: Check for content index in URL parameters
        const contentIndexFromUrl = searchParams.get('content')
        
        if (moduleData.contents && moduleData.contents.length > 0) {
          let targetIndex = 0
          
          // If content index is specified in URL, use it
          if (contentIndexFromUrl !== null) {
            const parsedIndex = parseInt(contentIndexFromUrl)
            if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < moduleData.contents.length) {
              targetIndex = parsedIndex
            }
          }
          
          setActiveContent(moduleData.contents[targetIndex])
          setActiveTab(targetIndex.toString())
        }

        // Check if all content is read after setting the module data
        if (moduleData?.contents && moduleData.contents.length > 0) {
          const readStatusPromises = moduleData.contents.map(content => 
            isSupportSeen(content.id, currentUser?.id)
          )
          const readStatuses = await Promise.all(readStatusPromises)
          const allRead = readStatuses.every(status => status === true)
          setAllContentRead(allRead)
        }
      } catch (error) {
        setError("Impossible de récupérer le contenu du module. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [formationId, moduleId, currentUser?.id, searchParams]) // Added searchParams to dependencies

  const handleContentChange = (value) => {
    console.log('🔄 handleContentChange called with:', { value, type: typeof value })
    const index = parseInt(value)
    console.log('🔄 Parsed index:', index)
    console.log('🔄 Module contents:', module?.contents?.map((c, i) => ({ index: i, title: c.title, id: c.id })))
    
    if (module?.contents && module.contents[index]) {
      console.log('🔄 Setting active content to:', module.contents[index])
      setActiveContent(module.contents[index])
      setActiveTab(value)
      
      // FIXED: Update URL to reflect current content
      const newUrl = `/formation/${formationId}/module/${moduleId}?content=${index}`
      navigate(newUrl, { replace: true })
    } else {
      console.error('🔄 Content not found at index:', index)
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

      // Check if all content is now read
      try {
        const readStatusPromises = updatedContents.map(content => 
          isSupportSeen(content.id, currentUser?.id)
        )
        const readStatuses = await Promise.all(readStatusPromises)
        const allRead = readStatuses.every(status => status === true)
        setAllContentRead(allRead)
      } catch (error) {
        // Fallback to local state
        const allRead = updatedContents.every(content => content.isRead)
        setAllContentRead(allRead)
      }
    }
  }

  const isLastContent = () => {
    if (!module?.contents || module.contents.length === 0) return false
    return Number.parseInt(activeTab) === (module.contents.length - 1)
  }

  const hasQuiz = () => {
    // Check if module has any quiz, regardless of questions being populated
    const hasQuizResult = module?.quizs && module.quizs.length > 0
    return hasQuizResult
  }

  const handleStartQuiz = () => {
    if (!allContentRead) {
      Swal.fire({
        title: 'Contenus non terminés',
        text: 'Vous devez consulter tous les contenus du module avant de pouvoir accéder au quiz.',
        icon: 'warning',
        confirmButtonText: 'D\'accord'
      })
      return
    }
    navigate(`/formation/${formationId}/module/${moduleId}/quiz`)
  }

  const handleNextContent = () => {
    const currentIndex = Number.parseInt(activeTab)
    if (currentIndex < module.contents.length - 1) {
      handleContentChange((currentIndex + 1).toString())
    }
  }

  const handlePreviousContent = () => {
    const currentIndex = Number.parseInt(activeTab)
    if (currentIndex > 0) {
      handleContentChange((currentIndex - 1).toString())
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
            <BreadcrumbLink>{module.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/formation/${formationId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la formation
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">{module.title}</h2>



          {/* Tab Content */}
          {module.contents && module.contents.length > 0 && module.contents.map((content, index) => (
            <div 
              key={content.id} 
              style={{ display: index.toString() === activeTab ? 'block' : 'none' }}
              className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ContentViewer
                key={`${content.id}-${index.toString() === activeTab}`}
                formationId={formationId}
                moduleId={moduleId}
                content={{
                  ...content,
                  isRead: content.isRead || userProgress?.completedContents?.includes(content.id),
                }}
                onContentRead={handleContentRead}
                collaborateurId={currentUser?.id}
              />
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePreviousContent} disabled={Number.parseInt(activeTab) === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>

            {/* Show quiz button if on last content, all content is read, and module has a quiz */}
            {isLastContent() && allContentRead && hasQuiz() ? (
              <Button onClick={handleStartQuiz}>
                Passer le test
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : isLastContent() && allContentRead && !hasQuiz() ? (
              <Button onClick={() => navigate(`/formation/${formationId}`)}>
                Retour à la formation
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleNextContent}
                disabled={!module.contents || Number.parseInt(activeTab) === (module.contents.length - 1)}
              >
                Continuer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ModuleContent
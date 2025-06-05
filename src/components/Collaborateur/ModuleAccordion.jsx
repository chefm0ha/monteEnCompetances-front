// src/components/Collaborateur/ModuleAccordion.jsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { CheckCircle, Lock, FileText, Video, File, PlayCircle, Loader } from "lucide-react"
import { isModuleUnlocked, getFormationProgressWithModules, getModuleSupportsProgress } from "../../services/formationService"

const ModuleAccordion = ({ formationId, modules, userProgress, formationProgress: externalFormationProgress, collaborateurId }) => {
  const navigate = useNavigate()
  const [expandedModule, setExpandedModule] = useState(null)
  const [moduleUnlockStatus, setModuleUnlockStatus] = useState({})
  const [moduleProgress, setModuleProgress] = useState({})
  const [formationProgress, setFormationProgress] = useState(externalFormationProgress || null)
  const [loading, setLoading] = useState(true)

  // Load module unlock status and progress
  useEffect(() => {
    const loadModuleData = async () => {
      if (!modules || !collaborateurId) return

      setLoading(true)
      try {
        // Get formation-wide progress only if not provided externally
        if (!externalFormationProgress) {
          const progressData = await getFormationProgressWithModules(formationId, collaborateurId)
          setFormationProgress(progressData)
        } else {
          setFormationProgress(externalFormationProgress)
        }

        // Get unlock status for each module
        const unlockStatus = {}
        const moduleProgressData = {}

        for (const module of modules) {
          try {
            const unlocked = await isModuleUnlocked(module.id, collaborateurId)
            unlockStatus[module.id] = unlocked

            // Get detailed progress for unlocked modules
            if (unlocked) {
              const supports = await getModuleSupportsProgress(module.id, collaborateurId)
              moduleProgressData[module.id] = supports
            }
          } catch (error) {
            console.error(`Error loading data for module ${module.id}:`, error)
            unlockStatus[module.id] = false
            moduleProgressData[module.id] = []
          }
        }

        setModuleUnlockStatus(unlockStatus)
        setModuleProgress(moduleProgressData)

      } catch (error) {
        console.error('Error loading module data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadModuleData()
  }, [modules, collaborateurId, formationId, externalFormationProgress])

  // Find the first incomplete module to expand by default
  useEffect(() => {
    if (modules && modules.length > 0 && !loading && formationProgress) {
      const sortedModules = [...modules].sort((a, b) => a.ordre - b.ordre)
      const firstIncompleteModule = sortedModules.find((module) => {
        const isUnlocked = isModuleUnlockedLocal(module.id)
        const isCompleted = isModuleCompleted(module.id)
        return isUnlocked && !isCompleted
      })

      if (firstIncompleteModule) {
        setExpandedModule(firstIncompleteModule.id.toString())
      } else if (modules.length > 0) {
        setExpandedModule(sortedModules[0].id.toString())
      }
    }
  }, [modules, loading, formationProgress])

  const isModuleUnlockedLocal = (moduleId) => {
    const sortedModules = [...modules].sort((a, b) => a.ordre - b.ordre)
    const currentModuleIndex = sortedModules.findIndex(m => m.id === moduleId)
    
    if (currentModuleIndex === 0) {
      return true
    }
    
    for (let i = 0; i < currentModuleIndex; i++) {
      const previousModule = sortedModules[i]
      const moduleProgressInfo = formationProgress?.modules?.find(m => m.moduleId === previousModule.id)
      const isCompleted = moduleProgressInfo?.completed || false
      
      if (!isCompleted) {
        return false
      }
    }
    
    return true
  }

  const isModuleCompleted = (moduleId) => {
    if (formationProgress?.modules) {
      const moduleProgressInfo = formationProgress.modules.find(m => m.moduleId === moduleId)
      return moduleProgressInfo?.completed || false
    }
    return userProgress?.completedModules?.includes(moduleId) || false
  }

  const isSupportSeen = (supportId) => {
    for (const moduleId in moduleProgress) {
      const supports = moduleProgress[moduleId]
      const support = supports.find(s => s.supportId === supportId)
      if (support && support.seen) {
        return true
      }
    }
    return false
  }

  const isQuizPassed = (moduleId) => {
    return isModuleCompleted(moduleId)
  }

  const getModuleContentProgress = (module) => {
    if (!module.contents || module.contents.length === 0) {
      return { seen: 0, total: 0, percentage: 0 }
    }
    
    const seenCount = module.contents.filter(content => isSupportSeen(content.id)).length
    const total = module.contents.length
    const percentage = Math.round((seenCount / total) * 100)
    
    return { seen: seenCount, total, percentage }
  }

  const getContentIcon = (contentType) => {
    switch (contentType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-4 w-4 mr-2" />
      case "video":
        return <Video className="h-4 w-4 mr-2" />
      case "text":
        return <File className="h-4 w-4 mr-2" />
      default:
        return <File className="h-4 w-4 mr-2" />
    }
  }

  // FIXED: Pass content index to navigate to specific content
  const handleContentClick = async (moduleId, contentId) => {
    // Find the content index in the module
    const module = modules.find(m => m.id === moduleId)
    if (module && module.contents) {
      const contentIndex = module.contents.findIndex(c => c.id === contentId)
      // Navigate with content index as URL parameter
      navigate(`/formation/${formationId}/module/${moduleId}?content=${contentIndex}`)
    } else {
      // Fallback to original navigation
      navigate(`/formation/${formationId}/module/${moduleId}`)
    }
  }

  const handleQuizClick = (moduleId) => {
    navigate(`/formation/${formationId}/module/${moduleId}/quiz`)
  }

  const handleContentRead = async (contentId) => {
    try {
      const moduleId = modules.find(m => 
        m.contents && m.contents.some(c => c.id === contentId)
      )?.id
      
      if (moduleId) {
        const updatedSupports = await getModuleSupportsProgress(moduleId, collaborateurId)
        setModuleProgress(prev => ({
          ...prev,
          [moduleId]: updatedSupports
        }))

        const progressData = await getFormationProgressWithModules(formationId, collaborateurId)
        setFormationProgress(progressData)
      }
    } catch (error) {
      console.error('Error refreshing module progress:', error)
    }
  }

  const isQuizUnlocked = (moduleId) => {
    const module = modules.find((m) => m.id === moduleId)
    if (!module || !module.contents || module.contents.length === 0) {
      return true
    }

    return module.contents.every((support) => isSupportSeen(support.id))
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <Loader className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement des modules...</span>
      </div>
    )
  }

  return (
    <Accordion type="single" collapsible value={expandedModule} onValueChange={setExpandedModule} className="w-full">
      {modules.map((module, index) => {
        const contentProgress = getModuleContentProgress(module)
        const isCompleted = isModuleCompleted(module.id)
        const isUnlocked = isModuleUnlockedLocal(module.id)
        
        return (
        <AccordionItem key={module.id} value={module.id.toString()}>
          <AccordionTrigger className="px-4 py-2 hover:bg-muted/50 rounded-md">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                ) : !isUnlocked ? (
                  <Lock className="h-5 w-5 text-muted-foreground mr-2" />
                ) : null}
                <div className="flex flex-col items-start">
                  <span className="font-medium">{module.title}</span>
                  {isUnlocked && !isCompleted && (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {contentProgress.seen}/{contentProgress.total} contenus consultés
                        </span>
                        {module.quizs && module.quizs.length > 0 && (
                          <span>• Quiz {isQuizPassed(module.id) ? 'réussi' : 'en attente'}</span>
                        )}
                      </div>
                      {contentProgress.total > 0 && (
                        <div className="w-32">
                          <Progress 
                            value={contentProgress.percentage} 
                            className="h-1" 
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isCompleted && (
                  <Badge className="bg-blue-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Terminé
                  </Badge>
                )}
                {isUnlocked && !isCompleted && (
                  <Badge variant="outline" className="border-blue-200 text-blue-600">
                    En cours
                  </Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-2">
            {!isModuleUnlockedLocal(module.id) ? (
              <div className="p-4 text-center text-muted-foreground">
                <Lock className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Module verrouillé</p>
                <p className="text-sm mt-1">
                  Terminez le quiz du module précédent pour débloquer celui-ci.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Module contents */}
                <div className="space-y-1 mb-4">
                  {module.contents && module.contents.length > 0 ? (
                    module.contents.map((content) => {
                      const isContentSeen = isSupportSeen(content.id)
                      return (
                        <Button
                          key={content.id}
                          variant="ghost"
                          className={`w-full justify-start relative ${isContentSeen ? 'bg-blue-50 border-blue-200 border' : 'hover:bg-muted/50'}`}
                          onClick={() => handleContentClick(module.id, content.id)}
                        >
                          <div className="flex items-center w-full">
                            {getContentIcon(content.type)}
                            <span className={`flex-1 text-left ${isContentSeen ? 'text-blue-800' : ''}`}>
                              {content.title}
                            </span>
                            {isContentSeen && (
                              <div className="flex items-center gap-1 ml-2">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-xs text-blue-600 font-medium">Consulté</span>
                              </div>
                            )}
                          </div>
                        </Button>
                      )
                    })
                  ) : (
                    <div className="text-center p-4 text-muted-foreground text-sm">
                      Ce module n'a pas encore de contenu
                    </div>
                  )}
                </div>

                {/* Quiz button */}
                {module.quizs && module.quizs.length > 0 && module.quizs[0].questions && module.quizs[0].questions.length > 0 ? (
                  <div className="relative">
                    <Button
                      variant="outline"
                      className={`w-full ${isQuizPassed(module.id) ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}`}
                      disabled={!isQuizUnlocked(module.id)}
                      onClick={() => handleQuizClick(module.id)}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      <span className="flex-1 text-left">
                        {isQuizPassed(module.id)
                          ? "Refaire le quiz"
                          : isQuizUnlocked(module.id)
                            ? "Commencer le quiz"
                            : "Consultez tous les supports pour débloquer le quiz"}
                      </span>
                      {isQuizPassed(module.id) && (
                        <div className="flex items-center gap-1 ml-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-blue-600 font-medium">Réussi</span>
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted-foreground text-sm">
                    Ce module n'a pas de quiz
                  </div>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
        )
      })}
    </Accordion>
  )
}

export default ModuleAccordion
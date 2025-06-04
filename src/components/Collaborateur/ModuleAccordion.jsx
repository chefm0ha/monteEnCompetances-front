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
  const [formationProgress, setFormationProgress] = useState(externalFormationProgress || null) // Use external prop if provided
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
          setFormationProgress(progressData) // Set as state
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
      // Sort modules by order and find first unlocked incomplete module
      const sortedModules = [...modules].sort((a, b) => a.ordre - b.ordre)
      const firstIncompleteModule = sortedModules.find((module) => {
        const isUnlocked = isModuleUnlockedLocal(module.id)
        const isCompleted = isModuleCompleted(module.id)
        return isUnlocked && !isCompleted
      })

      if (firstIncompleteModule) {
        setExpandedModule(firstIncompleteModule.id.toString())
      } else if (modules.length > 0) {
        // If all modules are completed or none are unlocked, expand the first module
        setExpandedModule(sortedModules[0].id.toString())
      }
    }
  }, [modules, loading, formationProgress])

  const isModuleUnlockedLocal = (moduleId) => {
    // First module is always unlocked
    const sortedModules = [...modules].sort((a, b) => a.ordre - b.ordre)
    const currentModuleIndex = sortedModules.findIndex(m => m.id === moduleId)
    
    if (currentModuleIndex === 0) {
      return true // First module is always unlocked
    }
    
    // Check if all previous modules are completed (quiz passed)
    for (let i = 0; i < currentModuleIndex; i++) {
      const previousModule = sortedModules[i]
      const moduleProgressInfo = formationProgress?.modules?.find(m => m.moduleId === previousModule.id)
      const isCompleted = moduleProgressInfo?.completed || false
      
      if (!isCompleted) {
        return false // Previous module not completed
      }
    }
    
    return true // All previous modules are completed
  }

  const isModuleCompleted = (moduleId) => {
    // Check using formation progress data first (more accurate)
    if (formationProgress?.modules) {
      const moduleProgressInfo = formationProgress.modules.find(m => m.moduleId === moduleId)
      return moduleProgressInfo?.completed || false
    }
    // Fallback to userProgress if formation progress not available
    return userProgress?.completedModules?.includes(moduleId) || false
  }

  const isSupportSeen = (supportId) => {
    // Check across all module progress data
    for (const moduleId in moduleProgress) {
      const supports = moduleProgress[moduleId]
      const support = supports.find(s => s.supportId === supportId)
      if (support && support.seen) {  // Changed from isSeen to seen based on API response
        return true
      }
    }
    return false
  }

  const isQuizPassed = (moduleId) => {
    // Check if module has been completed which means quiz was passed
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

  const handleContentClick = async (moduleId, contentId) => {
    navigate(`/formation/${formationId}/module/${moduleId}`)
  }

  const handleQuizClick = (moduleId) => {
    navigate(`/formation/${formationId}/module/${moduleId}/quiz`)
  }

  const handleContentRead = async (contentId) => {
    // Refresh module progress for the specific module
    try {
      const moduleId = modules.find(m => 
        m.contents && m.contents.some(c => c.id === contentId)
      )?.id
      
      if (moduleId) {
        // Refresh supports progress for this module
        const updatedSupports = await getModuleSupportsProgress(moduleId, collaborateurId)
        setModuleProgress(prev => ({
          ...prev,
          [moduleId]: updatedSupports
        }))

        // Also refresh formation progress to update completion status
        const progressData = await getFormationProgressWithModules(formationId, collaborateurId)
        setFormationProgress(progressData)
      }
    } catch (error) {
      console.error('Error refreshing module progress:', error)
    }
  }

  const isQuizUnlocked = (moduleId) => {
    // Quiz is unlocked if all supports in the module are seen
    const module = modules.find((m) => m.id === moduleId)
    if (!module || !module.contents || module.contents.length === 0) {
      // If module has no content, quiz should be unlocked by default
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
          <AccordionTrigger className="px-4 py-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : !isUnlocked ? (
                  <Lock className="h-5 w-5 text-gray-400 mr-2" />
                ) : null}
                <div className="flex flex-col items-start">
                  <span className="font-medium">{module.title}</span>
                  {isUnlocked && !isCompleted && (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
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
                  <Badge className="bg-green-500 text-white">
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
              <div className="p-4 text-center text-gray-500">
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
                          className={`w-full justify-start relative ${isContentSeen ? 'bg-green-50 border-green-200 border' : 'hover:bg-gray-50'}`}
                          onClick={() => handleContentClick(module.id, content.id)}
                        >
                          <div className="flex items-center w-full">
                            {getContentIcon(content.type)}
                            <span className={`flex-1 text-left ${isContentSeen ? 'text-green-800' : ''}`}>
                              {content.title}
                            </span>
                            {isContentSeen && (
                              <div className="flex items-center gap-1 ml-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-xs text-green-600 font-medium">Consulté</span>
                              </div>
                            )}
                          </div>
                        </Button>
                      )
                    })
                  ) : (
                    <div className="text-center p-4 text-gray-500 text-sm">
                      Ce module n'a pas encore de contenu
                    </div>
                  )}
                </div>

                {/* Quiz button */}
                {module.quizs && module.quizs.length > 0 && module.quizs[0].questions && module.quizs[0].questions.length > 0 ? (
                  <div className="relative">
                    <Button
                      variant="outline"
                      className={`w-full ${isQuizPassed(module.id) ? 'bg-green-50 border-green-200 text-green-800' : ''}`}
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
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Réussi</span>
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4 text-gray-500 text-sm">
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


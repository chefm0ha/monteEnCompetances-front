"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { CheckCircle, Lock, FileText, Video, File, PlayCircle } from "lucide-react"

const ModuleAccordion = ({ formationId, modules, userProgress }) => {
  const navigate = useNavigate()
  const [expandedModule, setExpandedModule] = useState(null)

  // Find the first incomplete module to expand by default
  useEffect(() => {
    if (modules && modules.length > 0) {
      const firstIncompleteModule = modules.find((module) => !userProgress?.completedModules?.includes(module.id))

      if (firstIncompleteModule) {
        setExpandedModule(firstIncompleteModule.id.toString())
      } else {
        setExpandedModule(modules[0].id.toString())
      }
    }
  }, [modules, userProgress])

  const isModuleUnlocked = (moduleIndex) => {
    if (moduleIndex === 0) return true

    // A module is unlocked if the previous module is completed
    const previousModuleId = modules[moduleIndex - 1].id
    return userProgress?.completedModules?.includes(previousModuleId)
  }

  const isModuleCompleted = (moduleId) => {
    return userProgress?.completedModules?.includes(moduleId)
  }

  const isContentCompleted = (contentId) => {
    return userProgress?.completedContents?.includes(contentId)
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

  const isQuizUnlocked = (moduleId) => {
    // Quiz is unlocked if all contents in the module are completed
    const module = modules.find((m) => m.id === moduleId)
    if (!module || !module.contents || module.contents.length === 0) return false

    return module.contents.every((content) => isContentCompleted(content.id))
  }

  return (
    <Accordion type="single" collapsible value={expandedModule} onValueChange={setExpandedModule} className="w-full">
      {modules.map((module, index) => (
        <AccordionItem key={module.id} value={module.id.toString()}>
          <AccordionTrigger className="px-4 py-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center">
                {isModuleCompleted(module.id) ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : !isModuleUnlocked(index) ? (
                  <Lock className="h-5 w-5 text-gray-400 mr-2" />
                ) : null}
                <span>{module.title}</span>
              </div>
              {isModuleCompleted(module.id) && <Badge className="bg-green-500 ml-2">Terminé</Badge>}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-2">
            {!isModuleUnlocked(index) ? (
              <div className="p-4 text-center text-gray-500">
                <Lock className="h-8 w-8 mx-auto mb-2" />
                <p>Terminez le module précédent pour débloquer celui-ci.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Module contents */}
                <div className="space-y-1 mb-4">
                  {module.contents && module.contents.length > 0 ? (
                    module.contents.map((content) => (
                      <Button
                        key={content.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleContentClick(module.id, content.id)}
                      >
                        {getContentIcon(content.type)}
                        <span className="flex-1 text-left">{content.title}</span>
                        {isContentCompleted(content.id) && <CheckCircle className="h-4 w-4 text-green-500 ml-2" />}
                      </Button>
                    ))
                  ) : (
                    <div className="text-center p-4 text-gray-500 text-sm">
                      Ce module n'a pas encore de contenu
                    </div>
                  )}
                </div>

                {/* Quiz button */}
                {module.quiz && module.quiz.questions && module.quiz.questions.length > 0 ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!isQuizUnlocked(module.id)}
                    onClick={() => handleQuizClick(module.id)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    {isModuleCompleted(module.id)
                      ? "Refaire le quiz"
                      : isQuizUnlocked(module.id)
                        ? "Commencer le quiz"
                        : "Consultez tous les contenus pour débloquer le quiz"}
                  </Button>
                ) : (
                  <div className="text-center p-4 text-gray-500 text-sm">
                    Ce module n'a pas de quiz
                  </div>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default ModuleAccordion


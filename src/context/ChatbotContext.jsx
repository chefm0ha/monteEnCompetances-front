"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { chatbotService } from "../services/chatbotService"

const ChatbotContext = createContext()

export const useChatbot = () => useContext(ChatbotContext)

export const ChatbotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date().toISOString()
    },
  ])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [isHealthy, setIsHealthy] = useState(true)

  // Initialize session on mount
  useEffect(() => {
    const currentSession = chatbotService.getCurrentSessionId()
    setSessionId(currentSession)
    
    // Check chatbot health on initialization
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      const health = await chatbotService.healthCheck()
      setIsHealthy(health.status === "UP")
    } catch (error) {
      console.error("Health check failed:", error)
      setIsHealthy(false)
    }
  }

  const toggleChatbot = () => {
    setIsOpen(!isOpen)
  }

  const sendMessage = async (text) => {
    if (!text.trim()) return

    // Add user message
    const userMessage = { 
      id: Date.now(), 
      text, 
      sender: "user",
      timestamp: new Date().toISOString()
    }
    setMessages((prev) => [...prev, userMessage])

    // Set loading state
    setLoading(true)

    try {
      // Get bot response using new API
      const response = await chatbotService.sendMessage(text)

      // Add bot message
      const botMessage = { 
        id: Date.now() + 1, 
        text: response.message || response.response, 
        sender: "bot",
        timestamp: response.timestamp || new Date().toISOString(),
        sessionId: response.sessionId
      }
      setMessages((prev) => [...prev, botMessage])

      // Update session ID if provided
      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId)
      }

    } catch (error) {
      console.error("Error sending message to chatbot:", error)
      
      let errorText = "Désolé, je rencontre des difficultés à répondre. Veuillez réessayer plus tard."
      
      // Handle specific error cases
      if (error.response?.status === 500) {
        errorText = "Service temporairement indisponible. Veuillez réessayer dans quelques instants."
      } else if (error.response?.status === 400) {
        errorText = "Format de question invalide. Veuillez reformuler votre question."
      } else if (!navigator.onLine) {
        errorText = "Pas de connexion internet. Vérifiez votre connexion et réessayez."
      }

      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: "bot",
        timestamp: new Date().toISOString(),
        isError: true
      }
      setMessages((prev) => [...prev, errorMessage])
      
      // Mark as unhealthy if we get server errors
      if (error.response?.status >= 500) {
        setIsHealthy(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = async () => {
    try {
      // Clear conversation on server
      await chatbotService.clearConversation()
      
      // Create new session
      const newSessionId = chatbotService.createNewSession()
      setSessionId(newSessionId)
      
      // Reset messages to initial state
      setMessages([
        {
          id: 1,
          text: "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?",
          sender: "bot",
          timestamp: new Date().toISOString()
        },
      ])
    } catch (error) {
      console.error("Error clearing conversation:", error)
      
      // Even if server call fails, clear local messages
      const newSessionId = chatbotService.createNewSession()
      setSessionId(newSessionId)
      
      setMessages([
        {
          id: 1,
          text: "Conversation effacée localement. Comment puis-je vous aider ?",
          sender: "bot",
          timestamp: new Date().toISOString()
        },
      ])
    }
  }

  const getServiceInfo = async () => {
    try {
      return await chatbotService.getServiceInfo()
    } catch (error) {
      console.error("Error getting service info:", error)
      throw error
    }
  }

  const value = {
    isOpen,
    messages,
    loading,
    sessionId,
    isHealthy,
    toggleChatbot,
    sendMessage,
    clearMessages,
    checkHealth,
    getServiceInfo
  }

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
}


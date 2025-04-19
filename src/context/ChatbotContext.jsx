"use client"

import { createContext, useState, useContext } from "react"
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
    },
  ])
  const [loading, setLoading] = useState(false)

  const toggleChatbot = () => {
    setIsOpen(!isOpen)
  }

  const sendMessage = async (text) => {
    if (!text.trim()) return

    // Add user message
    const userMessage = { id: Date.now(), text, sender: "user" }
    setMessages((prev) => [...prev, userMessage])

    // Set loading state
    setLoading(true)

    try {
      // Get bot response
      const response = await chatbotService.sendMessage(text)

      // Add bot message
      const botMessage = { id: Date.now() + 1, text: response, sender: "bot" }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message to chatbot:", error)
      const errorMessage = {
        id: Date.now() + 1,
        text: "Désolé, je rencontre des difficultés à répondre. Veuillez réessayer plus tard.",
        sender: "bot",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([
      {
        id: 1,
        text: "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?",
        sender: "bot",
      },
    ])
  }

  const value = {
    isOpen,
    messages,
    loading,
    toggleChatbot,
    sendMessage,
    clearMessages,
  }

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
}


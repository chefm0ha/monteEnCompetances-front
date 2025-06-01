"use client"

import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { MessageCircle, X, Send, Loader2, RotateCcw, AlertCircle, CheckCircle } from "lucide-react"
import { useChatbot } from "../../context/ChatbotContext"
import { useAuth } from "../../context/AuthContext"
import { APP_SETTINGS } from "../../config"
import { Badge } from "../ui/badge"

const ChatbotWidget = () => {
  const location = useLocation()
  const { 
    isOpen, 
    messages, 
    loading, 
    sessionId, 
    isHealthy, 
    toggleChatbot, 
    sendMessage, 
    clearMessages,
    checkHealth 
  } = useChatbot()
  
  const { currentUser } = useAuth()
  const [inputValue, setInputValue] = useState("")
  const [showHealth, setShowHealth] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim() && !loading) {
      sendMessage(inputValue)
      setInputValue("")
    }
  }

  const handleClearConversation = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer cette conversation ?")) {
      await clearMessages()
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString("fr-FR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  // Don't render the chatbot for admin users
  if (currentUser && currentUser.role === "ADMIN") {
    return null;
  }

  // Don't render the chatbot on login page
  if (location.pathname === "/login") {
    return null;
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6">
        <Button 
          onClick={toggleChatbot} 
          className={`rounded-full h-14 w-14 shadow-lg relative ${
            !isHealthy ? 'bg-orange-500 hover:bg-orange-600' : ''
          }`}
        >
          <MessageCircle className="h-6 w-6" />
          {!isHealthy && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </div>
    )
  }

  return (
    <Card 
      className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] shadow-xl flex flex-col z-50 bg-white border border-gray-200"
      style={{ backgroundColor: '#ffffff', opacity: 1 }}
    >
      <CardHeader 
        className="px-4 py-3 border-b flex flex-row items-center justify-between bg-white"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="flex items-center space-x-2">
          <img src={APP_SETTINGS.logoUrl || "/placeholder.svg"} alt="Chatbot" className="h-6 w-6" />
          <CardTitle className="text-lg">Assistant</CardTitle>
          <Badge 
            variant={isHealthy ? "default" : "destructive"}
            className="text-xs"
            onMouseEnter={() => setShowHealth(true)}
            onMouseLeave={() => setShowHealth(false)}
          >
            {isHealthy ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            {isHealthy ? "En ligne" : "Hors ligne"}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClearConversation}
            disabled={loading}
            title="Effacer la conversation"
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleChatbot}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {showHealth && (
        <div className="px-4 py-2 bg-muted text-xs text-muted-foreground border-b">
          Session: {sessionId ? sessionId.substring(0, 8) + "..." : "Non initialisée"}
          <Button 
            variant="link" 
            size="sm" 
            onClick={checkHealth}
            className="h-auto p-0 ml-2 text-xs"
          >
            Vérifier
          </Button>
        </div>
      )}

      <ScrollArea 
        className="flex-grow p-4 bg-white" 
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : message.isError 
                      ? "bg-red-100 border border-red-200 text-red-800" 
                      : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                {message.timestamp && (
                  <p className={`text-xs mt-1 opacity-70 ${
                    message.sender === "user" ? "text-primary-foreground" : "text-muted-foreground"
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <CardFooter 
        className="p-2 border-t bg-white" 
        style={{ backgroundColor: '#ffffff' }}
      >
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isHealthy ? "Posez votre question..." : "Service indisponible..."}
            className="flex-grow"
            disabled={loading || !isHealthy}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading || !inputValue.trim() || !isHealthy}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

export default ChatbotWidget


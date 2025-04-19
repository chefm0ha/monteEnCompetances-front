"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { useChatbot } from "../context/ChatbotContext"
import { APP_SETTINGS } from "../config"

const ChatbotWidget = () => {
  const { isOpen, messages, loading, toggleChatbot, sendMessage } = useChatbot()
  const [inputValue, setInputValue] = useState("")
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

  if (!isOpen) {
    return (
      <Button onClick={toggleChatbot} className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg">
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] shadow-xl flex flex-col z-50">
      <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <img src={APP_SETTINGS.logoUrl || "/placeholder.svg"} alt="Chatbot" className="h-6 w-6 mr-2" />
          Assistant
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={toggleChatbot}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>

      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.text}</p>
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

      <CardFooter className="p-2 border-t">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-grow"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

export default ChatbotWidget


import axios from "axios"
import { API_URL } from "../config"
import { 
  validateChatResponse, 
  normalizeChatResponse, 
  CHATBOT_CONFIG,
  getErrorMessage 
} from "../utils/chatbotUtils"

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for better error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for debugging
    console.error("Chatbot API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    })
    return Promise.reject(error)
  }
)

// Utility function to generate unique session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get or create session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem(CHATBOT_CONFIG.SESSION_STORAGE_KEY)
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem(CHATBOT_CONFIG.SESSION_STORAGE_KEY, sessionId)
  }
  return sessionId
}

export const chatbotService = {
  /**
   * Envoie une question au chatbot avec retry automatique
   * @param {string} question - La question de l'utilisateur
   * @returns {Promise<Object>} - La réponse du chatbot
   */
  sendMessage: async (question, retryCount = 0) => {
    try {
      // Validation côté client
      if (!question || typeof question !== 'string') {
        throw new Error('Question invalide')
      }

      const trimmedQuestion = question.trim()
      if (trimmedQuestion.length === 0) {
        throw new Error('Question vide')
      }

      if (trimmedQuestion.length > CHATBOT_CONFIG.MAX_MESSAGE_LENGTH) {
        throw new Error(`Question trop longue (max ${CHATBOT_CONFIG.MAX_MESSAGE_LENGTH} caractères)`)
      }

      const sessionId = getSessionId()
      
      const requestData = {
        question: trimmedQuestion,
        sessionId: sessionId,
        userId: localStorage.getItem("userId"), // Optionnel
        timestamp: new Date().toISOString()
      }

      const response = await API.post("/api/chat/ask", requestData)
      
      // Valider la réponse
      if (!validateChatResponse(response.data)) {
        throw new Error('Format de réponse invalide')
      }

      if (response.data.error) {
        throw new Error(response.data.message || "Erreur lors de la communication avec le chatbot")
      }

      return normalizeChatResponse(response.data)

    } catch (error) {
      // Gestion des retry pour les erreurs temporaires
      if (retryCount < CHATBOT_CONFIG.MAX_RETRY_ATTEMPTS) {
        const shouldRetry = 
          error.code === 'NETWORK_ERROR' ||
          error.response?.status >= 500 ||
          error.message?.includes('timeout')

        if (shouldRetry) {
          await new Promise(resolve => setTimeout(resolve, CHATBOT_CONFIG.RETRY_DELAY * (retryCount + 1)))
          return await chatbotService.sendMessage(question, retryCount + 1)
        }
      }

      // Si c'est une erreur de session, on recrée une nouvelle session
      if (error.response?.status === 400 && error.response?.data?.message?.includes("session")) {
        localStorage.removeItem(CHATBOT_CONFIG.SESSION_STORAGE_KEY)
        
        // Retry avec une nouvelle session (une seule fois)
        if (retryCount === 0) {
          return await chatbotService.sendMessage(question, retryCount + 1)
        }
      }
      
      // Enrichir l'erreur avec un message utilisateur approprié
      const userMessage = getErrorMessage(error)
      const enrichedError = new Error(userMessage)
      enrichedError.originalError = error
      enrichedError.isUserFriendly = true
      
      throw enrichedError
    }
  },

  /**
   * Efface la conversation courante
   * @returns {Promise<Object>} - Confirmation de l'effacement
   */
  clearConversation: async () => {
    try {
      const sessionId = getSessionId()
      const response = await API.delete(`/api/chat/conversation/${sessionId}`)
      
      // Générer un nouveau session ID après l'effacement
      localStorage.removeItem(CHATBOT_CONFIG.SESSION_STORAGE_KEY)
      
      return {
        success: true,
        message: response.data?.message || CHATBOT_CONFIG.DEFAULT_MESSAGES.CONVERSATION_CLEARED,
        newSessionId: getSessionId()
      }
    } catch (error) {
      console.error("Error clearing conversation:", error)
      
      // Même si l'effacement serveur échoue, on peut effacer localement
      localStorage.removeItem(CHATBOT_CONFIG.SESSION_STORAGE_KEY)
      
      return {
        success: false,
        message: "Conversation effacée localement",
        newSessionId: getSessionId(),
        error: getErrorMessage(error)
      }
    }
  },

  /**
   * Vérifie l'état de santé du service chatbot (pour les utilisateurs réguliers uniquement)
   * @returns {Promise<Object>} - L'état de santé du service
   */
  healthCheck: async () => {
    try {
      const response = await API.get("/api/chat/health")
      return {
        ...response.data,
        timestamp: response.data.timestamp || Date.now(),
        lastCheck: new Date().toISOString()
      }
    } catch (error) {
      console.error("Error checking chatbot health:", error)
      return {
        status: "DOWN",
        service: "chatbot-service",
        timestamp: Date.now(),
        lastCheck: new Date().toISOString(),
        error: getErrorMessage(error)
      }
    }
  },

  /**
   * Obtient l'ID de session courante
   * @returns {string} - L'ID de session
   */
  getCurrentSessionId: () => {
    return getSessionId()
  },

  /**
   * Force la création d'une nouvelle session
   * @returns {string} - Le nouvel ID de session
   */
  createNewSession: () => {
    localStorage.removeItem(CHATBOT_CONFIG.SESSION_STORAGE_KEY)
    return getSessionId()
  },

  /**
   * Vérifie si le service est en ligne (pour les utilisateurs réguliers uniquement)
   * @returns {Promise<boolean>} - True si le service est opérationnel
   */
  isServiceOnline: async () => {
    try {
      const health = await chatbotService.healthCheck()
      return health.status === "UP"
    } catch (error) {
      return false
    }
  }
}
/**
 * Types et utilitaires pour le service chatbot
 */

// Types de messages
export const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot',
  SYSTEM: 'system',
  ERROR: 'error'
}

// Statuts de santé du service
export const HEALTH_STATUS = {
  UP: 'UP',
  DOWN: 'DOWN',
  MAINTENANCE: 'MAINTENANCE'
}

// Formats de réponse attendus du backend
export const RESPONSE_FORMATS = {
  SUCCESS: 'success',
  ERROR: 'error',
  PARTIAL: 'partial'
}

/**
 * Valide le format d'une réponse du chatbot
 * @param {Object} response - La réponse du serveur
 * @returns {boolean} - True si la réponse est valide
 */
export const validateChatResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return false
  }

  // Vérifier les champs obligatoires selon l'API
  const hasMessage = typeof response.message === 'string' || typeof response.response === 'string'
  const hasSessionId = typeof response.sessionId === 'string'
  const hasValidError = response.error === undefined || typeof response.error === 'boolean'

  return hasMessage && hasSessionId && hasValidError
}

/**
 * Normalise une réponse du chatbot pour l'interface
 * @param {Object} response - La réponse brute du serveur
 * @returns {Object} - La réponse normalisée
 */
export const normalizeChatResponse = (response) => {
  return {
    message: response.message || response.response || 'Réponse vide',
    sessionId: response.sessionId,
    timestamp: response.timestamp || new Date().toISOString(),
    isError: response.error || false,
    metadata: response.metadata || {}
  }
}

/**
 * Génère un ID unique pour les messages
 * @returns {string} - Un ID unique
 */
export const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Formate un timestamp pour l'affichage
 * @param {string|Date} timestamp - Le timestamp à formatter
 * @returns {string} - Le timestamp formaté
 */
export const formatMessageTimestamp = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)} h`
  
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Vérifie si le service est en ligne selon le statut de santé
 * @param {Object} healthStatus - Le statut de santé du service
 * @returns {boolean} - True si le service est opérationnel
 */
export const isServiceHealthy = (healthStatus) => {
  return healthStatus && healthStatus.status === HEALTH_STATUS.UP
}

/**
 * Constantes pour la configuration du chatbot
 */
export const CHATBOT_CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  SESSION_STORAGE_KEY: 'chatbot_session_id',
  HEALTH_CHECK_INTERVAL: 30000, // 30 secondes
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 seconde
  
  // Messages par défaut
  DEFAULT_MESSAGES: {
    WELCOME: 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?',
    ERROR_GENERIC: 'Désolé, je rencontre des difficultés à répondre. Veuillez réessayer plus tard.',
    ERROR_NETWORK: 'Pas de connexion internet. Vérifiez votre connexion et réessayez.',
    ERROR_SERVER: 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.',
    ERROR_VALIDATION: 'Format de question invalide. Veuillez reformuler votre question.',
    CONVERSATION_CLEARED: 'Conversation effacée avec succès.'
  }
}

/**
 * Utilitaire pour gérer les erreurs du chatbot
 * @param {Error} error - L'erreur à traiter
 * @returns {string} - Le message d'erreur approprié
 */
export const getErrorMessage = (error) => {
  if (!error) return CHATBOT_CONFIG.DEFAULT_MESSAGES.ERROR_GENERIC
  
  if (!navigator.onLine) {
    return CHATBOT_CONFIG.DEFAULT_MESSAGES.ERROR_NETWORK
  }
  
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return CHATBOT_CONFIG.DEFAULT_MESSAGES.ERROR_VALIDATION
      case 500:
      case 502:
      case 503:
        return CHATBOT_CONFIG.DEFAULT_MESSAGES.ERROR_SERVER
      default:
        return error.response.data?.message || CHATBOT_CONFIG.DEFAULT_MESSAGES.ERROR_GENERIC
    }
  }
  
  return error.message || CHATBOT_CONFIG.DEFAULT_MESSAGES.ERROR_GENERIC
}

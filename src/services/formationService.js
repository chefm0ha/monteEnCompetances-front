import axios from "axios";
import { API_URL } from "../config";

// Create axios instance with base configuration
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const formationService = {
  /**
   * Récupère toutes les formations
   * 
   * @returns {Promise<Array>} - Liste des formations
   */
  getAllFormations: async () => {
    try {
      const response = await API.get("/api/admin/formations");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des formations:", error);
      throw error;
    }
  },

  /**
   * Récupère les formations assignées à l'utilisateur connecté
   * 
   * @returns {Promise<Array>} - Liste des formations assignées
   */
  getAssignedFormations: async () => {
    try {
      const response = await API.get("/api/formations/assigned");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des formations assignées:", error);
      throw error;
    }
  },

  /**
   * Récupère une formation par son ID
   * 
   * @param {String} id - L'ID de la formation
   * @returns {Promise<Object>} - La formation
   */
  getFormationById: async (id) => {
    try {
      const response = await API.get(`/api/admin/formations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la formation ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle formation
   * 
   * @param {Object} formationData - Les données de la formation
   * @returns {Promise<Object>} - La formation créée
   */
  createFormation: async (formationData) => {
    try {
      // Convert duration to double
      const duration = parseFloat(formationData.duree);
      
      // Check if we have an image file
      if (formationData.imageFile) {
        // For image uploads, we need to use the Fetch API directly to properly set Content-Type headers
        // for each part of the multipart/form-data request
        
        const formationObject = {
          titre: formationData.titre,
          description: formationData.description,
          duree: duration,
          type: formationData.type
        };
        
        // Create form data
        const formData = new FormData();
        
        // We need to create a Blob with the proper Content-Type
        const formationBlob = new Blob(
          [JSON.stringify(formationObject)], 
          { type: 'application/json' }
        );
        
        // Append formation as JSON with proper Content-Type
        formData.append('formation', formationBlob);
        
        // Append image file
        formData.append('image', formationData.imageFile);
        
        // Get token for authorization
        const token = localStorage.getItem("token");
        
        // Use fetch API to make the request with proper headers
        const response = await fetch(`${API_URL}/api/admin/formations/with-image`, {
          method: 'POST',
          body: formData,
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } else {
        // No image, use standard axios JSON request
        const formationJson = {
          titre: formationData.titre,
          description: formationData.description,
          duree: duration,
          type: formationData.type
        };
        
        const response = await API.post("/api/admin/formations", formationJson);
        return response.data;
      }
    } catch (error) {
      console.error("Erreur lors de la création de la formation:", error);
      throw error;
    }
  },

  /**
   * Met à jour une formation existante
   * 
   * @param {String} id - L'ID de la formation
   * @param {Object} formationData - Les nouvelles données de la formation
   * @returns {Promise<Object>} - La formation mise à jour
   */
  updateFormation: async (id, formationData) => {
    try {
      // Convert duration to double
      const duration = parseFloat(formationData.duree);
      
      // Check if we have an image file
      if (formationData.imageFile) {
        // For image uploads, we need to use the Fetch API directly to properly set Content-Type headers
        // for each part of the multipart/form-data request
        
        const formationObject = {
          titre: formationData.titre,
          description: formationData.description,
          duree: duration,
          type: formationData.type
        };
        
        // Create form data
        const formData = new FormData();
        
        // We need to create a Blob with the proper Content-Type
        const formationBlob = new Blob(
          [JSON.stringify(formationObject)], 
          { type: 'application/json' }
        );
        
        // Append formation as JSON with proper Content-Type
        formData.append('formation', formationBlob);
        
        // Append image file
        formData.append('image', formationData.imageFile);
        
        // Get token for authorization
        const token = localStorage.getItem("token");
        
        // Use fetch API to make the request with proper headers
        const response = await fetch(`${API_URL}/api/admin/formations/${id}/with-image`, {
          method: 'PUT',
          body: formData,
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } else {
        // No image, use standard axios JSON request
        const formationJson = {
          titre: formationData.titre,
          description: formationData.description,
          duree: duration,
          type: formationData.type
        };
        
        const response = await API.put(`/api/admin/formations/${id}`, formationJson);
        return response.data;
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la formation ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une formation
   * 
   * @param {String} id - L'ID de la formation
   * @returns {Promise<boolean>} - true si la formation a été supprimée
   */
  deleteFormation: async (id) => {
    try {
      const response = await API.delete(`/api/admin/formations/${id}`);
      return response.data.success;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la formation ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère tous les modules d'une formation
   * 
   * @param {String} formationId - L'ID de la formation
   * @returns {Promise<Array>} - Liste des modules
   */
  getModules: async (formationId) => {
    try {
      const response = await API.get(`/api/formations/${formationId}/modules`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des modules de la formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère un module par son ID
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {String} moduleId - L'ID du module
   * @returns {Promise<Object>} - Le module
   */
  getModuleById: async (formationId, moduleId) => {
    try {
      const response = await API.get(`/api/formations/${formationId}/modules/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques des formations
   * 
   * @returns {Promise<Object>} - Les statistiques
   */
  getFormationsStats: async () => {
    try {
      const response = await API.get("/api/formations/stats");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques des formations:", error);
      throw error;
    }
  },

  /**
   * Récupère la progression d'une formation pour l'utilisateur connecté
   * 
   * @param {String} formationId - L'ID de la formation
   * @returns {Promise<Object>} - La progression
   */
  getFormationProgress: async (formationId) => {
    try {
      const response = await API.get(`/api/formations/${formationId}/progress`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la progression de la formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Marque un contenu comme lu
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {String} moduleId - L'ID du module
   * @param {String} contentId - L'ID du contenu
   * @returns {Promise<Object>} - L'état de progression mis à jour
   */
  markContentAsRead: async (formationId, moduleId, contentId) => {
    try {
      const response = await API.post(`/api/formations/${formationId}/modules/${moduleId}/contents/${contentId}/read`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du marquage du contenu ${contentId} comme lu:`, error);
      throw error;
    }
  },

  /**
   * Récupère le quiz d'un module
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {String} moduleId - L'ID du module
   * @returns {Promise<Object>} - Le quiz
   */
  getQuiz: async (formationId, moduleId) => {
    try {
      const response = await API.get(`/api/formations/${formationId}/modules/${moduleId}/quiz`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du quiz du module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Soumet les réponses d'un quiz
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {String} moduleId - L'ID du module
   * @param {Object} answers - Les réponses au quiz
   * @returns {Promise<Object>} - Les résultats du quiz
   */
  submitQuiz: async (formationId, moduleId, answers) => {
    try {
      const response = await API.post(`/api/formations/${formationId}/modules/${moduleId}/quiz/submit`, { answers });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la soumission du quiz du module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Génère un certificat pour une formation complétée
   * 
   * @param {String} formationId - L'ID de la formation
   * @returns {Promise<Blob>} - Le certificat au format PDF
   */
  generateCertificate: async (formationId) => {
    try {
      const response = await API.get(`/api/formations/${formationId}/certificate`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la génération du certificat pour la formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Assigne une formation à des collaborateurs
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {Array} collaborateurIds - Liste des IDs des collaborateurs
   * @returns {Promise<Object>} - Le résultat de l'assignation
   */
  assignFormation: async (formationId, collaborateurIds) => {
    try {
      const response = await API.post(`/api/formations/${formationId}/assign`, {
        collaborateurIds,
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'assignation de la formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les collaborateurs assignés à une formation
   * 
   * @param {String} formationId - L'ID de la formation
   * @returns {Promise<Array>} - Liste des collaborateurs assignés
   */
  getAssignedCollaborateurs: async (formationId) => {
    try {
      const response = await API.get(`/api/formations/${formationId}/assigned`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des collaborateurs assignés à la formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime l'assignation d'une formation à un collaborateur
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {String} collaborateurId - L'ID du collaborateur
   * @returns {Promise<Object>} - Le résultat de la suppression
   */
  removeAssignment: async (formationId, collaborateurId) => {
    try {
      const response = await API.delete(`/api/formations/${formationId}/assign/${collaborateurId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'assignation pour le collaborateur ${collaborateurId}:`, error);
      throw error;
    }
  },

  /**
   * Envoie un email de rappel à un collaborateur pour une formation
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {String} collaborateurId - L'ID du collaborateur
   * @returns {Promise<Object>} - Le résultat de l'envoi
   */
  sendReminderEmail: async (formationId, collaborateurId) => {
    try {
      const response = await API.post(`/api/formations/${formationId}/remind/${collaborateurId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'envoi du rappel au collaborateur ${collaborateurId}:`, error);
      throw error;
    }
  },
};
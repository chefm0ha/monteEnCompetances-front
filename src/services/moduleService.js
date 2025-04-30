import axios from "axios";
import { API_URL } from "../config";
import { fileService } from "./fileService";

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

export const moduleService = {
  /**
   * Récupère tous les modules
   * 
   * @returns {Promise<Array>} - Liste des modules
   */
  getAllModules: async () => {
    try {
      const response = await API.get("/api/admin/modules");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des modules:", error);
      throw error;
    }
  },

  /**
   * Récupère les modules d'une formation
   * 
   * @param {String} formationId - L'ID de la formation
   * @returns {Promise<Array>} - Liste des modules de la formation
   */
  getModulesByFormation: async (formationId) => {
    try {
      const response = await API.get(`/api/admin/formations/${formationId}/modules`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des modules de la formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère un module par son ID
   * 
   * @param {String} moduleId - L'ID du module
   * @returns {Promise<Object>} - Le module
   */
  getModuleById: async (moduleId) => {
    try {
      const response = await API.get(`/api/admin/formations/modules/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau module
   * 
   * @param {Object} formationId - L'objet contenant l'ID de la formation
   * @param {Object} moduleData - Les données du module
   * @returns {Promise<Object>} - Le module créé
   */
  createModule: async (formationId, moduleData) => {
    try {
      // Préparation du quiz si présent
      let modulePayload = { ...moduleData };
      
      // Si le module a un quiz avec des questions
      if (modulePayload.hasQuiz && modulePayload.quiz) {
        // S'assurer que chaque question a un ID et chaque choix également
        modulePayload.quiz.questions = modulePayload.quiz.questions.map(question => ({
          ...question,
          id: question.id || Date.now().toString(),
          choix: question.choix.map(choix => ({
            ...choix,
            id: choix.id || Date.now().toString() + Math.random().toString(36).substring(2, 9)
          }))
        }));
      }

      const response = await API.post(`/api/admin/formations/${formationId.formationId}/modules`, modulePayload);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du module:", error);
      throw error;
    }
  },

  /**
   * Met à jour un module existant
   * 
   * @param {String} moduleId - L'ID du module
   * @param {Object} moduleData - Les nouvelles données du module
   * @returns {Promise<Object>} - Le module mis à jour
   */
  updateModule: async (moduleId, moduleData) => {
    try {
      // Préparation du quiz si présent
      let modulePayload = { ...moduleData };
      
      // Si le module a un quiz avec des questions
      if (modulePayload.hasQuiz && modulePayload.quiz) {
        // S'assurer que chaque question a un ID et chaque choix également
        modulePayload.quiz.questions = modulePayload.quiz.questions.map(question => ({
          ...question,
          id: question.id || Date.now().toString(),
          choix: question.choix.map(choix => ({
            ...choix,
            id: choix.id || Date.now().toString() + Math.random().toString(36).substring(2, 9)
          }))
        }));
      }

      const response = await API.put(`/api/admin/modules/${moduleId}`, modulePayload);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un module
   * 
   * @param {String} moduleId - L'ID du module
   * @returns {Promise<boolean>} - true si le module a été supprimé
   */
  deleteModule: async (moduleId) => {
    try {
      // Récupérer d'abord le module pour avoir les URLs des fichiers associés
      const module = await moduleService.getModuleById(moduleId);
      
      // Supprimer le module avec le nouveau endpoint
      const response = await API.delete(`/api/admin/formations/modules/${moduleId}`);
      
      // Si le module avait des supports avec des fichiers, les supprimer également
      if (module.supports && module.supports.length > 0) {
        for (const support of module.supports) {
          if (support.type !== "TEXT" && support.lien) {
            await fileService.deleteFile(support.lien);
          }
        }
      }
      
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Réorganise l'ordre des modules dans une formation
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {Array} moduleIds - Liste ordonnée des IDs des modules
   * @returns {Promise<Object>} - Le résultat de la réorganisation
   */
  reorderModules: async (formationId, moduleIds) => {
    try {
      const response = await API.put(`/api/admin/formations/${formationId}/modules/reorder`, {
        moduleIds,
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la réorganisation des modules de la formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère tous les supports d'un module
   * 
   * @param {String} moduleId - L'ID du module
   * @returns {Promise<Array>} - Liste des supports
   */
  getSupports: async (moduleId) => {
    try {
      const response = await API.get(`/api/modules/${moduleId}/supports`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des supports du module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère un support par son ID
   * 
   * @param {String} moduleId - L'ID du module
   * @param {String} supportId - L'ID du support
   * @returns {Promise<Object>} - Le support
   */
  getSupportById: async (moduleId, supportId) => {
    try {
      const response = await API.get(`/api/modules/${moduleId}/supports/${supportId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du support ${supportId}:`, error);
      throw error;
    }
  },

  /**
   * Ajoute un support à un module
   * 
   * @param {String} moduleId - L'ID du module
   * @param {Object} supportData - Les données du support
   * @param {File} file - Le fichier associé au support (pour PDF ou VIDEO)
   * @returns {Promise<Object>} - Le support créé
   */
  addSupport: async (moduleId, supportData, file = null) => {
    try {
      let fileUrl = null;
      
      // Si un fichier est fourni, le télécharger
      if (file) {
        if (supportData.type === "PDF") {
          const uploadResult = await fileService.uploadPDF(file, "supports");
          fileUrl = uploadResult.fileUrl;
        } else if (supportData.type === "VIDEO") {
          const uploadResult = await fileService.uploadVideo(file, "supports");
          fileUrl = uploadResult.fileUrl;
        }
      }

      // Préparation des données pour l'API
      const apiData = {
        ...supportData,
        moduleId,
        lien: supportData.type === "TEXT" ? supportData.lien : fileUrl || supportData.lien
      };

      const response = await API.post(`/api/modules/${moduleId}/supports`, apiData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'ajout du support au module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Met à jour un support
   * 
   * @param {String} moduleId - L'ID du module
   * @param {String} supportId - L'ID du support
   * @param {Object} supportData - Les nouvelles données du support
   * @param {File} file - Le nouveau fichier associé au support (pour PDF ou VIDEO)
   * @returns {Promise<Object>} - Le support mis à jour
   */
  updateSupport: async (moduleId, supportId, supportData, file = null) => {
    try {
      let fileUrl = supportData.lien;
      
      // Si un fichier est fourni, le télécharger
      if (file) {
        // Récupérer d'abord le support pour avoir l'URL de l'ancien fichier
        const oldSupport = await moduleService.getSupportById(moduleId, supportId);
        
        // Supprimer l'ancien fichier si nécessaire
        if (oldSupport.lien && oldSupport.type !== "TEXT") {
          await fileService.deleteFile(oldSupport.lien);
        }
        
        if (supportData.type === "PDF") {
          const uploadResult = await fileService.uploadPDF(file, "supports");
          fileUrl = uploadResult.fileUrl;
        } else if (supportData.type === "VIDEO") {
          const uploadResult = await fileService.uploadVideo(file, "supports");
          fileUrl = uploadResult.fileUrl;
        }
      }

      // Préparation des données pour l'API
      const apiData = {
        ...supportData,
        lien: supportData.type === "TEXT" ? supportData.lien : fileUrl
      };

      const response = await API.put(`/api/modules/${moduleId}/supports/${supportId}`, apiData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du support ${supportId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un support
   * 
   * @param {String} moduleId - L'ID du module
   * @param {String} supportId - L'ID du support
   * @returns {Promise<boolean>} - true si le support a été supprimé
   */
  deleteSupport: async (moduleId, supportId) => {
    try {
      // Récupérer d'abord le support pour avoir l'URL du fichier
      const support = await moduleService.getSupportById(moduleId, supportId);
      
      // Supprimer le support
      const response = await API.delete(`/api/modules/${moduleId}/supports/${supportId}`);
      
      // Si le support avait un fichier, le supprimer également
      if (support.lien && support.type !== "TEXT") {
        await fileService.deleteFile(support.lien);
      }
      
      return response.data.success;
    } catch (error) {
      console.error(`Erreur lors de la suppression du support ${supportId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère le quiz d'un module
   * 
   * @param {String} moduleId - L'ID du module
   * @returns {Promise<Object>} - Le quiz
   */
  getQuiz: async (moduleId) => {
    try {
      const response = await API.get(`/api/modules/${moduleId}/quiz`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du quiz du module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Crée ou met à jour le quiz d'un module
   * 
   * @param {String} moduleId - L'ID du module
   * @param {Object} quizData - Les données du quiz
   * @returns {Promise<Object>} - Le quiz créé ou mis à jour
   */
  saveQuiz: async (moduleId, quizData) => {
    try {
      const response = await API.put(`/api/modules/${moduleId}/quiz`, quizData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du quiz du module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Réorganise l'ordre des supports dans un module
   * 
   * @param {String} moduleId - L'ID du module
   * @param {Array} supportIds - Liste ordonnée des IDs des supports
   * @returns {Promise<Object>} - Le résultat de la réorganisation
   */
  reorderSupports: async (moduleId, supportIds) => {
    try {
      const response = await API.put(`/api/modules/${moduleId}/supports/reorder`, {
        supportIds,
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la réorganisation des supports du module ${moduleId}:`, error);
      throw error;
    }
  }
};
import axios from "axios";
import { API_URL } from "../config";
import { contenuService } from "./contenuService";

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
   * Récupère tous les modules avec leurs informations de formation
   * 
   * @returns {Promise<Array>} - Liste des modules avec formation info
   */
  getAllModules: async () => {
    try {
      const response = await API.get("/api/admin/formations/all-modules");
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

      const response = await API.put(`/api/admin/formations/modules/${moduleId}`, modulePayload);
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
            await contenuService.deleteFile(support.lien);
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
  }
};
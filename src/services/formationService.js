import axios from "axios";
import { API_URL } from "../config";
import { ModuleReorderRequest, ModuleReorderResponse } from "../types/moduleTypes";

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
  // ======== ADMIN ENDPOINTS (existing) ========
  
  /**
   * Récupère toutes les formations (admin)
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
   * Récupère toutes les formations avec leur nombre de modules (admin)
   */
  getAllFormationsSummary: async () => {
    try {
      const response = await API.get("/api/admin/formations/with-module-count");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des formations:", error);
      throw error;
    }
  },

  /**
   * Récupère une formation par son ID (admin)
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
   * Crée une nouvelle formation (admin)
   */
  createFormation: async (formationData) => {
    try {
      if (!formationData.imageFile) {
        throw new Error("L'image est obligatoire pour créer une formation");
      }

      const formData = new FormData();
      
      const formationObject = {
        titre: formationData.titre,
        description: formationData.description,
        type: formationData.type
      };
      
      const formationBlob = new Blob(
        [JSON.stringify(formationObject)], 
        { type: 'application/json' }
      );
      
      formData.append('formation', formationBlob);
      formData.append('image', formationData.imageFile);
      
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/api/admin/formations`, {
        method: 'POST',
        body: formData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Met à jour une formation existante (admin)
   */
  updateFormation: async (id, formationData) => {
    try {
      if (formationData.imageFile) {
        const formationObject = {
          titre: formationData.titre,
          description: formationData.description,
          type: formationData.type
        };
        
        const formData = new FormData();
        const formationBlob = new Blob(
          [JSON.stringify(formationObject)], 
          { type: 'application/json' }
        );
        
        formData.append('formation', formationBlob);
        formData.append('image', formationData.imageFile);
        
        const token = localStorage.getItem("token");
        
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
        const formationJson = {
          titre: formationData.titre,
          description: formationData.description,
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
   * Supprime une formation (admin)
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

  // ======== COLLABORATOR ENDPOINTS (new) ========

  /**
   * Récupère les formations assignées à l'utilisateur connecté
   */
  getAssignedFormations: async () => {
    try {
      // Get current user data to extract collaborateur ID
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const collaborateurId = userData.id;
      
      if (!collaborateurId) {
        throw new Error("Collaborateur ID not found");
      }

      const response = await API.get(`/api/collaborateur/formations/mes-formations/${collaborateurId}`);
      
      // Transform the response to match frontend expectations
      const transformedData = response.data.map(inscription => ({
        id: inscription.formationId,
        title: inscription.formationTitre,
        description: inscription.formationDescription,
        type: inscription.formationType || 'standard',
        duration: inscription.formationDuree || 0,
        lienPhoto: inscription.formationLienPhoto,
        progress: Math.round(parseFloat(inscription.progress || 0)),
        completedModules: inscription.completedModules || 0,
        totalModules: inscription.totalModules || 0,
        completedDate: inscription.dateCompletion,
        isCompleted: inscription.completed || parseFloat(inscription.progress || 0) >= 100
      }));

      return transformedData;
    } catch (error) {
      console.error("Erreur lors de la récupération des formations assignées:", error);
      throw error;
    }
  },

  /**
   * Récupère une formation par son ID (collaborateur)
   */
  getCollaboratorFormationById: async (id) => {
    try {
      const response = await API.get(`/api/collaborateur/formations/${id}`);
      
      // Transform response to match frontend expectations
      const formation = response.data;
      return {
        id: formation.id,
        title: formation.titre,
        description: formation.description,
        type: formation.type,
        duration: formation.duree || 0,
        lienPhoto: formation.lienPhoto
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération de la formation ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les modules d'une formation (collaborateur)
   */
  getFormationModules: async (formationId) => {
    try {
      const response = await API.get(`/api/collaborateur/formations/${formationId}/modules`);
      
      // Transform response to match frontend expectations
      return response.data.map(module => ({
        id: module.id,
        title: module.titre,
        description: module.description,
        ordre: module.ordre
      }));
    } catch (error) {
      console.error(`Erreur lors de la récupération des modules de la formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les détails complets d'une formation avec modules, supports et quizzes (collaborateur)
   */
  getFormationWithDetails: async (formationId) => {
    try {
      // Get basic formation info
      const formation = await formationService.getCollaboratorFormationById(formationId);
      
      // Get modules for this formation
      const modules = await formationService.getFormationModules(formationId);
      
      // Get supports and quizzes for each module
      const modulesWithDetails = await Promise.all(
        modules.map(async (module) => {
          try {
            // Get module details with supports (which already includes quizs)
            const moduleDetails = await formationService.getModuleById(formationId, module.id);
            
            // Enhance quiz data with full question details if available
            let enhancedQuizs = moduleDetails.quizs || [];
            if (enhancedQuizs.length > 0) {
              try {
                // Get full quiz details with questions for each quiz
                enhancedQuizs = await Promise.all(
                  enhancedQuizs.map(async (quiz) => {
                    try {
                      const quizResponse = await API.get(`/api/collaborateur/formations/quizzes/${quiz.id}`);
                      return {
                        ...quiz,
                        questions: quizResponse.data.questions?.map(question => ({
                          id: question.id,
                          contenu: question.contenu,
                          choix: question.choix?.map(choice => ({
                            id: choice.id,
                            contenu: choice.contenu,
                            estCorrect: choice.estCorrect
                          })) || []
                        })) || []
                      };
                    } catch (quizError) {
                      console.warn(`Error fetching details for quiz ${quiz.id}:`, quizError);
                      return quiz; // Return basic quiz info if details fail
                    }
                  })
                );
              } catch (quizError) {
                console.warn(`Error enhancing quiz data for module ${module.id}:`, quizError);
              }
            }
            
            return {
              ...moduleDetails,
              quizs: enhancedQuizs
            };
          } catch (moduleError) {
            console.error(`Error fetching details for module ${module.id}:`, moduleError);
            return module; // Return basic module info if details fail
          }
        })
      );
      
      return {
        ...formation,
        modules: modulesWithDetails
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération des détails complets de la formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les modules d'une formation (collaborateur)
   */
  getFormationModules: async (formationId) => {
    try {
      const response = await API.get(`/api/collaborateur/formations/${formationId}/modules`);
      
      return response.data.map(module => ({
        id: module.id,
        title: module.titre,
        description: module.description,
        ordre: module.ordre,
        contents: module.supports?.map(support => ({
          id: support.id,
          title: support.titre,
          description: support.description,
          type: support.type,
          url: support.lien,
          duration: support.duree
        })) || []
      }));
    } catch (error) {
      console.error(`Erreur lors de la récupération des modules de la formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère un module par son ID (collaborateur)
   */
  getModuleById: async (formationId, moduleId) => {
    try {
      console.log(`🔍 Fetching module ${moduleId} details...`);
      const response = await API.get(`/api/collaborateur/formations/modules/${moduleId}`);
      const module = response.data;
      console.log(`✅ Module ${moduleId} basic info:`, module);
      
      // Get supports for this module
      let supports = [];
      try {
        console.log(`🔍 Fetching supports for module ${moduleId}...`);
        const supportsResponse = await API.get(`/api/collaborateur/formations/modules/${moduleId}/supports`);
        console.log(`✅ Supports response for module ${moduleId}:`, supportsResponse.data);
        
        supports = supportsResponse.data.map(support => ({
          id: support.id,
          title: support.titre,
          description: support.description,
          type: support.type,
          url: support.lien,
          duration: support.duree,
          downloadUrl: support.downloadUrl || (support.type === 'PDF' ? support.lien : null)
        }));
        
        console.log(`✅ Mapped supports for module ${moduleId}:`, supports);
      } catch (supportsError) {
        console.error(`❌ Error fetching supports for module ${moduleId}:`, supportsError);
        console.error('Response details:', supportsError.response);
      }
      
      return {
        id: module.id,
        title: module.titre,
        description: module.description,
        ordre: module.ordre,
        quizs: module.quizs || [], // Preserve original quizs array
        contents: supports
      };
    } catch (error) {
      console.error(`❌ Error fetching module ${moduleId}:`, error);
      console.error('Response details:', error.response);
      throw error;
    }
  },

  /**
   * Récupère le quiz d'un module (collaborateur)
   */
  getQuiz: async (formationId, moduleId) => {
    try {
      const response = await API.get(`/api/collaborateur/formations/modules/${moduleId}/quizzes`);
      
      if (response.data.length === 0) {
        throw new Error("Aucun quiz trouvé pour ce module");
      }

      // Get the first quiz (assuming one quiz per module)
      const quizId = response.data[0].id;
      const quizResponse = await API.get(`/api/collaborateur/formations/quizzes/${quizId}`);
      
      const quiz = quizResponse.data;
      return {
        id: quiz.id,
        title: quiz.titre,
        questions: quiz.questions?.map(question => ({
          id: question.id,
          text: question.contenu,
          choices: question.choix?.map(choice => ({
            id: choice.id,
            text: choice.contenu,
            isCorrect: choice.estCorrect
          })) || []
        })) || []
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération du quiz du module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Soumet les réponses du quiz (collaborateur)
   */
  submitQuiz: async (formationId, moduleId, answers) => {
    try {
      // Get current user data
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const collaborateurId = userData.id;
      
      if (!collaborateurId) {
        throw new Error("Collaborateur ID not found");
      }

      // Get quiz ID first
      const quizzesResponse = await API.get(`/api/collaborateur/formations/modules/${moduleId}/quizzes`);
      if (quizzesResponse.data.length === 0) {
        throw new Error("Aucun quiz trouvé pour ce module");
      }

      const quizId = quizzesResponse.data[0].id;

      // Transform answers to expected format for the new API
      const transformedAnswers = {};
      Object.keys(answers).forEach(questionId => {
        const answerId = answers[questionId];
        if (answerId !== null) {
          transformedAnswers[parseInt(questionId)] = [parseInt(answerId)];
        }
      });

      // Use the new progress tracking quiz submission endpoint
      const response = await API.post(
        `/api/collaborateur/formations/quizzes/${quizId}/submit?collaborateurId=${collaborateurId}&formationId=${formationId}`,
        transformedAnswers
      );

      // Transform the response to match frontend expectations
      const data = response.data;
      return {
        ...data,
        score: data.correctAnswers, // Map correctAnswers to score
        totalQuestions: data.totalQuestions, // Map totalQuestions
        message: data.resultMessage, // Map resultMessage to message
        passed: data.isPassed, // Map isPassed to passed
        formattedScore: data.formattedScore // Map formattedScore (should already be included in ...data, but being explicit)
      };
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error;
    }
  },

  /**
   * Récupère la progression de l'utilisateur pour une formation (collaborateur)
   */
  getFormationProgress: async (formationId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const collaborateurId = userData.id;
      
      if (!collaborateurId) {
        throw new Error("Collaborateur ID not found");
      }

      // Get user's formations to find progress for this specific formation
      const response = await API.get(`/api/collaborateur/formations/mes-formations/${collaborateurId}`);
      const formations = response.data;
      
      const formation = formations.find(f => f.formationId.toString() === formationId.toString());
      
      if (!formation) {
        return {
          progress: 0,
          completedModules: [],
          totalModules: 0
        };
      }

      return {
        progress: Math.round(parseFloat(formation.progress || 0)),
        completedModules: formation.completedModules || [],
        totalModules: formation.totalModules || 0,
        isCompleted: formation.completed || parseFloat(formation.progress || 0) >= 100
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération de la progression:`, error);
      throw error;
    }
  },

  /**
   * Met à jour la progression de l'utilisateur
   */
  updateProgress: async (formationId, newProgress) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const collaborateurId = userData.id;
      
      if (!collaborateurId) {
        throw new Error("Collaborateur ID not found");
      }

      const response = await API.put(
        `/api/collaborateur/formations/progress/${collaborateurId}/${formationId}`,
        newProgress
      );
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la progression:`, error);
      throw error;
    }
  },

  /**
   * Marque un contenu comme lu (collaborateur)
   */
  markContentAsRead: async (formationId, moduleId, contentId) => {
    try {
      // This would typically update progress
      // For now, we'll simulate it
      return { success: true };
    } catch (error) {
      console.error(`Erreur lors du marquage du contenu comme lu:`, error);
      throw error;
    }
  },

  /**
   * Génère et télécharge le certificat (collaborateur)
   */
  generateCertificate: async (formationId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const collaborateurId = userData.id;
      
      if (!collaborateurId) {
        throw new Error("Collaborateur ID not found");
      }

      const response = await API.get(
        `/api/collaborateur/formations/certificat/${collaborateurId}/${formationId}`,
        { responseType: 'blob' }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la génération du certificat:`, error);
      throw error;
    }
  },

  /**
   * Récupère l'URL de téléchargement d'un support
   */
  getSupportDownloadUrl: async (supportId) => {
    try {
      const response = await API.get(`/api/collaborateur/formations/supports/${supportId}/download`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'URL de téléchargement:`, error);
      throw error;
    }
  },

  // ======== SHARED HELPER METHODS ========

  /**
   * Crée un nouveau module pour une formation (admin)
   */
  createModule: async (formationId, moduleData) => {
    try {
      const response = await API.post(`/api/admin/formations/${formationId}/modules`, moduleData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la création du module pour la formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Met à jour l'affectation d'un module à une formation (admin)
   */
  updateModuleFormation: async (moduleId, formationId) => {
    try {
      const module = await API.get(`/api/admin/modules/${moduleId}`);
      module.data.formationId = formationId;
      
      const response = await API.put(`/api/admin/modules/${moduleId}`, module.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Réorganise l'ordre des modules dans une formation (admin)
   */
  reorderModules: async (formationId, moduleIds) => {
    try {
      // Create and validate the request DTO
      const request = new ModuleReorderRequest(moduleIds);
      const requestData = request.toApiRequest();

      const response = await API.put(`/api/admin/formations/${formationId}/modules/reorder`, requestData);
      
      // Return the response wrapped in our DTO
      return ModuleReorderResponse.fromApiResponse(response.data);
    } catch (error) {
      console.error(`Erreur lors de la réorganisation des modules de la formation ${formationId}:`, error);
      
      // If it's a validation error from our DTO, re-throw it
      if (error.message && error.message.includes("modules")) {
        throw error;
      }
      
      // Otherwise, wrap it in a generic error response
      throw new Error(`Erreur lors de la réorganisation des modules: ${error.response?.data?.error || error.message}`);
    }
  },

  /**
   * Récupère les modules d'une formation dans l'ordre (admin)
   */
  getOrderedModulesByFormation: async (formationId) => {
    try {
      const response = await API.get(`/api/admin/formations/${formationId}/modules/ordered`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des modules ordonnés de la formation ${formationId}:`, error);
      throw error;
    }
  },

  // ======== PROGRESS TRACKING ENDPOINTS ========

  /**
   * Marque un support comme vu par un collaborateur
   */
  markSupportAsSeen: async (supportId, collaborateurId) => {
    try {
      const response = await API.post(`/api/collaborateur/formations/supports/${supportId}/mark-seen/${collaborateurId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking support as seen:', error);
      throw error;
    }
  },

  /**
   * Vérifie si un support a été vu par un collaborateur
   */
  isSupportSeen: async (supportId, collaborateurId) => {
    try {
      const response = await API.get(`/api/collaborateur/formations/supports/${supportId}/is-seen/${collaborateurId}`);
      return response.data.seen; // Extract the boolean value from the response
    } catch (error) {
      console.error('Error checking if support is seen:', error);
      throw error;
    }
  },

  /**
   * Vérifie si un module est débloqué pour un collaborateur (progression séquentielle)
   */
  isModuleUnlocked: async (moduleId, collaborateurId) => {
    try {
      const response = await API.get(`/api/collaborateur/formations/modules/${moduleId}/is-unlocked/${collaborateurId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking module unlock status:', error);
      throw error;
    }
  },

  /**
   * Récupère la progression détaillée d'une formation avec informations sur les modules
   */
  getFormationProgressWithModules: async (formationId, collaborateurId) => {
    try {
      const response = await API.get(`/api/collaborateur/formations/${formationId}/module-progress/${collaborateurId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting formation progress:', error);
      throw error;
    }
  },

  /**
   * Récupère la progression des supports d'un module pour un collaborateur
   */
  getModuleSupportsProgress: async (moduleId, collaborateurId) => {
    try {
      const response = await API.get(`/api/collaborateur/formations/modules/${moduleId}/supports-progress/${collaborateurId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting module supports progress:', error);
      throw error;
    }
  }
};

// Export individual functions for direct import
export const {
  markSupportAsSeen,
  isSupportSeen, 
  isModuleUnlocked,
  getFormationProgressWithModules,
  getModuleSupportsProgress
} = formationService;
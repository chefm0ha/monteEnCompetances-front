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
   * Récupère toutes les formations avec leur nombre de modules
   * 
   * @returns {Promise<Array>} - Liste des formations avec le nombre de modules
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
      if (!formationData.imageFile) {
        throw new Error("L'image est obligatoire pour créer une formation");
      }

      // Create form data
      const formData = new FormData();
      
      // Create formation object
      const formationObject = {
        titre: formationData.titre,
        description: formationData.description,
        type: formationData.type
      };
      
      // Create a Blob with the proper Content-Type
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
   * Met à jour une formation existante
   * 
   * @param {String} id - L'ID de la formation
   * @param {Object} formationData - Les nouvelles données de la formation
   * @returns {Promise<Object>} - La formation mise à jour
   */
  updateFormation: async (id, formationData) => {
    try {
      // Check if we have an image file
      if (formationData.imageFile) {
        // For image uploads, we need to use the Fetch API directly to properly set Content-Type headers
        // for each part of the multipart/form-data request
        
        const formationObject = {
          titre: formationData.titre,
          description: formationData.description,
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
   * Crée un nouveau module pour une formation
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {Object} moduleData - Les données du module
   * @returns {Promise<Object>} - Le module créé
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
   * Met à jour l'affectation d'un module à une formation
   * 
   * @param {String} moduleId - L'ID du module
   * @param {String} formationId - L'ID de la nouvelle formation
   * @returns {Promise<Object>} - Le module mis à jour
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
  }
};
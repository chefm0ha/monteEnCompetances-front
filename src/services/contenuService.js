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

export const contenuService = {
  /**
   * Récupère tous les contenus
   * 
   * @returns {Promise<Array>} - Liste des contenus
   */
  getAllContenus: async () => {
    try {
      const response = await API.get("/api/contenus");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des contenus:", error);
      throw error;
    }
  },

  /**
   * Récupère un contenu par son ID
   * 
   * @param {String} id - L'ID du contenu
   * @returns {Promise<Object>} - Le contenu
   */
  getContenuById: async (id) => {
    try {
      const response = await API.get(`/api/contenus/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du contenu ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau contenu
   * 
   * @param {Object} contenuData - Les données du contenu
   * @returns {Promise<Object>} - Le contenu créé
   */
  createContenu: async (contenuData) => {
    try {
      // Si un fichier est fourni, le télécharger
      if (contenuData.file) {
        let fileUrl = null;
        
        if (contenuData.type === "PDF") {
          const uploadResult = await fileService.uploadPDF(contenuData.file, "contenus");
          fileUrl = uploadResult.fileUrl;
        } else if (contenuData.type === "VIDEO") {
          const uploadResult = await fileService.uploadVideo(contenuData.file, "contenus");
          fileUrl = uploadResult.fileUrl;
        }
        
        // Mise à jour du lien avec l'URL du fichier
        contenuData.lien = fileUrl;
      }
      
      // Supprimer le champ file qui n'est pas nécessaire pour l'API
      const contenuPayload = { ...contenuData };
      delete contenuPayload.file;

      const response = await API.post("/api/contenus", contenuPayload);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du contenu:", error);
      throw error;
    }
  },

  /**
   * Met à jour un contenu existant
   * 
   * @param {String} id - L'ID du contenu
   * @param {Object} contenuData - Les nouvelles données du contenu
   * @returns {Promise<Object>} - Le contenu mis à jour
   */
  updateContenu: async (id, contenuData) => {
    try {
      // Si un fichier est fourni, le télécharger
      if (contenuData.file) {
        let fileUrl = null;
        
        // Récupérer d'abord le contenu pour avoir l'URL de l'ancien fichier
        const oldContenu = await contenuService.getContenuById(id);
        
        // Supprimer l'ancien fichier si nécessaire
        if (oldContenu.lien && oldContenu.type !== "TEXT") {
          await fileService.deleteFile(oldContenu.lien);
        }
        
        if (contenuData.type === "PDF") {
          const uploadResult = await fileService.uploadPDF(contenuData.file, "contenus");
          fileUrl = uploadResult.fileUrl;
        } else if (contenuData.type === "VIDEO") {
          const uploadResult = await fileService.uploadVideo(contenuData.file, "contenus");
          fileUrl = uploadResult.fileUrl;
        }
        
        // Mise à jour du lien avec l'URL du fichier
        contenuData.lien = fileUrl;
      }
      
      // Supprimer le champ file qui n'est pas nécessaire pour l'API
      const contenuPayload = { ...contenuData };
      delete contenuPayload.file;

      const response = await API.put(`/api/contenus/${id}`, contenuPayload);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du contenu ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un contenu
   * 
   * @param {String} id - L'ID du contenu
   * @returns {Promise<boolean>} - true si le contenu a été supprimé
   */
  deleteContenu: async (id) => {
    try {
      // Récupérer d'abord le contenu pour avoir l'URL du fichier
      const contenu = await contenuService.getContenuById(id);
      
      // Supprimer le contenu
      const response = await API.delete(`/api/contenus/${id}`);
      
      // Si le contenu avait un fichier, le supprimer également
      if (contenu.lien && contenu.type !== "TEXT") {
        await fileService.deleteFile(contenu.lien);
      }
      
      return response.data.success;
    } catch (error) {
      console.error(`Erreur lors de la suppression du contenu ${id}:`, error);
      throw error;
    }
  },

  /**
   * Marque un contenu comme consulté
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {String} moduleId - L'ID du module
   * @param {String} contenuId - L'ID du contenu
   * @returns {Promise<Object>} - La progression mise à jour
   */
  markAsViewed: async (formationId, moduleId, contenuId) => {
    try {
      const response = await API.post(`/api/formations/${formationId}/modules/${moduleId}/contenus/${contenuId}/view`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du marquage du contenu ${contenuId} comme consulté:`, error);
      throw error;
    }
  },

  /**
   * Télécharge un fichier de contenu
   * 
   * @param {String} contenuId - L'ID du contenu
   * @returns {Promise<Blob>} - Le fichier
   */
  downloadFile: async (contenuId) => {
    try {
      // Récupérer d'abord le contenu pour avoir l'URL du fichier
      const contenu = await contenuService.getContenuById(contenuId);
      
      if (!contenu.lien || contenu.type === "TEXT") {
        throw new Error("Ce contenu n'a pas de fichier à télécharger");
      }
      
      const response = await axios.get(contenu.lien, {
        responseType: "blob",
      });
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du téléchargement du fichier du contenu ${contenuId}:`, error);
      throw error;
    }
  },

  /**
   * Télécharge un fichier et déclenche le téléchargement dans le navigateur
   * 
   * @param {String} contenuId - L'ID du contenu
   * @param {String} fileName - Le nom du fichier à sauvegarder
   * @returns {Promise<void>}
   */
  downloadAndSaveFile: async (contenuId, fileName = null) => {
    try {
      // Récupérer d'abord le contenu pour avoir l'URL du fichier
      const contenu = await contenuService.getContenuById(contenuId);
      
      if (!contenu.lien || contenu.type === "TEXT") {
        throw new Error("Ce contenu n'a pas de fichier à télécharger");
      }
      
      // Déterminer le nom du fichier
      const defaultFileName = contenu.type === "PDF" 
        ? `${contenu.titre.replace(/\s+/g, "_")}.pdf`
        : `${contenu.titre.replace(/\s+/g, "_")}.mp4`;
      
      // Télécharger et sauvegarder le fichier
      await fileService.downloadFile(contenu.lien, fileName || defaultFileName);
    } catch (error) {
      console.error(`Erreur lors du téléchargement du fichier du contenu ${contenuId}:`, error);
      throw error;
    }
  },

  /**
   * Upload d'un fichier pour un contenu
   * 
   * @param {File} file - Le fichier à uploader
   * @param {String} type - Le type de contenu (PDF, VIDEO)
   * @returns {Promise<Object>} - Les informations sur le fichier uploadé
   */
  uploadFile: async (file, type = "PDF") => {
    try {
      let result;
      
      if (type === "PDF") {
        result = await fileService.uploadPDF(file, "contenus");
      } else if (type === "VIDEO") {
        result = await fileService.uploadVideo(file, "contenus");
      } else {
        throw new Error(`Type de fichier non supporté: ${type}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Erreur lors de l'upload du fichier:`, error);
      throw error;
    }
  }
};
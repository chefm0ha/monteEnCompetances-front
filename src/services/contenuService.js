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

export const contenuService = {

  /**
   * Crée un nouveau contenu
   * 
   * @param {Object} contenuData - Les données du contenu (titre, description, type, duree, lien, file)
   * @returns {Promise<Object>} - Le contenu créé
   */
  createContenu: async (contenuData) => {
    try {
      if (!contenuData.file) {
        throw new Error("Le fichier est obligatoire pour créer un contenu");
      }
      
      // Créer un FormData pour pouvoir envoyer le fichier avec les autres données
      const formData = new FormData();
      
      // Créer l'objet support JSON
      const supportData = {
        titre: contenuData.titre || "",
        description: contenuData.description || "",
        type: contenuData.type || "PDF",
        duree: contenuData.duree || 0,
        lien: contenuData.lien || ""
      };
      
      // Ajouter l'objet support en tant que blob JSON avec le type correct
      const supportBlob = new Blob([JSON.stringify(supportData)], {
        type: 'application/json'
      });
      formData.append("support", supportBlob);
      
      // Ajouter le fichier
      formData.append("file", contenuData.file);
      
      // Utiliser le bon endpoint pour ajouter un support à un module
      const moduleId = contenuData.moduleId;
      
      // S'assurer que le header Content-Type est correctement supprimé pour laisser le navigateur définir la boundary
      const response = await API.post(`/api/admin/formations/modules/${moduleId}/supports`, formData, {
        headers: {
          // Supprimer le type de contenu pour que le navigateur puisse définir le boundary correctement
          "Content-Type": undefined
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du contenu:", error);
      throw error;
    }
  },

  /**
   * Modifie un support existant
   * 
   * @param {String} supportId - L'ID du support à modifier
   * @param {Object} supportData - Les données du support à mettre à jour
   * @param {File} [file] - Nouveau fichier optionnel
   * @returns {Promise<Object>} - Le support modifié
   */
  updateContenu: async (supportId, supportData, file = null) => {
    try {
      // Créer un FormData pour pouvoir envoyer les données
      const formData = new FormData();
      
      // Créer l'objet support JSON
      const supportObj = {
        titre: supportData.titre || "",
        description: supportData.description || "",
        type: supportData.type || "PDF",
        duree: supportData.duree || 0,
        lien: supportData.lien || ""
      };
      
      // Ajouter l'objet support en tant que blob JSON
      const supportBlob = new Blob([JSON.stringify(supportObj)], {
        type: 'application/json'
      });
      formData.append("support", supportBlob);
      
      // Ajouter le fichier si fourni
      if (file) {
        formData.append("file", file);
      }
      
      // Envoyer la requête de mise à jour
      const response = await API.put(`/api/admin/formations/supports/${supportId}`, formData, {
        headers: {
          // Laisser le navigateur définir le boundary correctement
          "Content-Type": undefined
        },
      });
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la modification du support ${supportId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un contenu/support par son ID
   * 
   * @param {String} supportId - L'ID du support à supprimer
   * @returns {Promise<boolean>} - true si le support a été supprimé
   */
  deleteSupport: async (supportId) => {
    try {
      // Use the correct API endpoint format
      const response = await API.delete(`/api/admin/formations/supports/${supportId}`);
      
      return response.data.success;
    } catch (error) {
      console.error(`Erreur lors de la suppression du support ${supportId}:`, error);
      throw error;
    }
  },
};
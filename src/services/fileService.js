import axios from "axios";
import { API_URL } from "../config";

// Create axios instance with base configuration
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
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

export const fileService = {
  /**
   * Télécharge un fichier sur le serveur via Cloudinary
   * 
   * @param {File} file - Le fichier à télécharger
   * @param {String} type - Le type de fichier (image, pdf, video)
   * @param {String} folder - Le dossier de destination (formations, modules, supports)
   * @returns {Promise<Object>} - Les informations sur le fichier téléchargé
   */
  uploadFile: async (file, type = "document", folder = "general") => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("folder", folder);

      const response = await API.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier:", error);
      throw error;
    }
  },

  /**
   * Télécharge une image sur le serveur via Cloudinary
   * 
   * @param {File} imageFile - L'image à télécharger
   * @param {String} folder - Le dossier de destination
   * @returns {Promise<Object>} - Les informations sur l'image téléchargée
   */
  uploadImage: async (imageFile, folder = "formations") => {
    try {
      // Vérifier que le fichier est bien une image
      if (!imageFile.type.startsWith("image/")) {
        throw new Error("Le fichier doit être une image");
      }

      return await fileService.uploadFile(imageFile, "image", folder);
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image:", error);
      throw error;
    }
  },

  /**
   * Télécharge un document PDF sur le serveur via Cloudinary
   * 
   * @param {File} pdfFile - Le document PDF à télécharger
   * @param {String} folder - Le dossier de destination
   * @returns {Promise<Object>} - Les informations sur le document téléchargé
   */
  uploadPDF: async (pdfFile, folder = "supports") => {
    try {
      // Vérifier que le fichier est bien un PDF
      if (pdfFile.type !== "application/pdf") {
        throw new Error("Le fichier doit être au format PDF");
      }

      return await fileService.uploadFile(pdfFile, "pdf", folder);
    } catch (error) {
      console.error("Erreur lors du téléchargement du PDF:", error);
      throw error;
    }
  },

  /**
   * Télécharge une vidéo sur le serveur via Cloudinary
   * 
   * @param {File} videoFile - La vidéo à télécharger
   * @param {String} folder - Le dossier de destination
   * @returns {Promise<Object>} - Les informations sur la vidéo téléchargée
   */
  uploadVideo: async (videoFile, folder = "supports") => {
    try {
      // Vérifier que le fichier est bien une vidéo
      if (!videoFile.type.startsWith("video/")) {
        throw new Error("Le fichier doit être une vidéo");
      }

      return await fileService.uploadFile(videoFile, "video", folder);
    } catch (error) {
      console.error("Erreur lors du téléchargement de la vidéo:", error);
      throw error;
    }
  },

  /**
   * Supprime un fichier de Cloudinary
   * 
   * @param {String} fileUrl - L'URL du fichier à supprimer
   * @returns {Promise<boolean>} - true si le fichier a été supprimé
   */
  deleteFile: async (fileUrl) => {
    try {
      const response = await API.delete("/api/upload", {
        params: { fileUrl }
      });
      return response.status === 200;
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier:", error);
      throw error;
    }
  },

  /**
   * Télécharge un fichier depuis le serveur
   * 
   * @param {String} fileUrl - L'URL du fichier à télécharger
   * @param {String} fileName - Le nom du fichier à télécharger
   * @returns {Promise<void>}
   */
  downloadFile: async (fileUrl, fileName) => {
    try {
      const response = await axios.get(fileUrl, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier:", error);
      throw error;
    }
  },
};
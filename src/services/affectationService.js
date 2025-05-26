// src/services/affectationService.js
import axios from "axios"
import { API_URL } from "../config"

// Create axios instance with base configuration
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
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

export const affectationService = {
  /**
   * Récupère tous les participants d'une formation
   * 
   * @param {String} formationId - L'ID de la formation
   * @returns {Promise<Array>} - Liste des participants
   */
  getFormationParticipants: async (formationId) => {
    try {
      const response = await API.get(`/api/admin/formations/${formationId}/participants`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération des participants de la formation ${formationId}:`, error)
      throw error
    }
  },

  /**
   * Affecte un collaborateur à une formation
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {String} collaborateurId - L'ID du collaborateur
   * @returns {Promise<Object>} - Réponse de l'affectation
   */
  assignCollaborateurToFormation: async (formationId, collaborateurId) => {
    try {
      const response = await API.post(`/api/admin/formations/${formationId}/participants/${collaborateurId}`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de l'affectation du collaborateur ${collaborateurId} à la formation ${formationId}:`, error)
      throw error
    }
  },

  /**
   * Retire un collaborateur d'une formation
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {String} collaborateurId - L'ID du collaborateur
   * @returns {Promise<boolean>} - true si la suppression a réussi
   */
  removeCollaborateurFromFormation: async (formationId, collaborateurId) => {
    try {
      const response = await API.delete(`/api/admin/formations/${formationId}/participants/${collaborateurId}`)
      return response.status === 200 || response.status === 204
    } catch (error) {
      console.error(`Erreur lors de la suppression du collaborateur ${collaborateurId} de la formation ${formationId}:`, error)
      throw error
    }
  },

  /**
   * Affecte plusieurs collaborateurs à une formation
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {Array} collaborateurIds - Liste des IDs des collaborateurs
   * @returns {Promise<Object>} - Résultats des affectations
   */
  assignMultipleCollaborateursToFormation: async (formationId, collaborateurIds) => {
    try {
      const promises = collaborateurIds.map(collaborateurId => 
        affectationService.assignCollaborateurToFormation(formationId, collaborateurId)
      )
      
      const results = await Promise.allSettled(promises)
      
      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.filter(result => result.status === 'rejected').length
      
      return {
        successful,
        failed,
        total: collaborateurIds.length,
        results
      }
    } catch (error) {
      console.error(`Erreur lors de l'affectation multiple à la formation ${formationId}:`, error)
      throw error
    }
  },

  /**
   * Retire plusieurs collaborateurs d'une formation
   * 
   * @param {String} formationId - L'ID de la formation
   * @param {Array} collaborateurIds - Liste des IDs des collaborateurs
   * @returns {Promise<Object>} - Résultats des suppressions
   */
  removeMultipleCollaborateursFromFormation: async (formationId, collaborateurIds) => {
    try {
      const promises = collaborateurIds.map(collaborateurId => 
        affectationService.removeCollaborateurFromFormation(formationId, collaborateurId)
      )
      
      const results = await Promise.allSettled(promises)
      
      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.filter(result => result.status === 'rejected').length
      
      return {
        successful,
        failed,
        total: collaborateurIds.length,
        results
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression multiple de la formation ${formationId}:`, error)
      throw error
    }
  }
}
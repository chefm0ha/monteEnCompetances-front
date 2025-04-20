import axios from "axios"
import { API_URL } from "../config"

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

export const collaborateurService = {
  // Obtenir tous les collaborateurs
  getAllCollaborateurs: async () => {
    try {
      const response = await API.get("/collaborateurs")
      return response.data
    } catch (error) {
      console.error("Error fetching collaborateurs:", error)
      throw error
    }
  },

  // Obtenir un collaborateur par ID
  getCollaborateurById: async (id) => {
    try {
      const response = await API.get(`/collaborateurs/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching collaborateur with ID ${id}:`, error)
      throw error
    }
  },

  // Créer un nouveau collaborateur
  createCollaborateur: async (collaborateurData) => {
    try {
      const response = await API.post("/collaborateurs", collaborateurData)
      return response.data
    } catch (error) {
      console.error("Error creating collaborateur:", error)
      throw error
    }
  },

  // Mettre à jour un collaborateur
  updateCollaborateur: async (id, collaborateurData) => {
    try {
      const response = await API.put(`/collaborateurs/${id}`, collaborateurData)
      return response.data
    } catch (error) {
      console.error(`Error updating collaborateur with ID ${id}:`, error)
      throw error
    }
  },

  // Supprimer un collaborateur
  deleteCollaborateur: async (id) => {
    try {
      const response = await API.delete(`/collaborateurs/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting collaborateur with ID ${id}:`, error)
      throw error
    }
  },

  // Obtenir les collaborateurs par poste
  getCollaborateursByPoste: async (poste) => {
    try {
      const response = await API.get(`/collaborateurs/poste/${poste}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching collaborateurs with poste ${poste}:`, error)
      throw error
    }
  },

  // Obtenir un collaborateur par email
  getCollaborateurByEmail: async (email) => {
    try {
      const response = await API.get(`/collaborateurs/email/${email}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching collaborateur with email ${email}:`, error)
      throw error
    }
  },

  // Obtenir des statistiques sur les collaborateurs (pour le tableau de bord admin)
  getCollaborateursStats: async () => {
    try {
      // Cette fonction pourrait appeler un endpoint spécifique pour les statistiques
      // ou calculer les statistiques à partir des données des collaborateurs
      const collaborateurs = await collaborateurService.getAllCollaborateurs()

      // Exemple de statistiques calculées côté client
      const totalCollaborateurs = collaborateurs.length
      const postes = {}
      const departements = {}

      collaborateurs.forEach((collab) => {
        // Compter par poste
        if (collab.poste) {
          postes[collab.poste] = (postes[collab.poste] || 0) + 1
        }

        // Compter par département
        if (collab.departement) {
          departements[collab.departement] = (departements[collab.departement] || 0) + 1
        }
      })

      return {
        totalCollaborateurs,
        postes,
        departements,
        collaborateursRecents: collaborateurs.slice(0, 5), // 5 derniers collaborateurs
      }
    } catch (error) {
      console.error("Error fetching collaborateurs statistics:", error)
      // Retourner des données fictives en cas d'erreur pour le développement
      return {
        totalCollaborateurs: 42,
        postes: {
          Développeur: 15,
          Designer: 8,
          "Chef de projet": 6,
          Marketing: 7,
          RH: 3,
          Autre: 3,
        },
        departements: {
          IT: 23,
          Marketing: 7,
          RH: 3,
          Finance: 5,
          Autre: 4,
        },
        collaborateursRecents: [
          {
            id: 1,
            firstName: "Jean",
            lastName: "Dupont",
            email: "jean.dupont@example.com",
            poste: "Développeur",
            departement: "IT",
          },
          {
            id: 2,
            firstName: "Marie",
            lastName: "Martin",
            email: "marie.martin@example.com",
            poste: "Designer",
            departement: "IT",
          },
          {
            id: 3,
            firstName: "Pierre",
            lastName: "Durand",
            email: "pierre.durand@example.com",
            poste: "Chef de projet",
            departement: "IT",
          },
          {
            id: 4,
            firstName: "Sophie",
            lastName: "Lefebvre",
            email: "sophie.lefebvre@example.com",
            poste: "Marketing",
            departement: "Marketing",
          },
          {
            id: 5,
            firstName: "Thomas",
            lastName: "Moreau",
            email: "thomas.moreau@example.com",
            poste: "RH",
            departement: "RH",
          },
        ],
      }
    }
  },
}

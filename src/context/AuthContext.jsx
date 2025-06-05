"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { jwtDecode } from "jwt-decode"
import { authService } from "../services/authService"

const AuthContext = createContext({
  currentUser: null,
  loading: false,
  error: null,
  login: () => {},
  logout: () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decodedToken = jwtDecode(token)
        const currentTime = Date.now() / 1000

        if (decodedToken.exp < currentTime) {
          // Token expired
          logout()
        } else {
          // Valid token, fetch user data
          fetchUserData(token)
        }
      } catch (error) {
        logout()
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserData = async (token) => {
    try {
      // Si nous avons déjà les données utilisateur dans le localStorage, utilisons-les
      const storedUserData = localStorage.getItem("userData")
      if (storedUserData) {
        const userData = JSON.parse(storedUserData)
        
        // Ensure the user data has the required ID field
        if (userData && userData.id) {
          setCurrentUser(userData)
          setLoading(false)
          return
        } else {
          // Clear invalid stored data
          localStorage.removeItem("userData")
        }
      }

      // Sinon, essayons de récupérer les données utilisateur depuis l'API
      const userData = await authService.getCurrentUser(token)
      
      // Ensure the API response has the required ID field
      if (userData && userData.id) {
        // Store the complete user data
        localStorage.setItem("userData", JSON.stringify(userData))
        setCurrentUser(userData)
      } else {
        setError("Invalid user data received from server")
        logout()
        return
      }
      
      setLoading(false)
    } catch (error) {
      setError("Failed to fetch user data")
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await authService.login(email, password)

      // Extraire le token et les données utilisateur de la réponse
      const { token, userDTO } = response

      // Vérifier que nous avons bien reçu un ID utilisateur
      if (!userDTO || !userDTO.id) {
        setError("Invalid response from server - missing user identification")
        return false
      }

      // Stocker le token dans localStorage
      localStorage.setItem("token", token)

      // Stocker les données utilisateur dans localStorage pour éviter des appels API supplémentaires
      // Ensure we store the complete userDTO with the ID
      const userDataToStore = {
        id: userDTO.id,
        email: userDTO.email,
        firstName: userDTO.firstName,
        lastName: userDTO.lastName,
        role: userDTO.role,
        poste: userDTO.poste || null,
        // Include any other fields that might be present
        ...userDTO
      }
      
      localStorage.setItem("userData", JSON.stringify(userDataToStore))

      // Mettre à jour l'état avec les données utilisateur
      setCurrentUser(userDataToStore)

      return true
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please check your credentials.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userData")
    setCurrentUser(null)
    setError(null)
  }

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
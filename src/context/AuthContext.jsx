"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { jwtDecode } from "jwt-decode"
import { authService } from "../services/authService"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

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
          console.log("Token expired, logging out")
          logout()
        } else {
          // Valid token, fetch user data
          console.log("Valid token found, fetching user data")
          fetchUserData(token)
        }
      } catch (error) {
        console.error("Invalid token:", error)
        logout()
      }
    } else {
      console.log("No token found")
      setLoading(false)
    }
  }, [])

  const fetchUserData = async (token) => {
    try {
      // Si nous avons déjà les données utilisateur dans le localStorage, utilisons-les
      const storedUserData = localStorage.getItem("userData")
      if (storedUserData) {
        const userData = JSON.parse(storedUserData)
        console.log("📱 Loading user from localStorage:", userData)
        
        // Ensure the user data has the required ID field
        if (userData && userData.id) {
          setCurrentUser(userData)
          setLoading(false)
          return
        } else {
          console.warn("⚠️ Stored user data missing ID, fetching from API")
          // Clear invalid stored data
          localStorage.removeItem("userData")
        }
      }

      // Sinon, essayons de récupérer les données utilisateur depuis l'API
      const userData = await authService.getCurrentUser(token)
      console.log("📱 Fetched user from API:", userData)
      
      // Ensure the API response has the required ID field
      if (userData && userData.id) {
        // Store the complete user data
        localStorage.setItem("userData", JSON.stringify(userData))
        setCurrentUser(userData)
      } else {
        console.error("❌ API response missing user ID:", userData)
        setError("Invalid user data received from server")
        logout()
        return
      }
      
      setLoading(false)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to fetch user data")
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      console.log("Attempting login with:", { email })
      const response = await authService.login(email, password)
      console.log("Login response:", response)

      // Extraire le token et les données utilisateur de la réponse
      const { token, userDTO } = response

      // Vérifier que nous avons bien reçu un ID utilisateur
      if (!userDTO || !userDTO.id) {
        console.error("❌ Login response missing user ID:", response)
        setError("Invalid response from server - missing user identification")
        return false
      }

      console.log("✅ User ID received:", userDTO.id, "Type:", typeof userDTO.id)

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
      
      console.log("💾 Storing user data:", userDataToStore)
      localStorage.setItem("userData", JSON.stringify(userDataToStore))

      // Mettre à jour l'état avec les données utilisateur
      setCurrentUser(userDataToStore)

      return true
    } catch (error) {
      console.error("Login error:", error)
      setError(error.response?.data?.message || "Login failed. Please check your credentials.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log("🚪 Logging out user")
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
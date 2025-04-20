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
        setCurrentUser(JSON.parse(storedUserData))
        setLoading(false)
        return
      }

      // Sinon, essayons de récupérer les données utilisateur depuis l'API
      const userData = await authService.getCurrentUser(token)
      setCurrentUser(userData)
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

      // Stocker le token dans localStorage
      localStorage.setItem("token", token)

      // Stocker les données utilisateur dans localStorage pour éviter des appels API supplémentaires
      localStorage.setItem("userData", JSON.stringify(userDTO))

      // Mettre à jour l'état avec les données utilisateur
      setCurrentUser(userDTO)

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
    localStorage.removeItem("token")
    localStorage.removeItem("userData")
    setCurrentUser(null)
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

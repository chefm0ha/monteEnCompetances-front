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
          logout()
        } else {
          // Valid token, fetch user data
          fetchUserData(token)
        }
      } catch (error) {
        console.error("Invalid token:", error)
        logout()
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserData = async (token) => {
    try {
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
      const { token, user } = await authService.login(email, password)
      localStorage.setItem("token", token)
      setCurrentUser(user)
      setError(null)
      return true
    } catch (error) {
      setError(error.response?.data?.message || "Login failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
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


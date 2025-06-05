// src/components/shared/ProtectedRoute.jsx
"use client"

import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Layout from "./Layout"
import LoadingScreen from "./LoadingScreen"

const ProtectedRoute = () => {
  // Add a try-catch to handle potential errors with useAuth()
  let authData = { currentUser: null, loading: true };
  try {
    authData = useAuth() || { currentUser: null, loading: true };
  } catch (error) {
    console.error("Error using AuthContext:", error);
  }
  
  const { currentUser, loading } = authData;
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Handle dashboard route redirect based on role
  if (location.pathname === "/dashboard") {
    if (currentUser.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />
    }
    // For COLLABORATEUR, stay on /dashboard (handled by UserRoute)
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default ProtectedRoute
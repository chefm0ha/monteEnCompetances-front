"use client"

import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import LoadingScreen from "./LoadingScreen"

const UserRoute = () => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  // Redirect admins to admin dashboard
  if (currentUser?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />
  }
  // Allow only collaborateurs
  if (!currentUser || currentUser.role !== "COLLABORATEUR") {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default UserRoute 
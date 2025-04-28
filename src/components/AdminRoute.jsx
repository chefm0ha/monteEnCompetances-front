// src/components/AdminRoute.jsx
"use client"

import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import LoadingScreen from "./LoadingScreen"

const AdminRoute = () => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!currentUser || currentUser.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default AdminRoute
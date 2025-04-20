"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Home, BookOpen, User, LogOut, Menu, X, Users, BarChart } from "lucide-react"
import { APP_SETTINGS } from "../config"

const Layout = ({ children }) => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isAdmin = currentUser?.role === "ADMIN"

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <img src={APP_SETTINGS.logoUrl || "/placeholder.svg"} alt={APP_SETTINGS.appName} className="h-8" />
            <span className="ml-2 text-xl font-semibold">{APP_SETTINGS.appName}</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {isAdmin ? (
                <>
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate("/admin/dashboard")}
                    >
                      <BarChart className="mr-2 h-5 w-5" />
                      Tableau de bord admin
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate("/admin/collaborateurs")}
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Gestion collaborateurs
                    </Button>
                  </li>
                  <li className="pt-2 border-t">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
                      <Home className="mr-2 h-5 w-5" />
                      Vue collaborateur
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
                      <Home className="mr-2 h-5 w-5" />
                      Tableau de bord
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
                      <BookOpen className="mr-2 h-5 w-5" />
                      Mes formations
                    </Button>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* User profile */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={currentUser?.avatar || APP_SETTINGS.defaultAvatarUrl} />
                    <AvatarFallback>{currentUser?.firstName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </span>
                    <span className="text-xs text-gray-500">{currentUser?.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                    <BarChart className="mr-2 h-4 w-4" />
                    Administration
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto md:ml-64">
        <main className="container mx-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" onClick={toggleSidebar} />}
    </div>
  )
}

export default Layout

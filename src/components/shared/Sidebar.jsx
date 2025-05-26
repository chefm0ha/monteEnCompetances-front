// src/components/shared/Sidebar.jsx
"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useSidebar } from "../../context/SidebarContext"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { 
  Home, 
  BarChart, 
  Users, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  FolderOpen,
  FileText
} from "lucide-react"
import { APP_SETTINGS } from "../../config"
import { cn } from "../../lib/utils"

const Sidebar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Use sidebar context instead of local state
  const { collapsed, toggleSidebar } = useSidebar()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isAdmin = currentUser?.role === "ADMIN"
  
  const menuItems = [
    ...(isAdmin ? [
      {
        icon: <BarChart className="h-5 w-5" />,
        label: "Tableau de bord",
        path: "/admin/dashboard",
        adminOnly: true
      },
      {
        icon: <Users className="h-5 w-5" />,
        label: "Collaborateurs",
        path: "/admin/collaborateurs",
        adminOnly: true
      },
      {
        icon: <BookOpen className="h-5 w-5" />,
        label: "Formations",
        path: "/admin/formations",
        adminOnly: true
      },
      {
        icon: <FolderOpen className="h-5 w-5" />,
        label: "Modules",
        path: "/admin/modules",
        adminOnly: true
      }
    ] : [
      {
        icon: <Home className="h-5 w-5" />,
        label: "Tableau de bord",
        path: "/dashboard",
        adminOnly: false
      }
    ])
  ]

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-40 flex flex-col bg-white shadow-lg transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo and toggle button */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <img 
            src={APP_SETTINGS.logoUrl || "/placeholder.svg"} 
            alt="Logo" 
            className="h-8 w-8"
          />
          {!collapsed && (
            <span className="ml-2 text-sm font-semibold">Plateforme de Formation</span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Admin badge */}
      {isAdmin && (
        <div className={cn(
          "mx-auto mt-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium",
          collapsed ? "w-12 text-center" : "w-auto"
        )}>
          Admin
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Button
                variant={location.pathname === item.path ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed ? "px-2" : "px-3"
                )}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                {!collapsed && <span className="ml-2">{item.label}</span>}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User profile */}
      <div className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full hover:bg-gray-100 transition-colors cursor-pointer",
                collapsed ? "justify-center px-0" : "justify-start"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.avatar || APP_SETTINGS.defaultAvatarUrl} />
                <AvatarFallback>{currentUser?.firstName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="ml-2 flex flex-col items-start">
                  <span className="text-xs font-medium truncate max-w-[120px]">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </span>
                  <span className="text-xs text-gray-500 truncate max-w-[120px]">{currentUser?.email}</span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-white border shadow-lg rounded-md p-1"
            side="top"
            sideOffset={8}
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-gray-900">
              Mon compte
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 border-gray-200" />
            <DropdownMenuItem 
              onClick={() => navigate("/profile")}
              className="px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-sm cursor-pointer transition-colors flex items-center"
            >
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 border-gray-200" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-sm cursor-pointer transition-colors flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default Sidebar
// src/components/shared/Sidebar.jsx
"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useSidebar } from "../../context/SidebarContext"
import { useTheme } from "../shared/theme-provider"
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
  FileText,
  UserCheck,
  GraduationCap,
  Award
} from "lucide-react"
import { APP_SETTINGS } from "../../config"
import { cn, getThemeLogo } from "../../lib/utils"
import NotificationDropdown from "./NotificationDropdown"

const Sidebar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Use sidebar context instead of local state
  const { collapsed, toggleSidebar } = useSidebar()
  const { theme } = useTheme()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isAdmin = currentUser?.role === "ADMIN"
  const isCollaborateur = currentUser?.role === "COLLABORATEUR"
  
  // Admin menu items
  const adminMenuItems = [
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
    },
    {
      icon: <UserCheck className="h-5 w-5" />,
      label: "Affectation des formations",
      path: "/admin/affectations",
      adminOnly: true
    }
  ]

  // Collaborator menu items
  const collaboratorMenuItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Tableau de bord",
      path: "/dashboard",
      adminOnly: false
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      label: "Mes formations",
      path: "/mes-formations",
      adminOnly: false
    },
    {
      icon: <Award className="h-5 w-5" />,
      label: "Mes certificats",
      path: "/mes-certificats",
      adminOnly: false
    }
  ]

  const menuItems = isAdmin ? adminMenuItems : collaboratorMenuItems

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-40 flex flex-col bg-card shadow-lg transition-all duration-300 border-r border-border",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo, notifications and toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center justify-center flex-1">
          <img 
            src={getThemeLogo(theme)} 
            alt="Logo" 
            className="h-8 w-16"
          />
        </div>
        <div className="flex items-center gap-1">
          {/* Notifications - available for all users */}
          <NotificationDropdown />
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={toggleSidebar}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Role badge */}
      <div className={cn(
        "mx-auto mt-2 px-2 py-1 rounded text-xs font-medium",
        isAdmin ? "bg-primary/10 text-primary" : "bg-green-500/10 text-green-600 dark:text-green-400",
        collapsed ? "w-8 h-8 flex items-center justify-center" : "w-auto"
      )}>
        {collapsed 
          ? (isAdmin ? "A" : "C")
          : (isAdmin ? "Admin" : "Collaborateur")
        }
      </div>

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
      <div className="border-t border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full hover:bg-accent transition-colors cursor-pointer",
                collapsed ? "justify-center px-0" : "justify-start"
              )}
            >
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar || APP_SETTINGS.defaultAvatarUrl} />
                  <AvatarFallback>{currentUser?.firstName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="ml-2 flex flex-col items-start">
                    <span className="text-xs font-medium truncate max-w-[120px]">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">{currentUser?.email}</span>
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56"
            side="top"
            sideOffset={8}
          >
            <DropdownMenuLabel>
              Mon compte
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => navigate("/profile")}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer"
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
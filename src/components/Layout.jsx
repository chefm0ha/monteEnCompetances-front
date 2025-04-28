// src/components/Layout.jsx
"use client"

import Sidebar from "./Sidebar"
import { cn } from "../lib/utils"
import { useSidebar } from "../context/SidebarContext"

const Layout = ({ children }) => {
  // Use the sidebar context
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? "ml-16" : "ml-64"
      )}>
        <main className="container mx-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
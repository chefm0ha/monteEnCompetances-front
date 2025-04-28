// src/context/SidebarContext.jsx
"use client"

import { createContext, useContext, useState, useEffect } from "react"

const SidebarContext = createContext()

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export const SidebarProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setCollapsed(window.innerWidth < 768)
    }
    
    // Initial check
    checkIfMobile()
    
    // Add listener for window resize
    window.addEventListener("resize", checkIfMobile)
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export default SidebarContext
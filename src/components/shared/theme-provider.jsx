"use client"

import { useState, useEffect, createContext, useContext } from "react"

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ defaultTheme = "system", storageKey = "theme", children }) => {
  const [theme, setTheme] = useState(defaultTheme)
  const [preference, setPreference] = useState("system")

  useEffect(() => {
    // Check for explicit theme setting
    const storedTheme = localStorage.getItem(storageKey)
    // Check for theme preference (light, dark, or system)
    const storedPreference = localStorage.getItem(storageKey + "-preference") || "system"
    
    setPreference(storedPreference)
    
    if (storedTheme) {
      // Use the stored theme if available
      setTheme(storedTheme)
    } else if (storedPreference === "system" || defaultTheme === "system") {
      // Apply system preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(systemPrefersDark ? "dark" : "light")
    }
  }, [storageKey, defaultTheme])

  // Add a listener for system preference changes
  useEffect(() => {
    const handleSystemThemeChange = (e) => {
      if (preference === "system") {
        setTheme(e.matches ? "dark" : "light")
      }
    }
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", handleSystemThemeChange)
    
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange)
    }
  }, [preference])

  useEffect(() => {
    // Save the current theme
    localStorage.setItem(storageKey, theme)
    
    // Remove previous theme classes
    document.documentElement.classList.remove("light", "dark")
    
    // Add current theme class
    document.documentElement.classList.add(theme)
    
    // Set data attribute for compatibility
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme, storageKey])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    setPreference(newTheme) // Set preference to match the new theme
    localStorage.setItem(storageKey + "-preference", newTheme)
  }

  const setThemeMode = (newTheme) => {
    if (newTheme === "light" || newTheme === "dark") {
      setTheme(newTheme)
      setPreference(newTheme)
      localStorage.setItem(storageKey + "-preference", newTheme)
    } else if (newTheme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(systemPrefersDark ? "dark" : "light")
      setPreference("system")
      localStorage.setItem(storageKey + "-preference", "system")
    }
  }

  const value = {
    theme,
    preference,
    toggleTheme,
    setTheme: setThemeMode,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}


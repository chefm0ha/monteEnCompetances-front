"use client"

import { useState, useEffect, createContext, useContext } from "react"

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ defaultTheme, storageKey, children }) => {
  const [theme, setTheme] = useState(defaultTheme || "light")

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey)
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, theme)
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme, storageKey])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const value = {
    theme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}


// src/components/shared/ThemeToggle.jsx
"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "../ui/button"
import { useTheme } from "./theme-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

const ThemeToggle = () => {
  const { theme, preference, setTheme } = useTheme()
  
  // Function to update any theme-aware utilities when theme changes
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    
    // Dispatch an event that can be listened to by other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 px-0"
          title="Changer de thème"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Changer de thème</span>
        </Button>
      </DropdownMenuTrigger>      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")} className={preference === "light" ? "bg-accent" : ""}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Clair</span>
          {preference === "light" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")} className={preference === "dark" ? "bg-accent" : ""}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Sombre</span>
          {preference === "dark" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")} className={preference === "system" ? "bg-accent" : ""}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>Système</span>
          {preference === "system" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeToggle

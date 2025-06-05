import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getThemeLogo(theme) {
  return theme === "dark" ? "/logo1.png" : "/logo2.png"
}


import { Loader2 } from "lucide-react"
import { APP_SETTINGS } from "../config"

const LoadingScreen = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
      <img src={APP_SETTINGS.logoUrl || "/placeholder.svg"} alt={APP_SETTINGS.appName} className="h-16 mb-8" />
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-lg text-gray-600">Chargement en cours...</p>
    </div>
  )
}

export default LoadingScreen


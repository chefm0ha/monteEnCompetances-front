import { Loader2 } from "lucide-react"
import { APP_SETTINGS } from "../../config"
import { useTheme } from "./theme-provider"
import { getThemeLogo } from "../../lib/utils"

const LoadingScreen = () => {
  const { theme } = useTheme()
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
      <img src={getThemeLogo(theme)} alt={APP_SETTINGS.appName} className="h-16 mb-8" />
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-lg text-gray-600">Chargement en cours...</p>
    </div>
  )
}

export default LoadingScreen


"use client"

import { Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom"
import { Home } from "lucide-react"

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page non trouvée</h2>
      <p className="text-gray-600 mb-8 max-w-md">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Button onClick={() => navigate("/dashboard")}>
        <Home className="h-4 w-4 mr-2" />
        Retour à l'accueil
      </Button>
    </div>
  )
}

export default NotFound


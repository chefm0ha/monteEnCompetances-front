"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { APP_SETTINGS } from "../../config"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState("")
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!email.trim()) {
      setFormError("Veuillez saisir votre email.")
      return
    }

    if (!password) {
      setFormError("Veuillez saisir votre mot de passe.")
      return
    }

    const success = await login(email, password)
    if (success) {
      navigate("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={APP_SETTINGS.logoUrl || "/placeholder.svg"}
            alt={APP_SETTINGS.appName}
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold">{APP_SETTINGS.appName}</h1>
          <p className="text-gray-600">Plateforme de montée en compétences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Connectez-vous pour accéder à vos formations</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {(formError || error) && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError || error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <a
                      href="#"
                      className="text-sm text-primary hover:underline"
                      onClick={(e) => {
                        e.preventDefault()
                        alert("Contactez votre administrateur pour réinitialiser votre mot de passe.")
                      }}
                    >
                      Mot de passe oublié ?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">Besoin d'aide ? Contactez {APP_SETTINGS.supportEmail}</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Login


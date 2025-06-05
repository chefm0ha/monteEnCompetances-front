// src/pages/shared/Login.jsx
"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../components/shared/theme-provider"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { getThemeLogo } from "../../lib/utils"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { APP_SETTINGS } from "../../config"
import Swal from 'sweetalert2'

const Login = () => {
  const { theme } = useTheme()
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
      // The redirect logic is now handled in the AuthContext after successful login
      // or we can get the user role from the response and redirect accordingly
      // For now, navigate to dashboard and let the routing handle the redirect
      navigate("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={getThemeLogo(theme)}
            alt={APP_SETTINGS.appName}
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">{APP_SETTINGS.appName}</h1>
          <p className="text-muted-foreground">Plateforme de montée en compétences</p>
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
                        Swal.fire({
                          title: 'Mot de passe oublié ?',
                          text: 'Contactez votre administrateur pour réinitialiser votre mot de passe.',
                          icon: 'info',
                          confirmButtonText: 'Compris'
                        })
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
            <p className="text-sm text-muted-foreground">Besoin d'aide ? Contactez {APP_SETTINGS.supportEmail}</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Login
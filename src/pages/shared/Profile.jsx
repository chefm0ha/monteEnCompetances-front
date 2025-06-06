// src/pages/shared/Profile.jsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../components/shared/theme-provider"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { 
  User, 
  Mail, 
  Briefcase, 
  Save, 
  Loader2, 
  AlertCircle,
  Eye,  EyeOff,
  Shield,
  Calendar,
  MapPin,
  Monitor,
  Sun,
  Moon
} from "lucide-react"
import Swal from 'sweetalert2'
import { collaborateurService } from "../../services/collaborateurService"
import { authService } from "../../services/authService"
import { APP_SETTINGS } from "../../config"

const Profile = () => {
  const { currentUser, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
    const [profileData, setProfileData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    role: currentUser?.role || ""
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        role: currentUser.role || ""
      })
    }
  }, [currentUser])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError("")

    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setError("Le prénom et le nom sont obligatoires")
      return
    }

    if (!profileData.email.trim()) {
      setError("L'email est obligatoire")
      return
    }

    try {
      setSaving(true)
      
      // Prepare update data - only basic profile fields
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email
      }
      
      let response;
      
      if (currentUser?.role === "ADMIN" || currentUser?.role === "USER") {
        // Use auth service for admin and regular users
        response = await authService.updateProfile(updateData)
      } else if (currentUser?.role === "COLLABORATEUR") {
        // For collaborateurs, add poste field from current user data
        updateData.poste = currentUser.poste // Keep existing poste, don't allow editing
        response = await collaborateurService.updateCollaborateurProfile(currentUser.id, updateData)
      }

      Swal.fire({
        icon: 'success',
        title: 'Profil mis à jour',
        text: 'Vos informations ont été mises à jour avec succès.'
      })
      
    } catch (error) {
      console.error("Error updating profile:", error)
      
      if (error.message === "Email already exists") {
        setError("Cette adresse email est déjà utilisée par un autre utilisateur")
      } else if (error.validationErrors) {
        // Handle validation errors
        const errorMessages = Object.values(error.validationErrors).join(", ")
        setError(errorMessages)
      } else {
        setError("Impossible de mettre à jour le profil. Veuillez réessayer.")
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || "Impossible de mettre à jour le profil."
      })
    } finally {
      setSaving(false)
    }
  }
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError("")

    if (!passwordData.currentPassword) {
      setError("Le mot de passe actuel est obligatoire")
      return
    }

    if (!passwordData.newPassword) {
      setError("Le nouveau mot de passe est obligatoire")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    try {
      setSaving(true)
      
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      })
      
      Swal.fire({
        icon: 'success',
        title: 'Mot de passe modifié',
        text: 'Votre mot de passe a été modifié avec succès.'
      })

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      
    } catch (error) {
      console.error("Error changing password:", error)
      
      if (error.message === "Invalid current password or passwords don't match") {
        setError("Mot de passe actuel incorrect ou les nouveaux mots de passe ne correspondent pas")
      } else if (error.validationErrors) {
        // Handle validation errors
        const errorMessages = Object.values(error.validationErrors).join(", ")
        setError(errorMessages)
      } else {
        setError("Impossible de modifier le mot de passe. Veuillez réessayer.")
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || "Impossible de modifier le mot de passe."
      })
    } finally {
      setSaving(false)
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "ADMIN":
        return "Administrateur"
      case "USER":
        return "Utilisateur"
      case "COLLABORATEUR":
        return "Collaborateur"
      default:
        return role
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Non renseigné"
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et vos préférences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Informations générales</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentUser?.avatar || APP_SETTINGS.defaultAvatarUrl} />
                  <AvatarFallback className="text-lg">
                    {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">                  <h3 className="text-lg font-medium">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </h3>
                  <p className="text-muted-foreground">{currentUser?.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {currentUser?.role !== "ADMIN" && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {currentUser?.role || "Non renseigné"}
                      </div>
                    )}
                    {currentUser?.role !== "COLLABORATEUR" && (
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        {getRoleDisplayName(currentUser?.role)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="votre.email@exemple.com"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Modifier le mot de passe
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Entrez un nouveau mot de passe"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>                  <p className="text-xs text-muted-foreground">
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Modifier le mot de passe
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">                  <h4 className="font-medium">Informations du compte</h4>
                  <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Membre depuis: {formatDate(currentUser?.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email vérifié: {currentUser?.emailVerified ? "Oui" : "Non"}</span>
                    </div>
                  </div>
                </div>                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Thème et affichage</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choisissez le thème de l'interface
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("light")}
                        className="flex items-center gap-2"
                      >
                        <Sun className="h-4 w-4" />
                        Clair
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className="flex items-center gap-2"
                      >
                        <Moon className="h-4 w-4" />
                        Sombre
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Thème actuel: {theme === "light" ? "Clair" : "Sombre"}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gérez vos préférences de notification (bientôt disponible).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile
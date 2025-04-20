"use client"

import { useAuth } from "../context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

const UserDebugInfo = () => {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Informations utilisateur (Debug)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <strong>Email:</strong> {currentUser.email}
          </div>
          <div>
            <strong>Nom:</strong> {currentUser.firstName} {currentUser.lastName}
          </div>
          <div>
            <strong>Rôle:</strong> {currentUser.role}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserDebugInfo

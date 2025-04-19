"use client"

import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Clock, ArrowRight } from "lucide-react"
import ProgressBar from "./ProgressBar"

const FormationCard = ({ formation }) => {
  const navigate = useNavigate()

  const getStatusBadge = () => {
    if (formation.progress === 100) {
      return <Badge className="bg-green-500">Terminée</Badge>
    } else if (formation.progress > 0) {
      return <Badge className="bg-blue-500">En cours</Badge>
    } else {
      return <Badge className="bg-gray-500">Non commencée</Badge>
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{formation.title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600 mb-4 line-clamp-3">{formation.description}</p>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock className="h-4 w-4 mr-1" />
          <span>{formation.duration} heures</span>
        </div>
        <ProgressBar value={formation.completedModules} total={formation.totalModules} />
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => navigate(`/formation/${formation.id}`)}>
          {formation.progress === 0 ? "Commencer" : "Continuer"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default FormationCard


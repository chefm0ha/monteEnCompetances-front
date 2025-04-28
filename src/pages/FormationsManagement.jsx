"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { formationService } from "../services/formationService"
import { useToast } from "../components/ui/use-toast"

const FormationsManagement = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchFormations()
  }, [])

  const fetchFormations = async () => {
    try {
      const data = await formationService.getAllFormations()
      setFormations(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les formations."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      try {
        await formationService.deleteFormation(id)
        toast({
          title: "Succès",
          description: "Formation supprimée avec succès."
        })
        fetchFormations()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de supprimer la formation."
        })
      }
    }
  }

  const filteredFormations = formations.filter(formation =>
    formation.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des formations</h1>
        <Button onClick={() => navigate("/admin/formations/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle formation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des formations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <Search className="h-4 w-4 mr-2 text-gray-500" />
            <Input
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredFormations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Aucune formation trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFormations.map((formation) => (
                    <TableRow key={formation.id}>
                      <TableCell>{formation.title}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {formation.description}
                      </TableCell>
                      <TableCell>{formation.duration} heures</TableCell>
                      <TableCell>{formation.modules?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/formations/${formation.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(formation.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FormationsManagement 
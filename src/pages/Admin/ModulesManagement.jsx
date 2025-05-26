"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table"
import { Plus, Pencil, Trash2, Search, BookOpen } from "lucide-react"
import { moduleService } from "../../services/moduleService"
import { formationService } from "../../services/formationService"
import { useToast } from "../../hooks/use-toast"

const ModulesManagement = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [modules, setModules] = useState([])
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFormation, setSelectedFormation] = useState("all")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [modulesData, formationsData] = await Promise.all([
        moduleService.getAllModules(),
        formationService.getAllFormations()
      ])
      setModules(modulesData)
      setFormations(formationsData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) {
      try {
        await moduleService.deleteModule(id)
        toast({
          title: "Succès",
          description: "Module supprimé avec succès."
        })
        fetchData()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de supprimer le module."
        })
      }
    }
  }

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.titre && module.titre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFormation = !selectedFormation || selectedFormation === "all" || module.formationId.toString() === selectedFormation
    return matchesSearch && matchesFormation
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des modules</h1>
        <Button onClick={() => navigate("/admin/modules/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau module
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center flex-1">
              <Search className="h-4 w-4 mr-2 text-gray-500" />
              <Input
                placeholder="Rechercher un module..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select
              value={selectedFormation}
              onValueChange={setSelectedFormation}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par formation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les formations</SelectItem>
                {formations.map((formation) => (
                  <SelectItem key={formation.id} value={formation.id.toString()}>
                    {formation.titre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Formation</TableHead>
                  <TableHead>Contenus</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredModules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Aucun module trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell>{module.titre}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                          {module.formationTitre}
                        </div>
                      </TableCell>
                      <TableCell>{module.nombreSupports || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/modules/${module.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(module.id)}
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

export default ModulesManagement
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table"
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  FileText, 
  FileIcon, 
  Video, 
  Clock,
  FolderOpen 
} from "lucide-react"
import { Badge } from "../components/ui/badge"
import { contenuService } from "../services/contenuService"
import { moduleService } from "../services/moduleService"
import { formationService } from "../services/formationService"
import { useToast } from "../components/ui/use-toast"

const ContenusManagement = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [contenus, setContenus] = useState([])
  const [modules, setModules] = useState([])
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedModule, setSelectedModule] = useState("all_modules")
  const [selectedFormation, setSelectedFormation] = useState("all_formations")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [contenusData, modulesData, formationsData] = await Promise.all([
        contenuService.getAllContenus(),
        moduleService.getAllModules(),
        formationService.getAllFormations()
      ])
      setContenus(contenusData)
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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?")) {
      try {
        await contenuService.deleteContenu(id)
        toast({
          title: "Succès",
          description: "Contenu supprimé avec succès."
        })
        fetchData()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de supprimer le contenu."
        })
      }
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "PDF":
        return <FileIcon className="h-4 w-4 text-red-500" />
      case "TEXT":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "VIDEO":
        return <Video className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getModuleTitle = (moduleId) => {
    const module = modules.find(m => m.id === moduleId)
    return module ? module.title : "Module inconnu"
  }

  const getFormationTitle = (moduleId) => {
    const module = modules.find(m => m.id === moduleId)
    const formation = formations.find(f => f.id === module?.formationId)
    return formation ? formation.title : "Formation inconnue"
  }

  const filteredContenus = contenus.filter(contenu => {
    const matchesSearch = contenu.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModule = !selectedModule || selectedModule === "all_modules" || contenu.moduleId === selectedModule
    const matchesFormation = !selectedFormation || selectedFormation === "all_formations" || getFormationTitle(contenu.moduleId) === selectedFormation
    return matchesSearch && matchesModule && matchesFormation
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des contenus</h1>
        <Button onClick={() => navigate("/admin/contenus/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau contenu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des contenus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center flex-1">
              <Search className="h-4 w-4 mr-2 text-gray-500" />
              <Input
                placeholder="Rechercher un contenu..."
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
                <SelectItem value="all_formations">Toutes les formations</SelectItem>
                {formations.map((formation) => (
                  <SelectItem key={formation.id} value={formation.id}>
                    {formation.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedModule}
              onValueChange={setSelectedModule}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_modules">Tous les modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Formation</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredContenus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Aucun contenu trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContenus.map((contenu) => (
                    <TableRow key={contenu.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(contenu.type)}
                          <Badge variant="outline">{contenu.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{contenu.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FolderOpen className="h-4 w-4 mr-2 text-gray-500" />
                          {getModuleTitle(contenu.moduleId)}
                        </div>
                      </TableCell>
                      <TableCell>{getFormationTitle(contenu.moduleId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          {contenu.duration} min
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/contenus/${contenu.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contenu.id)}
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

export default ContenusManagement 
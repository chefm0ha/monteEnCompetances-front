import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileText, Video } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const SupportForm = ({ onSave, initialData = null }) => {
  const { toast } = useToast();
  const [support, setSupport] = useState(
    initialData || {
      type: "PDF",
      titre: "",
      description: "",
      lien: "",
      duree: "",
    }
  );
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (initialData) {
      setSupport(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupport((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    // Si on change le type, réinitialiser les champs spécifiques au type
    if (name === "type") {
      setFile(null);
      
      // Réinitialiser le lien sauf si on passe de PDF/VIDEO à TEXT
      if (value === "TEXT") {
        setSupport((prev) => ({
          ...prev,
          type: value,
          // Garder le contenu textuel s'il existe déjà
          lien: prev.type === "TEXT" ? prev.lien : "",
        }));
      } else {
        setSupport((prev) => ({
          ...prev,
          type: value,
          lien: "",
        }));
      }
    } else {
      setSupport((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validation du type de fichier
      if (support.type === "PDF" && selectedFile.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Type de fichier incorrect",
          description: "Veuillez sélectionner un fichier PDF valide",
        });
        return;
      }
      
      if (support.type === "VIDEO" && !selectedFile.type.startsWith("video/")) {
        toast({
          variant: "destructive",
          title: "Type de fichier incorrect",
          description: "Veuillez sélectionner un fichier vidéo valide",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation des champs obligatoires
    if (!support.titre.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le titre est obligatoire",
      });
      return;
    }

    if (!support.duree || isNaN(support.duree) || Number(support.duree) <= 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer une durée valide (en minutes)",
      });
      return;
    }

    // Validation spécifique selon le type
    if (support.type === "TEXT") {
      if (!support.lien.trim()) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Le contenu textuel est obligatoire",
        });
        return;
      }
    } else if (!initialData) {
      // Pour nouveaux PDF et VIDEO
      if (!file) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Veuillez sélectionner un fichier",
        });
        return;
      }
    }

    // Passer les données et le fichier au composant parent
    onSave(support, file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Modifier le contenu" : "Ajouter un contenu"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type de contenu</Label>
              <Select value={support.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="TEXT">Texte</SelectItem>
                  <SelectItem value="VIDEO">Vidéo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duree">Durée estimée (minutes)</Label>
              <Input
                id="duree"
                name="duree"
                type="number"
                min="1"
                value={support.duree}
                onChange={handleChange}
                placeholder="Ex: 15"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titre">Titre</Label>
            <Input
              id="titre"
              name="titre"
              value={support.titre}
              onChange={handleChange}
              placeholder="Entrez le titre du contenu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={support.description}
              onChange={handleChange}
              placeholder="Décrivez brièvement ce contenu"
              rows={3}
            />
          </div>

          {support.type !== "TEXT" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">
                  {support.type === "PDF" ? "Fichier PDF" : "Fichier vidéo"}
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept={support.type === "PDF" ? ".pdf" : "video/*"}
                  onChange={handleFileChange}
                />
              </div>

              {file && (
                <div className="p-2 border rounded-md">
                  <div className="flex items-center text-blue-600">
                    {support.type === "PDF" ? (
                      <FileText className="h-5 w-5 mr-2" />
                    ) : (
                      <Video className="h-5 w-5 mr-2" />
                    )}
                    <span>{file.name}</span>
                  </div>
                </div>
              )}

              {support.lien && !file && (
                <div className="p-2 border rounded-md">
                  <div className="flex items-center text-blue-600">
                    {support.type === "PDF" ? (
                      <FileText className="h-5 w-5 mr-2" />
                    ) : (
                      <Video className="h-5 w-5 mr-2" />
                    )}
                    <a href={support.lien} target="_blank" rel="noopener noreferrer" className="underline">
                      {support.type === "PDF" ? "Voir le PDF" : "Voir la vidéo"}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="contenu">Contenu textuel</Label>
              <Textarea
                id="contenu"
                name="lien"
                value={support.lien}
                onChange={handleChange}
                placeholder="Entrez le contenu textuel"
                rows={10}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit">
              {initialData ? "Mettre à jour" : "Ajouter"} le contenu
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupportForm;
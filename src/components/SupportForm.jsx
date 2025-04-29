import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileText, Video, Upload, Loader2, Check } from "lucide-react";
import { fileService } from "../services/fileService";
import { useToast } from "../hooks/use-toast";

const SupportForm = ({ onSave, initialData = null }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
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
    // Vérifier si nous avons déjà un lien de fichier
    if (initialData && initialData.lien && initialData.type !== "TEXT") {
      setFileUploaded(true);
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
      setFileUploaded(false);
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
      setFileUploaded(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un fichier",
      });
      return;
    }

    setUploading(true);

    try {
      let result;
      
      // Utiliser le service d'upload approprié selon le type
      if (support.type === "PDF") {
        result = await fileService.uploadPDF(file, "supports");
      } else if (support.type === "VIDEO") {
        result = await fileService.uploadVideo(file, "supports");
      }

      // Mise à jour du lien
      setSupport((prev) => ({
        ...prev,
        lien: result.fileUrl,
      }));
      
      setFileUploaded(true);

      toast({
        title: "Fichier téléchargé",
        description: "Le fichier a été téléchargé avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le fichier. Veuillez réessayer plus tard.",
      });
    } finally {
      setUploading(false);
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
    } else {
      // Pour PDF et VIDEO
      if (!support.lien) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Veuillez télécharger un fichier",
        });
        return;
      }
    }

    // Tout est OK, envoyer les données au composant parent
    onSave(support);
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
                  disabled={uploading}
                />
              </div>

              {file && !fileUploaded && (
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Télécharger sur Cloudinary
                    </>
                  )}
                </Button>
              )}

              {fileUploaded && (
                <div className="flex items-center p-2 rounded-md bg-green-50 text-green-700">
                  <Check className="h-5 w-5 mr-2" />
                  <span>
                    {support.type === "PDF" ? "Document PDF" : "Vidéo"} téléchargé avec succès
                  </span>
                </div>
              )}

              {support.lien && support.type === "PDF" && (
                <div className="p-2 border rounded-md">
                  <div className="flex items-center text-blue-600">
                    <FileText className="h-5 w-5 mr-2" />
                    <a href={support.lien} target="_blank" rel="noopener noreferrer" className="underline">
                      Voir le PDF
                    </a>
                  </div>
                </div>
              )}

              {support.lien && support.type === "VIDEO" && (
                <div className="p-2 border rounded-md">
                  <div className="flex items-center text-purple-600">
                    <Video className="h-5 w-5 mr-2" />
                    <a href={support.lien} target="_blank" rel="noopener noreferrer" className="underline">
                      Voir la vidéo
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
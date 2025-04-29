import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { X } from "lucide-react";

const ImageUpload = ({ onImageSelected, initialImage = null }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mettre à jour le preview si initialImage change
    setPreview(initialImage);
  }, [initialImage]);

  // Gérer la sélection du fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner un fichier image");
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Créer un aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Informer le composant parent du fichier sélectionné
    onImageSelected(file);
  };

  // Supprimer l'image sélectionnée
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(null);
    onImageSelected(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          type="file"
          onChange={handleFileChange}
          accept="image/*"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {preview && (
        <div className="relative w-full max-w-md">
          <img
            src={preview}
            alt="Aperçu"
            className="object-cover rounded-md w-full max-h-64"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
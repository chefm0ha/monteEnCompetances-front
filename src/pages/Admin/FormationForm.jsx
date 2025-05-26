import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import ImageUpload from "../components/ImageUpload";
import { formationService } from "../services/formationService";
import { showToast } from "../utils/sweetAlert";

const FormationForm = ({ formationId = null }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!formationId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formation, setFormation] = useState({
    titre: "",
    description: "",
    type: "",
    duree: "",
    lienPhoto: null,
    imageFile: null
  });
  
  const formationTypes = [
    "Technique",
    "Management",
    "Soft Skills",
    "Conformité",
    "Sécurité",
    "Autre"
  ];

  useEffect(() => {
    if (formationId) {
      fetchFormation(formationId);
    }
  }, [formationId]);

  const fetchFormation = async (id) => {
    try {
      setLoading(true);
      const data = await formationService.getFormationById(id);
      setFormation(data);    } catch (error) {
      console.error("Erreur lors de la récupération de la formation:", error);
      setError("Impossible de récupérer les détails de la formation.");
      showToast.error("Impossible de récupérer les détails de la formation.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelected = (imageFile) => {
    setFormation(prev => ({
      ...prev,
      imageFile: imageFile
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formation.titre.trim()) {
      setError("Le titre est obligatoire");
      return;
    }
    
    if (!formation.description.trim()) {
      setError("La description est obligatoire");
      return;
    }
    
    if (!formation.type) {
      setError("Le type de formation est obligatoire");
      return;
    }

    if (!formation.duree || isNaN(formation.duree) || Number(formation.duree) <= 0) {
      setError("Veuillez entrer une durée valide (en heures)");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      let response;      if (formationId) {
        // Mise à jour d'une formation existante
        response = await formationService.updateFormation(formationId, formation);
        showToast.success("La formation a été mise à jour avec succès.", "Formation mise à jour");
      } else {
        // Création d'une nouvelle formation
        response = await formationService.createFormation(formation);
        showToast.success("La formation a été créée avec succès.", "Formation créée");
      }
      
      // Redirection vers la liste des formations après un court délai
      setTimeout(() => {
        navigate("/admin/formations");
      }, 1000);
        } catch (error) {
      console.error("Erreur lors de la sauvegarde de la formation:", error);
      setError("Impossible de sauvegarder la formation. Veuillez réessayer plus tard.");
      showToast.error("Impossible de sauvegarder la formation.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/admin/formations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {formationId ? "Modifier la formation" : "Nouvelle formation"}
          </h1>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations de la formation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                name="titre"
                value={formation.titre}
                onChange={handleChange}
                placeholder="Entrez le titre de la formation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formation.description}
                onChange={handleChange}
                placeholder="Entrez la description de la formation"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formation.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {formationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duree">Durée (heures)</Label>
                <Input
                  id="duree"
                  name="duree"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formation.duree}
                  onChange={handleChange}
                  placeholder="Entrez la durée de la formation"
                />
              </div>
            </div>

            <ImageUpload 
              onImageSelected={handleImageSelected} 
              initialImage={formation.lienPhoto}
            />
          </CardContent>
        </Card>

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
                {formationId ? "Mettre à jour" : "Créer la formation"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormationForm;
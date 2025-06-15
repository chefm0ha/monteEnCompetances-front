import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertCircle } from "lucide-react";

const CollaborateurForm = ({ 
  collaborateur, 
  onSubmit, 
  onCancel, 
  formError, 
  submitLabel = "Ajouter", 
  cancelLabel = "Annuler" 
}) => {  // Liste des postes pour les sélecteurs
  const postes = ["Stagiaire", "Embauché"];
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "COLLABORATEUR",
    poste: "",
  });
  
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (collaborateur) {
      setFormData({ 
        ...collaborateur,
        // Don't include password if we're editing an existing collaborateur
        password: collaborateur.id ? "" : collaborateur.password || ""
      });
    }
  }, [collaborateur]);
  
  // Check for email conflicts in formError
  useEffect(() => {
    // Reset field errors when formError changes
    const newFieldErrors = {};
    
    if (formError) {
      // Check for email-related errors using more comprehensive checks
      if (formError.toLowerCase().includes("already exists")) {
        console.log("Email déjà utilisé");
        newFieldErrors.email = true;
      }
    }
    
    setFieldErrors(newFieldErrors);
  }, [formError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input 
              id="lastName" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleInputChange} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={fieldErrors.email ? "text-destructive" : ""}>Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleInputChange}
            className={fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
            aria-invalid={fieldErrors.email}
          />
          {fieldErrors.email && (
            <p className="text-sm font-medium text-destructive mt-1">
              {formError || "Cette adresse email est déjà utilisée par un autre collaborateur"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            value={formData.password} 
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="poste">Poste</Label>
          <Select 
            value={formData.poste} 
            onValueChange={(value) => handleSelectChange("poste", value)}
          >            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Sélectionner un poste" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {postes.map((poste) => (
                <SelectItem key={poste} value={poste} className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                  {poste}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
};

export default CollaborateurForm; 
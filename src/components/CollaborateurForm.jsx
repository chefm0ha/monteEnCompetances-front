import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const CollaborateurForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    poste: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePosteChange = (value) => {
    setFormData(prev => ({
      ...prev,
      poste: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un collaborateur</DialogTitle>
          <p className="text-sm text-gray-600">
            Remplissez le formulaire pour ajouter un nouveau collaborateur.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poste">Poste</Label>
            <Select value={formData.poste} onValueChange={handlePosteChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un poste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developer">Développeur</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborateurForm; 
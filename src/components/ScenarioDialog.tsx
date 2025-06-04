
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play } from "lucide-react";

interface ScenarioDialogProps {
  onRunScenario: (scenario: any) => void;
}

export function ScenarioDialog({ onRunScenario }: ScenarioDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    eurUsd: '',
    eurGbp: '',
    eurJpy: '',
    description: ''
  });

  const scenarioTypes = ['Stress Test', 'Historique', 'Personnalisé'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.type) {
      onRunScenario({
        name: formData.name,
        type: formData.type,
        rates: {
          EURUSD: parseFloat(formData.eurUsd) || 1.0856,
          EURGBP: parseFloat(formData.eurGbp) || 0.8434,
          EURJPY: parseFloat(formData.eurJpy) || 161.85,
        },
        description: formData.description
      });
      setFormData({ name: '', type: '', eurUsd: '', eurGbp: '', eurJpy: '', description: '' });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white">
          <Play className="h-4 w-4 mr-2" />
          Nouveau scénario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Simuler un scénario</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du scénario</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Choc USD +10%"
            />
          </div>

          <div>
            <Label htmlFor="type">Type de scénario</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {scenarioTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="eurUsd">EUR/USD</Label>
              <Input
                id="eurUsd"
                type="number"
                step="0.0001"
                value={formData.eurUsd}
                onChange={(e) => setFormData({...formData, eurUsd: e.target.value})}
                placeholder="1.0856"
              />
            </div>
            <div>
              <Label htmlFor="eurGbp">EUR/GBP</Label>
              <Input
                id="eurGbp"
                type="number"
                step="0.0001"
                value={formData.eurGbp}
                onChange={(e) => setFormData({...formData, eurGbp: e.target.value})}
                placeholder="0.8434"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="eurJpy">EUR/JPY</Label>
            <Input
              id="eurJpy"
              type="number"
              step="0.01"
              value={formData.eurJpy}
              onChange={(e) => setFormData({...formData, eurJpy: e.target.value})}
              placeholder="161.85"
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="flex-1">Exécuter</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

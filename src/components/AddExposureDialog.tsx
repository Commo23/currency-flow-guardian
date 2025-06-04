
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Exposure {
  id: number;
  currency: string;
  amount: number;
  date: string;
  type: string;
  description?: string;
}

interface AddExposureDialogProps {
  onAddExposure: (exposure: Omit<Exposure, 'id'>) => void;
}

export function AddExposureDialog({ onAddExposure }: AddExposureDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    currency: '',
    amount: '',
    date: '',
    type: '',
    description: ''
  });

  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
  const types = ['Encaissement', 'Décaissement', 'Prévision'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.currency && formData.amount && formData.date && formData.type) {
      onAddExposure({
        currency: formData.currency,
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: formData.type,
        description: formData.description
      });
      setFormData({ currency: '', amount: '', date: '', type: '', description: '' });
      setOpen(false);
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const header = lines[0].split(',');
        
        // Expected CSV format: Currency,Amount,Date,Type,Description
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 4 && values[0] && values[1] && values[2] && values[3]) {
            onAddExposure({
              currency: values[0].trim(),
              amount: parseFloat(values[1].trim()),
              date: values[2].trim(),
              type: values[3].trim(),
              description: values[4]?.trim() || ''
            });
          }
        }
      };
      reader.readAsText(file);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle exposition
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une exposition</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1" onClick={() => document.getElementById('csv-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVUpload}
            />
          </div>
          
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            <strong>Format CSV attendu:</strong><br/>
            Currency,Amount,Date,Type,Description<br/>
            EUR,1200000,2024-02-15,Encaissement,Vente export<br/>
            USD,-800000,2024-02-20,Décaissement,Achat matières
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Ou saisie manuelle:</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currency">Devise</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une devise" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Montant (en devise)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="1200000"
                />
              </div>

              <div>
                <Label htmlFor="date">Date d'échéance</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description de l'exposition..."
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">Ajouter</Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

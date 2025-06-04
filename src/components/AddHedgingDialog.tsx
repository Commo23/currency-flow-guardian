
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface HedgingInstrument {
  id: number;
  type: string;
  currency: string;
  amount: number;
  rate: number;
  maturity: string;
  premium?: number;
}

interface AddHedgingDialogProps {
  onAddHedging: (hedging: Omit<HedgingInstrument, 'id'>) => void;
}

export function AddHedgingDialog({ onAddHedging }: AddHedgingDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    currency: '',
    amount: '',
    rate: '',
    maturity: '',
    premium: ''
  });

  const instrumentTypes = ['Forward', 'Option Call', 'Option Put', 'Swap'];
  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'CHF'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type && formData.currency && formData.amount && formData.rate && formData.maturity) {
      onAddHedging({
        type: formData.type,
        currency: formData.currency,
        amount: parseFloat(formData.amount),
        rate: parseFloat(formData.rate),
        maturity: formData.maturity,
        premium: formData.premium ? parseFloat(formData.premium) : undefined
      });
      setFormData({ type: '', currency: '', amount: '', rate: '', maturity: '', premium: '' });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel instrument
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un instrument de couverture</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Type d'instrument</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un instrument" />
              </SelectTrigger>
              <SelectContent>
                {instrumentTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="amount">Montant nominal</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="1000000"
            />
          </div>

          <div>
            <Label htmlFor="rate">Taux de change</Label>
            <Input
              id="rate"
              type="number"
              step="0.0001"
              value={formData.rate}
              onChange={(e) => setFormData({...formData, rate: e.target.value})}
              placeholder="1.0856"
            />
          </div>

          <div>
            <Label htmlFor="maturity">Date d'échéance</Label>
            <Input
              id="maturity"
              type="date"
              value={formData.maturity}
              onChange={(e) => setFormData({...formData, maturity: e.target.value})}
            />
          </div>

          {(formData.type === 'Option Call' || formData.type === 'Option Put') && (
            <div>
              <Label htmlFor="premium">Prime (optionnel)</Label>
              <Input
                id="premium"
                type="number"
                value={formData.premium}
                onChange={(e) => setFormData({...formData, premium: e.target.value})}
                placeholder="5000"
              />
            </div>
          )}

          <div className="flex space-x-2">
            <Button type="submit" className="flex-1">Ajouter</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

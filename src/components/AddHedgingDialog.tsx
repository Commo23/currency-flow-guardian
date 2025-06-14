
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus } from "lucide-react";

interface HedgingInstrument {
  id: number;
  type: string;
  currency: string;
  amount: number;
  rate: number;
  maturity: string;
  premium?: number;
  barrier?: number;
  barrierType?: 'percentage' | 'absolute';
  strikeType?: 'percentage' | 'absolute';
  knockDirection?: 'in' | 'out';
  barrierDirection?: 'up' | 'down';
  isReverse?: boolean;
  isDouble?: boolean;
  lowerBarrier?: number;
  upperBarrier?: number;
  rebate?: number;
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
    premium: '',
    barrier: '',
    barrierType: 'percentage' as 'percentage' | 'absolute',
    strikeType: 'percentage' as 'percentage' | 'absolute',
    knockDirection: 'out' as 'in' | 'out',
    barrierDirection: 'up' as 'up' | 'down',
    isReverse: false,
    isDouble: false,
    lowerBarrier: '',
    upperBarrier: '',
    rebate: ''
  });

  const instrumentTypes = [
    'Call',
    'Put', 
    'Swap',
    'Forward',
    'Call Knock-Out',
    'Call Reverse Knock-Out',
    'Call Double Knock-Out',
    'Put Knock-Out',
    'Put Reverse Knock-Out',
    'Put Double Knock-Out',
    'Call Knock-In',
    'Call Reverse Knock-In',
    'Call Double Knock-In',
    'Put Knock-In',
    'Put Reverse Knock-In',
    'Put Double Knock-In',
    'One Touch (beta)',
    'Double Touch (beta)',
    'No Touch (beta)',
    'Double No Touch (beta)',
    'Range Binary (beta)',
    'Outside Binary (beta)'
  ];

  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'CHF'];

  const isBarrierInstrument = formData.type.includes('Knock') || formData.type.includes('Touch') || formData.type.includes('Binary');
  const isDoubleBarrier = formData.type.includes('Double');
  const isOption = formData.type.includes('Call') || formData.type.includes('Put');
  const isTouchInstrument = formData.type.includes('Touch');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type && formData.currency && formData.amount && formData.rate && formData.maturity) {
      const instrumentData: any = {
        type: formData.type,
        currency: formData.currency,
        amount: parseFloat(formData.amount),
        rate: parseFloat(formData.rate),
        maturity: formData.maturity,
        strikeType: formData.strikeType
      };

      if (formData.premium) {
        instrumentData.premium = parseFloat(formData.premium);
      }

      if (isBarrierInstrument) {
        instrumentData.barrierType = formData.barrierType;
        
        if (isDoubleBarrier) {
          if (formData.lowerBarrier) instrumentData.lowerBarrier = parseFloat(formData.lowerBarrier);
          if (formData.upperBarrier) instrumentData.upperBarrier = parseFloat(formData.upperBarrier);
        } else {
          if (formData.barrier) instrumentData.barrier = parseFloat(formData.barrier);
        }

        if (formData.rebate) {
          instrumentData.rebate = parseFloat(formData.rebate);
        }
      }

      onAddHedging(instrumentData);
      setFormData({
        type: '', currency: '', amount: '', rate: '', maturity: '', premium: '',
        barrier: '', barrierType: 'percentage', strikeType: 'percentage',
        knockDirection: 'out', barrierDirection: 'up', isReverse: false, isDouble: false,
        lowerBarrier: '', upperBarrier: '', rebate: ''
      });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un instrument de couverture</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="maturity">Date d'échéance</Label>
              <Input
                id="maturity"
                type="date"
                value={formData.maturity}
                onChange={(e) => setFormData({...formData, maturity: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label>Strike / Taux de change</Label>
            <div className="space-y-3">
              <RadioGroup
                value={formData.strikeType}
                onValueChange={(value: 'percentage' | 'absolute') => setFormData({...formData, strikeType: value})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="absolute" id="strike-absolute" />
                  <Label htmlFor="strike-absolute">Valeur absolue</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="strike-percentage" />
                  <Label htmlFor="strike-percentage">% du spot</Label>
                </div>
              </RadioGroup>
              <Input
                type="number"
                step="0.0001"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                placeholder={formData.strikeType === 'percentage' ? "100 (pour 100%)" : "1.0856"}
              />
            </div>
          </div>

          {isBarrierInstrument && (
            <div>
              <Label>Barrière(s)</Label>
              <div className="space-y-3">
                <RadioGroup
                  value={formData.barrierType}
                  onValueChange={(value: 'percentage' | 'absolute') => setFormData({...formData, barrierType: value})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="absolute" id="barrier-absolute" />
                    <Label htmlFor="barrier-absolute">Valeur absolue</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="barrier-percentage" />
                    <Label htmlFor="barrier-percentage">% du spot</Label>
                  </div>
                </RadioGroup>
                
                {isDoubleBarrier ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      step="0.0001"
                      value={formData.lowerBarrier}
                      onChange={(e) => setFormData({...formData, lowerBarrier: e.target.value})}
                      placeholder={formData.barrierType === 'percentage' ? "95 (barrière basse %)" : "1.0300 (barrière basse)"}
                    />
                    <Input
                      type="number"
                      step="0.0001"
                      value={formData.upperBarrier}
                      onChange={(e) => setFormData({...formData, upperBarrier: e.target.value})}
                      placeholder={formData.barrierType === 'percentage' ? "105 (barrière haute %)" : "1.1400 (barrière haute)"}
                    />
                  </div>
                ) : (
                  <Input
                    type="number"
                    step="0.0001"
                    value={formData.barrier}
                    onChange={(e) => setFormData({...formData, barrier: e.target.value})}
                    placeholder={formData.barrierType === 'percentage' ? "95 (pour 95%)" : "1.0300"}
                  />
                )}
              </div>
            </div>
          )}

          {(isOption || isTouchInstrument) && (
            <div>
              <Label htmlFor="premium">Prime</Label>
              <Input
                id="premium"
                type="number"
                value={formData.premium}
                onChange={(e) => setFormData({...formData, premium: e.target.value})}
                placeholder="5000"
              />
            </div>
          )}

          {isBarrierInstrument && (
            <div>
              <Label htmlFor="rebate">Rebate (optionnel)</Label>
              <Input
                id="rebate"
                type="number"
                value={formData.rebate}
                onChange={(e) => setFormData({...formData, rebate: e.target.value})}
                placeholder="1000"
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

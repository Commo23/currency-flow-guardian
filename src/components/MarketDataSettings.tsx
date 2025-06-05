
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMarketData } from "@/contexts/MarketDataContext";
import { Settings, RefreshCw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function MarketDataSettings() {
  const { marketData, updateSpotRate, updateVolatility, updateRiskFreeRate, resetToDefaults } = useMarketData();
  const { toast } = useToast();
  const [localRates, setLocalRates] = useState(marketData.spotRates);
  const [localVols, setLocalVols] = useState(marketData.volatilities);
  const [localRiskFreeRate, setLocalRiskFreeRate] = useState(marketData.riskFreeRate);

  const currencies = ['USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD'];

  const handleSave = () => {
    // Update spot rates
    Object.entries(localRates).forEach(([pair, rate]) => {
      const currency = pair.replace('EUR', '');
      updateSpotRate(currency, rate);
    });

    // Update volatilities
    Object.entries(localVols).forEach(([pair, vol]) => {
      const currency = pair.replace('EUR', '');
      updateVolatility(currency, vol);
    });

    // Update risk-free rate
    updateRiskFreeRate(localRiskFreeRate);

    toast({
      title: "Paramètres sauvegardés",
      description: "Les données de marché ont été mises à jour avec succès.",
    });
  };

  const handleReset = () => {
    resetToDefaults();
    setLocalRates(marketData.spotRates);
    setLocalVols(marketData.volatilities);
    setLocalRiskFreeRate(marketData.riskFreeRate);
    
    toast({
      title: "Paramètres réinitialisés",
      description: "Les données de marché ont été remises aux valeurs par défaut.",
    });
  };

  return (
    <Card className="finance-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Configuration des Données de Marché</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Mis à jour: {new Date(marketData.lastUpdated).toLocaleString('fr-FR')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Spot Rates */}
        <div>
          <h4 className="font-semibold mb-3">Taux de Change Spot</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currencies.map((currency) => (
              <div key={currency} className="space-y-2">
                <Label htmlFor={`spot-${currency}`}>EUR/{currency}</Label>
                <Input
                  id={`spot-${currency}`}
                  type="number"
                  step="0.0001"
                  value={localRates[`EUR${currency}`] || ''}
                  onChange={(e) => setLocalRates(prev => ({
                    ...prev,
                    [`EUR${currency}`]: parseFloat(e.target.value) || 0
                  }))}
                  className="font-mono"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Volatilities */}
        <div>
          <h4 className="font-semibold mb-3">Volatilités (annualisées)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currencies.map((currency) => (
              <div key={currency} className="space-y-2">
                <Label htmlFor={`vol-${currency}`}>EUR/{currency} (%)</Label>
                <Input
                  id={`vol-${currency}`}
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={(localVols[`EUR${currency}`] * 100) || ''}
                  onChange={(e) => setLocalVols(prev => ({
                    ...prev,
                    [`EUR${currency}`]: (parseFloat(e.target.value) || 0) / 100
                  }))}
                  className="font-mono"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Risk-Free Rate */}
        <div>
          <h4 className="font-semibold mb-3">Taux Sans Risque</h4>
          <div className="max-w-xs">
            <Label htmlFor="risk-free-rate">Taux EUR (%)</Label>
            <Input
              id="risk-free-rate"
              type="number"
              step="0.01"
              min="0"
              value={(localRiskFreeRate * 100) || ''}
              onChange={(e) => setLocalRiskFreeRate((parseFloat(e.target.value) || 0) / 100)}
              className="font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Sauvegarder</span>
          </Button>
          <Button variant="outline" onClick={handleReset} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Réinitialiser</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

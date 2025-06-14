
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateGreeks } from "@/utils/financialCalculations";
import { useMarketData } from "@/contexts/MarketDataContext";
import { TrendingUp, TrendingDown, Activity, Clock } from "lucide-react";

interface GreeksDisplayProps {
  instrument: any;
}

export function GreeksDisplay({ instrument }: GreeksDisplayProps) {
  const { marketData } = useMarketData();
  
  const instrumentMarketData = {
    spotRates: marketData.spotRates,
    volatilities: instrument?.impliedVolatility ? 
      { [`EUR${instrument.currency}`]: instrument.impliedVolatility } : 
      marketData.volatilities,
    riskFreeRate: instrument?.riskFreeRate || marketData.riskFreeRate
  };
  
  const greeks = calculateGreeks(instrument, instrumentMarketData);

  if (!greeks || !instrument) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Sensibilités (Greeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm">Les Greeks ne sont disponibles que pour les options vanilla.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="text-sm flex items-center">
          <Activity className="h-4 w-4 mr-2 text-blue-600" />
          Sensibilités (Greeks) - {instrument.type} {instrument.currency}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-medium">Delta</p>
              <p className="text-slate-600 font-mono">{greeks.delta.toFixed(2)}</p>
              <p className="text-xs text-slate-500">Sensibilité au spot</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-green-600" />
            <div>
              <p className="font-medium">Gamma</p>
              <p className="text-slate-600 font-mono">{greeks.gamma.toFixed(4)}</p>
              <p className="text-xs text-slate-500">Convexité du delta</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-purple-600" />
            <div>
              <p className="font-medium">Vega</p>
              <p className="text-slate-600 font-mono">{greeks.vega.toFixed(0)}</p>
              <p className="text-xs text-slate-500">Sensibilité à la volatilité</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <div>
              <p className="font-medium">Theta</p>
              <p className="text-slate-600 font-mono">{greeks.theta.toFixed(2)}</p>
              <p className="text-xs text-slate-500">Décroissance temporelle/jour</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
            <div>
              <span className="font-medium">Volatilité utilisée:</span> 
              <span className="ml-1">
                {instrument.impliedVolatility ? 
                  `${(instrument.impliedVolatility * 100).toFixed(1)}% (instrument)` : 
                  `${((marketData.volatilities[`EUR${instrument.currency}`] || 0.15) * 100).toFixed(1)}% (marché)`
                }
              </span>
            </div>
            <div>
              <span className="font-medium">Taux utilisé:</span>
              <span className="ml-1">
                {instrument.riskFreeRate ? 
                  `${(instrument.riskFreeRate * 100).toFixed(2)}% (instrument)` : 
                  `${(marketData.riskFreeRate * 100).toFixed(2)}% (marché)`
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

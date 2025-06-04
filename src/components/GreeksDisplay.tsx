
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateGreeks } from "@/utils/financialCalculations";
import { TrendingUp, TrendingDown, Activity, Clock } from "lucide-react";

interface GreeksDisplayProps {
  instrument: any;
}

export function GreeksDisplay({ instrument }: GreeksDisplayProps) {
  const greeks = calculateGreeks(instrument);

  if (!greeks) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Sensibilités (Greeks)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-medium">Delta</p>
              <p className="text-gray-600">{greeks.delta.toFixed(3)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-green-600" />
            <div>
              <p className="font-medium">Gamma</p>
              <p className="text-gray-600">{greeks.gamma.toFixed(4)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-purple-600" />
            <div>
              <p className="font-medium">Vega</p>
              <p className="text-gray-600">{greeks.vega.toFixed(2)}%</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <div>
              <p className="font-medium">Theta</p>
              <p className="text-gray-600">{greeks.theta.toFixed(2)}/jour</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

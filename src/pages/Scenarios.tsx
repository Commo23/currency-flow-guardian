
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Play, BarChart3, AlertTriangle } from "lucide-react";

export default function Scenarios() {
  const { t } = useLanguage();

  const scenarios = [
    { name: 'EUR/USD +5%', impact: '+125K €', risk: 'Faible' },
    { name: 'EUR/USD -10%', impact: '-280K €', risk: 'Élevé' },
    { name: 'GBP/EUR +3%', impact: '+45K €', risk: 'Faible' },
    { name: 'Volatilité extrême', impact: '-450K €', risk: 'Critique' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('scenarios')}</h1>
          <p className="text-gray-600 mt-1">Simulation et analyse de scénarios</p>
        </div>
        <Button className="bg-primary text-white">
          <Play className="h-4 w-4 mr-2" />
          Nouveau scénario
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Scénarios de stress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarios.map((scenario, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{scenario.name}</p>
                    <p className={`text-sm font-semibold ${scenario.impact.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                      Impact: {scenario.impact}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    scenario.risk === 'Faible' ? 'bg-green-100 text-green-800' :
                    scenario.risk === 'Élevé' ? 'bg-red-100 text-red-800' :
                    'bg-red-200 text-red-900'
                  }`}>
                    {scenario.risk}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span>Recommandations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-medium text-amber-800">USD - Exposition critique</p>
                <p className="text-sm text-amber-600">Recommandé: Couvrir 80% de l'exposition USD d'ici 15 jours</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-800">GBP - Opportunité</p>
                <p className="text-sm text-blue-600">Conditions favorables pour étendre la couverture GBP</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800">EUR - Position stable</p>
                <p className="text-sm text-green-600">Maintenir la stratégie actuelle</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Simulateur de scénarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Devise de base</label>
              <select className="w-full p-2 border rounded-md">
                <option>EUR</option>
                <option>USD</option>
                <option>GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Variation (%)</label>
              <input type="number" className="w-full p-2 border rounded-md" placeholder="5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Horizon temporel</label>
              <select className="w-full p-2 border rounded-md">
                <option>7 jours</option>
                <option>30 jours</option>
                <option>90 jours</option>
              </select>
            </div>
          </div>
          <Button className="bg-primary text-white">
            <Play className="h-4 w-4 mr-2" />
            Lancer la simulation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

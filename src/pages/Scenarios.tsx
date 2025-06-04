
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExposures } from "@/contexts/ExposureContext";
import { ScenarioDialog } from "@/components/ScenarioDialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, DollarSign, AlertTriangle, BarChart3 } from "lucide-react";

export default function Scenarios() {
  const { t } = useLanguage();
  const { exposures } = useExposures();
  const [scenarios, setScenarios] = useState([
    {
      id: 1,
      name: "Scenario de base",
      type: "Actuel",
      impact: 0,
      date: new Date().toISOString().split('T')[0]
    }
  ]);

  const [chartData, setChartData] = useState([
    { scenario: 'Base', impact: 0 },
    { scenario: 'USD +5%', impact: -42000 },
    { scenario: 'USD +10%', impact: -85000 },
    { scenario: 'GBP -5%', impact: 25000 },
  ]);

  const runScenario = (scenario: any) => {
    // Simulation simple de l'impact
    const usdExposures = exposures.filter(exp => exp.currency === 'USD');
    const gbpExposures = exposures.filter(exp => exp.currency === 'GBP');
    
    let impact = 0;
    if (scenario.rates.EURUSD !== 1.0856) {
      const usdImpact = usdExposures.reduce((sum, exp) => sum + exp.amount, 0);
      impact += usdImpact * ((scenario.rates.EURUSD - 1.0856) / 1.0856);
    }
    
    if (scenario.rates.EURGBP !== 0.8434) {
      const gbpImpact = gbpExposures.reduce((sum, exp) => sum + exp.amount, 0);
      impact += gbpImpact * ((scenario.rates.EURGBP - 0.8434) / 0.8434);
    }

    const newScenario = {
      id: scenarios.length + 1,
      name: scenario.name,
      type: scenario.type,
      impact: Math.round(impact),
      date: new Date().toISOString().split('T')[0]
    };

    setScenarios(prev => [...prev, newScenario]);
    setChartData(prev => [...prev, { scenario: scenario.name, impact: Math.round(impact) }]);
  };

  const totalExposure = exposures.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
  const worstCaseScenario = scenarios.reduce((worst, scenario) => 
    scenario.impact < worst.impact ? scenario : worst, scenarios[0]);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('scenarios')}</h1>
          <p className="text-gray-600 mt-1">Simulation de scénarios de change</p>
        </div>
        <ScenarioDialog onRunScenario={runScenario} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span>Exposition analysée</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(totalExposure / 1000000).toFixed(2)}M €
            </div>
            <p className="text-sm text-gray-500">{exposures.length} expositions</p>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span>Pire scénario</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${worstCaseScenario.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {worstCaseScenario.impact >= 0 ? '+' : ''}{(worstCaseScenario.impact / 1000).toFixed(0)}K €
            </div>
            <p className="text-sm text-gray-500">{worstCaseScenario.name}</p>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Scénarios testés</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{scenarios.length}</div>
            <p className="text-sm text-gray-500">Simulations réalisées</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Impact des scénarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="scenario" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip 
                    formatter={(value: number) => [`${(value / 1000).toFixed(0)}K €`, 'Impact']}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Bar dataKey="impact" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.impact >= 0 ? '#16a34a' : '#dc2626'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Historique des simulations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{scenario.name}</p>
                    <p className="text-sm text-gray-500">{scenario.type} - {new Date(scenario.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className={`font-semibold ${scenario.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {scenario.impact >= 0 ? '+' : ''}{(scenario.impact / 1000).toFixed(0)}K €
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

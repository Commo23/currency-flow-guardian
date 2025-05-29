
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Plus, Target, Activity } from "lucide-react";

export default function Hedging() {
  const { t } = useLanguage();

  const hedgingInstruments = [
    { id: 1, type: 'Forward', currency: 'EUR/USD', amount: '500K', maturity: '2024-03-15', rate: '1.0850' },
    { id: 2, type: 'Option', currency: 'GBP/EUR', amount: '300K', maturity: '2024-04-01', rate: '0.8620' },
    { id: 3, type: 'Swap', currency: 'USD/JPY', amount: '200K', maturity: '2024-05-20', rate: '150.25' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('hedging')}</h1>
          <p className="text-gray-600 mt-1">Gestion des instruments de couverture</p>
        </div>
        <Button className="bg-primary text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle couverture
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Taux de couverture</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">68,5%</div>
            <p className="text-sm text-gray-500">Exposition totale couverte</p>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Objectif de couverture</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">75%</div>
            <p className="text-sm text-gray-500">Cible définie par la politique</p>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-amber-600" />
              <span>Efficacité</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">92,3%</div>
            <p className="text-sm text-gray-500">Efficacité des couvertures</p>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Instruments de couverture actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Paire de devises</th>
                  <th className="text-left p-3">Montant</th>
                  <th className="text-left p-3">Échéance</th>
                  <th className="text-left p-3">Taux</th>
                  <th className="text-left p-3">P&L</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hedgingInstruments.map((instrument) => (
                  <tr key={instrument.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {instrument.type}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{instrument.currency}</td>
                    <td className="p-3">{instrument.amount}</td>
                    <td className="p-3">{instrument.maturity}</td>
                    <td className="p-3 font-mono">{instrument.rate}</td>
                    <td className="p-3 text-green-600 font-semibold">+2,3K €</td>
                    <td className="p-3">
                      <Button variant="outline" size="sm">Gérer</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Répartition par type d'instrument</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Forwards</span>
                <span className="text-sm text-blue-600 font-semibold">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Options</span>
                <span className="text-sm text-green-600 font-semibold">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '25%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Swaps</span>
                <span className="text-sm text-purple-600 font-semibold">15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{width: '15%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Performance des couvertures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800">P&L MTM Total</p>
                <p className="text-lg font-semibold text-green-600">+18,1K €</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-800">Meilleure performance</p>
                <p className="text-sm text-blue-600">Forward EUR/USD: +8,5K €</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-medium text-amber-800">À surveiller</p>
                <p className="text-sm text-amber-600">Option GBP/EUR expire dans 15j</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

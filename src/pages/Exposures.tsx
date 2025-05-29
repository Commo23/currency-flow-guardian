
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, DollarSign, Calendar, TrendingUp } from "lucide-react";

export default function Exposures() {
  const { t } = useLanguage();

  const exposureData = [
    { id: 1, currency: 'EUR', amount: 1200000, date: '2024-02-15', type: 'Encaissement' },
    { id: 2, currency: 'USD', amount: -800000, date: '2024-02-20', type: 'Décaissement' },
    { id: 3, currency: 'GBP', amount: 500000, date: '2024-03-01', type: 'Encaissement' },
    { id: 4, currency: 'JPY', amount: -300000, date: '2024-03-10', type: 'Décaissement' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('exposures')}</h1>
          <p className="text-gray-600 mt-1">Gestion des expositions de change</p>
        </div>
        <Button className="bg-primary text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle exposition
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Exposition totale</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">2,45M €</div>
            <p className="text-sm text-gray-500">Toutes devises confondues</p>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Échéances 30j</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">890K €</div>
            <p className="text-sm text-gray-500">Expositions à 30 jours</p>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <span>Risque moyen</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">Modéré</div>
            <p className="text-sm text-gray-500">Évaluation du risque</p>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Liste des expositions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Devise</th>
                  <th className="text-left p-3">Montant</th>
                  <th className="text-left p-3">Échéance</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exposureData.map((exposure) => (
                  <tr key={exposure.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{exposure.currency}</td>
                    <td className={`p-3 font-semibold ${exposure.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {exposure.amount >= 0 ? '+' : ''}{(exposure.amount / 1000).toFixed(0)}K €
                    </td>
                    <td className="p-3">{exposure.date}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        exposure.type === 'Encaissement' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {exposure.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button variant="outline" size="sm">Modifier</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

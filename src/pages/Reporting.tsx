
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Download, Calendar, BarChart } from "lucide-react";

export default function Reporting() {
  const { t } = useLanguage();

  const reports = [
    { name: 'Rapport mensuel', type: 'Synthèse', date: '2024-01-31', status: 'Généré' },
    { name: 'Analyse des risques', type: 'Détaillé', date: '2024-01-28', status: 'En cours' },
    { name: 'Performance couvertures', type: 'KPI', date: '2024-01-25', status: 'Généré' },
    { name: 'Exposition par filiale', type: 'Opérationnel', date: '2024-01-20', status: 'Généré' },
  ];

  const kpis = [
    { name: 'VaR 95%', value: '125K €', trend: '+5%' },
    { name: 'Expected Shortfall', value: '180K €', trend: '-2%' },
    { name: 'Ratio de Sharpe', value: '1.24', trend: '+8%' },
    { name: 'Tracking Error', value: '2.1%', trend: '+1%' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('reporting')}</h1>
          <p className="text-gray-600 mt-1">Rapports et indicateurs de performance</p>
        </div>
        <Button className="bg-primary text-white">
          <FileText className="h-4 w-4 mr-2" />
          Nouveau rapport
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="finance-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{kpi.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <div className={`text-sm mt-1 ${kpi.trend.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.trend} vs mois précédent
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Rapports disponibles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((report, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-gray-500">{report.type} - {report.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.status === 'Généré' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                    {report.status === 'Généré' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              <span>Générateur de rapports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type de rapport</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Synthèse mensuelle</option>
                  <option>Analyse détaillée</option>
                  <option>Rapport KPI</option>
                  <option>Exposition par entité</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Période</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" className="p-2 border rounded-md" />
                  <input type="date" className="p-2 border rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Devises</label>
                <select multiple className="w-full p-2 border rounded-md h-20">
                  <option>EUR</option>
                  <option>USD</option>
                  <option>GBP</option>
                  <option>JPY</option>
                  <option>CHF</option>
                </select>
              </div>
              <Button className="w-full bg-primary text-white">
                <FileText className="h-4 w-4 mr-2" />
                Générer le rapport
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-accent" />
            <span>Planification des rapports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Rapports quotidiens</h3>
              <p className="text-sm text-gray-600 mb-3">Position mark-to-market</p>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Rapports hebdomadaires</h3>
              <p className="text-sm text-gray-600 mb-3">Analyse des risques</p>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Rapports mensuels</h3>
              <p className="text-sm text-gray-600 mb-3">Synthèse direction</p>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

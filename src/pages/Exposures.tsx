import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExposures } from "@/contexts/ExposureContext";
import { useMetrics } from "@/contexts/MetricsContext";
import { AddExposureDialog } from "@/components/AddExposureDialog";
import { DollarSign, Calendar, TrendingUp, Edit, Trash2, BarChart } from "lucide-react";

export default function Exposures() {
  const { t } = useLanguage();
  const { exposures, addExposure, deleteExposure } = useExposures();
  const metrics = useMetrics();

  const exposures30Days = exposures.filter(exp => {
    const expDate = new Date(exp.date);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).reduce((sum, exp) => sum + Math.abs(exp.amount), 0);

  const getRiskLevel = () => {
    const positiveExposures = exposures.filter(exp => exp.amount > 0).length;
    const negativeExposures = exposures.filter(exp => exp.amount < 0).length;
    const ratio = positiveExposures / (positiveExposures + negativeExposures);
    
    if (ratio > 0.7) return t('language') === 'en' ? "Low" : "Faible";
    if (ratio > 0.4) return t('language') === 'en' ? "Medium" : "Modéré";
    return t('language') === 'en' ? "High" : "Élevé";
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('exposures')}</h1>
          <p className="text-gray-600 mt-1">{t('exposureManagement')}</p>
        </div>
        <AddExposureDialog onAddExposure={addExposure} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>{t('totalExposure')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(metrics.totalExposure / 1000000).toFixed(2)}M €
            </div>
            <p className="text-sm text-gray-500">{t('language') === 'en' ? 'All currencies combined' : 'Toutes devises confondues'}</p>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              <span>{t('totalNotional')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(metrics.totalNotional / 1000000).toFixed(2)}M €
            </div>
            <p className="text-sm text-gray-500">{t('language') === 'en' ? 'Hedging instruments' : 'Instruments de couverture'}</p>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              <span>{t('averageMaturity')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(metrics.averageMaturity)}{t('language') === 'en' ? 'd' : 'j'}
            </div>
            <p className="text-sm text-gray-500">{t('language') === 'en' ? 'Average maturity' : 'Échéance moyenne'}</p>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>{t('totalMTM')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(metrics.totalMTM / 1000).toFixed(0)}K €
            </div>
            <p className="text-sm text-gray-500">{t('language') === 'en' ? 'Mark-to-market value' : 'Valeur mark-to-market'}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Liste des expositions ({exposures.length})</CardTitle>
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
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exposures.map((exposure) => (
                  <tr key={exposure.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{exposure.currency}</td>
                    <td className={`p-3 font-semibold ${exposure.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {exposure.amount >= 0 ? '+' : ''}{(exposure.amount / 1000).toFixed(0)}K €
                    </td>
                    <td className="p-3">{new Date(exposure.date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        exposure.type === 'Encaissement' ? 'bg-green-100 text-green-800' : 
                        exposure.type === 'Décaissement' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {exposure.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                      {exposure.description}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteExposure(exposure.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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

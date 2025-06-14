
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { ExposureChart } from "@/components/ExposureChart";
import { CurrencyTable } from "@/components/CurrencyTable";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetrics } from "@/contexts/MetricsContext";
import { TrendingUp, TrendingDown, AlertTriangle, Shield, BarChart3, Calendar, DollarSign } from "lucide-react";

export default function Dashboard() {
  const { t } = useLanguage();
  const metrics = useMetrics();

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            {t('welcomeTitle')}
          </h1>
          <p className="text-gray-600 text-lg">Vue d'ensemble des expositions et couvertures de change</p>
        </div>
        <div className="text-right bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Dernière mise à jour</p>
          <p className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleDateString('fr-FR')} - {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t('globalExposure')}
          value={(metrics.totalExposure / 1000000).toFixed(2)}
          currency="M€"
          trend={2.3}
          subtitle="Exposition nette totale"
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
        />
        <MetricCard
          title={t('totalNotional')}
          value={(metrics.totalNotional / 1000000).toFixed(2)}
          currency="M€"
          trend={5.1}
          subtitle="Instruments de couverture"
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
        />
        <MetricCard
          title={t('hedgeRatio')}
          value={metrics.hedgeRatio.toFixed(1)}
          currency="%"
          trend={-1.2}
          subtitle="Taux de couverture"
          className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200"
        />
        <MetricCard
          title={t('unrealizedPnL')}
          value={(metrics.totalMTM / 1000).toFixed(0)}
          currency="K€"
          trend={15.7}
          subtitle="P&L latent sur couvertures"
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
        />
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xl font-semibold">Expositions par Devise</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExposureChart />
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xl font-semibold">Répartition des Risques</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Risque Faible</span>
                  <span className="text-sm text-green-700 font-bold bg-green-100 px-2 py-1 rounded-full">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full shadow-sm transition-all duration-700 ease-out" style={{width: '45%'}}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Risque Modéré</span>
                  <span className="text-sm text-amber-700 font-bold bg-amber-100 px-2 py-1 rounded-full">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-3 rounded-full shadow-sm transition-all duration-700 ease-out" style={{width: '35%'}}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Risque Élevé</span>
                  <span className="text-sm text-red-700 font-bold bg-red-100 px-2 py-1 rounded-full">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full shadow-sm transition-all duration-700 ease-out" style={{width: '20%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currency Details Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-xl font-semibold">Détail par Devise</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencyTable />
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card className="bg-white/70 backdrop-blur-sm border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-xl font-semibold text-amber-800">{t('alerts')} Actives</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-md transition-all duration-200">
              <div className="space-y-1">
                <p className="font-semibold text-amber-900">Volatilité EUR/USD élevée</p>
                <p className="text-sm text-amber-700">Volatilité 30j > 15% - Recommandation: augmenter la couverture</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Il y a 2h</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
              <div className="space-y-1">
                <p className="font-semibold text-blue-900">Échéance proche GBP</p>
                <p className="text-sm text-blue-700">Forward GBP/EUR expire dans 5 jours - Montant: 500K€</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Il y a 1j</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

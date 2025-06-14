
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
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent animate-fade-in">
            {t('welcomeTitle')}
          </h1>
          <p className="text-slate-600 text-xl font-medium">Vue d'ensemble des expositions et couvertures de change</p>
        </div>
        <div className="text-right bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Dernière mise à jour</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {new Date().toLocaleDateString('fr-FR')} - {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard
          title={t('globalExposure')}
          value={(metrics.totalExposure / 1000000).toFixed(2)}
          currency="M€"
          trend={2.3}
          subtitle="Exposition nette totale"
          className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-emerald-200/60 hover:border-emerald-300 transform hover:-translate-y-2 transition-all duration-300"
        />
        <MetricCard
          title={t('totalNotional')}
          value={(metrics.totalNotional / 1000000).toFixed(2)}
          currency="M€"
          trend={5.1}
          subtitle="Instruments de couverture"
          className="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 border-blue-200/60 hover:border-blue-300 transform hover:-translate-y-2 transition-all duration-300"
        />
        <MetricCard
          title={t('hedgeRatio')}
          value={metrics.hedgeRatio.toFixed(1)}
          currency="%"
          trend={-1.2}
          subtitle="Taux de couverture"
          className="bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 border-purple-200/60 hover:border-purple-300 transform hover:-translate-y-2 transition-all duration-300"
        />
        <MetricCard
          title={t('unrealizedPnL')}
          value={(metrics.totalMTM / 1000).toFixed(0)}
          currency="K€"
          trend={15.7}
          subtitle="P&L latent sur couvertures"
          className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-200/60 hover:border-amber-300 transform hover:-translate-y-2 transition-all duration-300"
        />
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-sm">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">Expositions par Devise</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExposureChart />
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl shadow-sm">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">Répartition des Risques</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Risque Faible</span>
                  <span className="text-sm text-green-800 font-bold bg-green-100 px-3 py-1.5 rounded-full shadow-sm">45%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-4 rounded-full shadow-sm transition-all duration-1000 ease-out animate-fade-in" style={{width: '45%'}}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Risque Modéré</span>
                  <span className="text-sm text-amber-800 font-bold bg-amber-100 px-3 py-1.5 rounded-full shadow-sm">35%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-4 rounded-full shadow-sm transition-all duration-1000 ease-out animate-fade-in" style={{width: '35%'}}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Risque Élevé</span>
                  <span className="text-sm text-red-800 font-bold bg-red-100 px-3 py-1.5 rounded-full shadow-sm">20%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-red-500 to-pink-400 h-4 rounded-full shadow-sm transition-all duration-1000 ease-out animate-fade-in" style={{width: '20%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currency Details Table */}
      <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl shadow-sm">
              <TrendingDown className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold text-slate-800">Détail par Devise</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencyTable />
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card className="bg-white/80 backdrop-blur-md border-l-4 border-l-amber-500 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl shadow-sm">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-amber-800">{t('alerts')} Actives</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border border-amber-200/60 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="space-y-2">
                <p className="font-bold text-amber-900 text-lg">Volatilité EUR/USD élevée</p>
                <p className="text-sm text-amber-700">Volatilité 30j supérieure à 15% - Recommandation: augmenter la couverture</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-amber-700 bg-amber-100 px-3 py-2 rounded-full font-semibold shadow-sm">Il y a 2h</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 rounded-2xl border border-blue-200/60 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="space-y-2">
                <p className="font-bold text-blue-900 text-lg">Échéance proche GBP</p>
                <p className="text-sm text-blue-700">Forward GBP/EUR expire dans 5 jours - Montant: 500K€</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-blue-700 bg-blue-100 px-3 py-2 rounded-full font-semibold shadow-sm">Il y a 1j</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

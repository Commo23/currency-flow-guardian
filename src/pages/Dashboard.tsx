
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { ExposureChart } from "@/components/ExposureChart";
import { CurrencyTable } from "@/components/CurrencyTable";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from "lucide-react";

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('welcomeTitle')}</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble des expositions et couvertures</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Dernière mise à jour</p>
          <p className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleDateString('fr-FR')} - {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t('globalExposure')}
          value="1,67M"
          currency="€"
          trend={2.3}
          subtitle="Exposition nette totale"
        />
        <MetricCard
          title={t('hedgeRatio')}
          value="68,5"
          currency="%"
          trend={-1.2}
          subtitle="Taux de couverture moyen"
        />
        <MetricCard
          title={t('unrealizedPnL')}
          value="+18,1K"
          currency="€"
          trend={15.7}
          subtitle="P&L latent sur couvertures"
        />
        <MetricCard
          title="Volatilité"
          value="12,4"
          currency="%"
          trend={-0.8}
          subtitle="Volatilité moyenne 30j"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Expositions par Devise</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExposureChart />
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Répartition des Risques</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Risque Faible</span>
                <span className="text-sm text-green-600 font-semibold">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Risque Modéré</span>
                <span className="text-sm text-yellow-600 font-semibold">35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{width: '35%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Risque Élevé</span>
                <span className="text-sm text-red-600 font-semibold">20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{width: '20%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currency Table */}
      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-accent" />
            <span>Détail par Devise</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencyTable />
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card className="finance-card border-l-4 border-l-amber-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-amber-800">{t('alerts')} Actives</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div>
                <p className="font-medium text-amber-800">Volatilité EUR/USD élevée</p>
                <p className="text-sm text-amber-600">Volatilité 30j > 15% - Recommandation: augmenter la couverture</p>
              </div>
              <span className="text-xs text-amber-600">Il y a 2h</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">Échéance proche GBP</p>
                <p className="text-sm text-blue-600">Forward GBP/EUR expire dans 5 jours - Montant: 500K€</p>
              </div>
              <span className="text-xs text-blue-600">Il y a 1j</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

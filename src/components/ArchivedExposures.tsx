
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Archive, Eye, EyeOff, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface ArchivedExposure {
  id: number;
  currency: string;
  amount: number;
  date: string;
  type: string;
  description?: string;
  archivedAt: string;
}

interface ArchiveKPIs {
  totalArchived: number;
  yearlyVolume: number;
  profitableExposures: number;
  averageMaturity: number;
}

interface ArchivedExposuresProps {
  archivedExposures: ArchivedExposure[];
}

export function ArchivedExposures({ archivedExposures }: ArchivedExposuresProps) {
  const { t } = useLanguage();
  const [showArchived, setShowArchived] = useState(false);

  const calculateKPIs = (): ArchiveKPIs => {
    const currentYear = new Date().getFullYear();
    const yearlyExposures = archivedExposures.filter(exp => 
      new Date(exp.archivedAt).getFullYear() === currentYear
    );

    return {
      totalArchived: archivedExposures.length,
      yearlyVolume: yearlyExposures.reduce((sum, exp) => sum + Math.abs(exp.amount), 0),
      profitableExposures: yearlyExposures.filter(exp => exp.amount > 0).length,
      averageMaturity: yearlyExposures.length > 0 ? 
        yearlyExposures.reduce((sum, exp) => {
          const days = Math.ceil((new Date(exp.date).getTime() - new Date(exp.archivedAt).getTime()) / (1000 * 60 * 60 * 24));
          return sum + Math.abs(days);
        }, 0) / yearlyExposures.length : 0
    };
  };

  const kpis = calculateKPIs();

  return (
    <div className="space-y-6">
      {/* KPIs Section */}
      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Archive className="h-5 w-5 text-amber-600" />
            <span>Archives - KPIs {new Date().getFullYear()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{kpis.totalArchived}</div>
              <p className="text-sm text-gray-500">Total archivé</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(kpis.yearlyVolume / 1000000).toFixed(1)}M €
              </div>
              <p className="text-sm text-gray-500">Volume annuel</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{kpis.profitableExposures}</div>
              <p className="text-sm text-gray-500">Encaissements</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(kpis.averageMaturity)}j
              </div>
              <p className="text-sm text-gray-500">Durée moyenne</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toggle Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Expositions archivées ({archivedExposures.length})</h3>
        <Button
          variant="outline"
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center space-x-2"
        >
          {showArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{showArchived ? 'Masquer' : 'Afficher'}</span>
        </Button>
      </div>

      {/* Archived Exposures Table */}
      {showArchived && (
        <Card className="finance-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium">Devise</th>
                    <th className="text-left p-3 font-medium">Montant</th>
                    <th className="text-left p-3 font-medium">Date échéance</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Archivé le</th>
                    <th className="text-left p-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedExposures.map((exposure) => (
                    <tr key={exposure.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{exposure.currency}</td>
                      <td className={`p-3 font-semibold ${exposure.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {exposure.amount >= 0 ? '+' : ''}{(exposure.amount / 1000).toFixed(0)}K €
                      </td>
                      <td className="p-3">{new Date(exposure.date).toLocaleDateString('fr-FR')}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-xs">
                          {exposure.type}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(exposure.archivedAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                        {exposure.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

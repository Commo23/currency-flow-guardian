import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHedging } from "@/contexts/HedgingContext";
import { AddHedgingDialog } from "@/components/AddHedgingDialog";
import { GreeksDisplay } from "@/components/GreeksDisplay";
import { Shield, TrendingUp, Calendar, Edit, Trash2, Eye } from "lucide-react";

export default function Hedging() {
  const { t } = useLanguage();
  const { hedgingInstruments, addHedgingInstrument, deleteHedgingInstrument } = useHedging();
  const [selectedInstrument, setSelectedInstrument] = useState<number | null>(null);

  const totalNotional = hedgingInstruments.reduce((sum, inst) => sum + inst.amount, 0);
  const totalMTM = hedgingInstruments.reduce((sum, inst) => sum + inst.mtm, 0);
  const avgMaturity = hedgingInstruments.length > 0 ? 
    hedgingInstruments.reduce((sum, inst) => {
      const days = Math.ceil((new Date(inst.maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0) / hedgingInstruments.length : 0;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('hedging')}</h1>
          <p className="text-gray-600 mt-1">Gestion des instruments de couverture</p>
        </div>
        <AddHedgingDialog onAddHedging={addHedgingInstrument} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Notionnel total</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(totalNotional / 1000000).toFixed(2)}M €
            </div>
            <p className="text-sm text-gray-500">{hedgingInstruments.length} instruments</p>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>MTM Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalMTM >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalMTM >= 0 ? '+' : ''}{(totalMTM / 1000).toFixed(1)}K €
            </div>
            <p className="text-sm text-gray-500">Mark-to-Market</p>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              <span>Échéance moyenne</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{Math.round(avgMaturity)} jours</div>
            <p className="text-sm text-gray-500">Durée moyenne résiduelle</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card className="finance-card">
            <CardHeader>
              <CardTitle>Instruments de couverture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Devise</th>
                      <th className="text-left p-3">Notionnel</th>
                      <th className="text-left p-3">Taux/Strike</th>
                      <th className="text-left p-3">Échéance</th>
                      <th className="text-left p-3">Prime</th>
                      <th className="text-left p-3">MTM</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hedgingInstruments.map((instrument) => (
                      <tr key={instrument.id} className={`border-b hover:bg-gray-50 ${selectedInstrument === instrument.id ? 'bg-blue-50' : ''}`}>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            instrument.type === 'Forward' ? 'bg-blue-100 text-blue-800' :
                            instrument.type.includes('Option') ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {instrument.type}
                          </span>
                        </td>
                        <td className="p-3 font-medium">{instrument.currency}</td>
                        <td className="p-3">{(instrument.amount / 1000).toFixed(0)}K</td>
                        <td className="p-3 font-mono text-sm">{instrument.rate.toFixed(4)}</td>
                        <td className="p-3">{new Date(instrument.maturity).toLocaleDateString('fr-FR')}</td>
                        <td className="p-3">
                          {instrument.premium ? `${(instrument.premium / 1000).toFixed(1)}K €` : '-'}
                        </td>
                        <td className={`p-3 font-semibold ${instrument.mtm >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {instrument.mtm >= 0 ? '+' : ''}{(instrument.mtm / 1000).toFixed(1)}K €
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedInstrument(selectedInstrument === instrument.id ? null : instrument.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => deleteHedgingInstrument(instrument.id)}
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
                {hedgingInstruments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucun instrument de couverture. Ajoutez-en un pour commencer.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1">
          {selectedInstrument && (
            <GreeksDisplay 
              instrument={hedgingInstruments.find(inst => inst.id === selectedInstrument)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

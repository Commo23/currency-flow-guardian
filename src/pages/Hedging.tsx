
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHedging } from "@/contexts/HedgingContext";
import { useMarketData } from "@/contexts/MarketDataContext";
import { AddHedgingDialog } from "@/components/AddHedgingDialog";
import { GreeksDisplay } from "@/components/GreeksDisplay";
import { calculateMTM, calculateTheoreticalPrice } from "@/utils/financialCalculations";
import { Shield, TrendingUp, Calendar, Edit, Trash2, Eye, BarChart3, DollarSign } from "lucide-react";

export default function Hedging() {
  const { t } = useLanguage();
  const { hedgingInstruments, addHedgingInstrument, deleteHedgingInstrument } = useHedging();
  const { marketData } = useMarketData();
  const [selectedInstrument, setSelectedInstrument] = useState<number | null>(null);
  const [filter, setFilter] = useState('All');

  const totalNotional = hedgingInstruments.reduce((sum, inst) => sum + Math.abs(inst.amount), 0);
  const totalMTM = hedgingInstruments.reduce((sum, inst) => sum + inst.mtm, 0);
  const avgMaturity = hedgingInstruments.length > 0 ? 
    hedgingInstruments.reduce((sum, inst) => {
      const days = Math.ceil((new Date(inst.maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(0, days);
    }, 0) / hedgingInstruments.length : 0;

  const nearMaturity = hedgingInstruments.filter(inst => {
    const days = Math.ceil((new Date(inst.maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days > 0;
  }).length;

  const filteredInstruments = hedgingInstruments.filter(inst => {
    if (filter === 'All') return true;
    if (filter === 'Forwards') return inst.type === 'Forward';
    if (filter === 'Options') return inst.type.includes('Call') || inst.type.includes('Put');
    if (filter === 'Swaps') return inst.type === 'Swap';
    return true;
  });

  const getInstrumentType = (type: string) => {
    if (type === 'Forward') return 'Forward';
    if (type === 'Swap') return 'Swap';
    if (type.includes('Call') || type.includes('Put')) return 'Option';
    return 'Other';
  };

  const getEffectiveness = (instrument: any) => {
    // Simplified effectiveness calculation
    const timeToMaturity = Math.max(0, (new Date(instrument.maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365));
    const effectiveness = Math.max(70, Math.min(99, 95 - (timeToMaturity * 10)));
    return effectiveness;
  };

  const getVolatility = (currency: string) => {
    return (marketData.volatilities[`EUR${currency}`] || 0.15) * 100;
  };

  const getTimeToMaturity = (maturity: string) => {
    const days = Math.ceil((new Date(maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
            Instruments de Couverture
          </h1>
          <p className="text-slate-600 text-lg">Gestion des forwards, options, swaps et autres instruments de hedging</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right bg-white/90 backdrop-blur-md rounded-xl p-4 border border-slate-200/60 shadow-lg">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Valuation Date</p>
            <p className="text-lg font-bold text-slate-900">
              {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => {
              // Trigger recalculation of all MTM
              console.log('Recalculating all MTM...');
            }}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Recalculate All MTM
          </Button>
          <AddHedgingDialog onAddHedging={addHedgingInstrument} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-slate-600">Total Notional</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${(totalNotional / 1000000).toFixed(2)}M
            </div>
            <p className="text-sm text-slate-500">{hedgingInstruments.length} instruments</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm text-slate-600">Mark-to-Market</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalMTM >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalMTM / 1000).toFixed(1)}K
            </div>
            <p className="text-sm text-slate-500">Unrealized P&L</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-sm text-slate-600">Hedge Accounting</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {hedgingInstruments.filter(inst => getEffectiveness(inst) >= 80).length}
            </div>
            <p className="text-sm text-slate-500">Qualifying instruments</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-sm text-slate-600">Near Maturity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{nearMaturity}</div>
            <p className="text-sm text-slate-500">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {['All', 'Forwards', 'Options', 'Swaps'].map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? "default" : "outline"}
            onClick={() => setFilter(filterType)}
            className={filter === filterType ? "bg-blue-600 text-white" : ""}
          >
            {filterType}
          </Button>
        ))}
      </div>

      {/* Instruments Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Card className="bg-white/90 backdrop-blur-md border-slate-200/60 shadow-xl">
            <CardHeader>
              <CardTitle>Hedging Instruments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-3 font-semibold text-slate-700">ID</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Type</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Currency Pair</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Quantity</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Rate/Strike</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Today Price</th>
                      <th className="text-left p-3 font-semibold text-slate-700">MTM</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Theoretical Price</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Time to Maturity</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Volatility</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Effectiveness</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstruments.map((instrument, index) => {
                      const ttm = getTimeToMaturity(instrument.maturity);
                      const effectiveness = getEffectiveness(instrument);
                      const volatility = getVolatility(instrument.currency);
                      const spotRate = marketData.spotRates[`EUR${instrument.currency}`] || 1;
                      const theoreticalPrice = calculateTheoreticalPrice(instrument, {
                        spotRates: marketData.spotRates,
                        volatilities: marketData.volatilities,
                        riskFreeRate: marketData.riskFreeRate
                      });
                      
                      return (
                        <tr key={instrument.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedInstrument === instrument.id ? 'bg-blue-50' : ''}`}>
                          <td className="p-3">
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                              HDG-{String(index + 1).padStart(3, '0')}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                getInstrumentType(instrument.type) === 'Forward' ? 'bg-blue-400' :
                                getInstrumentType(instrument.type) === 'Option' ? 'bg-purple-400' :
                                'bg-green-400'
                              }`}></div>
                              <span className="font-medium">{instrument.type}</span>
                            </div>
                          </td>
                          <td className="p-3 font-semibold">EUR/{instrument.currency}</td>
                          <td className="p-3">${(Math.abs(instrument.amount) / 1000).toFixed(0)}K</td>
                          <td className="p-3 font-mono text-xs">{instrument.rate.toFixed(4)}</td>
                          <td className="p-3 font-mono text-xs text-blue-600 font-semibold">{spotRate.toFixed(4)}</td>
                          <td className={`p-3 font-semibold ${instrument.mtm >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {instrument.mtm >= 0 ? '+' : ''}${(instrument.mtm / 1000).toFixed(1)}K
                          </td>
                          <td className="p-3 font-mono text-xs">
                            ${(theoreticalPrice / 1000).toFixed(1)}K
                          </td>
                          <td className="p-3">{ttm}d</td>
                          <td className="p-3">{volatility.toFixed(1)}%</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-slate-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${effectiveness >= 80 ? 'bg-blue-500' : 'bg-red-500'}`}
                                  style={{width: `${effectiveness}%`}}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold">{effectiveness.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={ttm > 0 ? "default" : "destructive"} className="text-xs">
                              {ttm > 0 ? 'Active' : 'Expired'}
                            </Badge>
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
                      );
                    })}
                  </tbody>
                </table>
                {filteredInstruments.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Aucun instrument trouvé</p>
                    <p className="text-sm">Ajoutez un instrument pour commencer</p>
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

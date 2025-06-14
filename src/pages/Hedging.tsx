
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHedging } from "@/contexts/HedgingContext";
import { useMarketData } from "@/contexts/MarketDataContext";
import { AddHedgingDialog } from "@/components/AddHedgingDialog";
import { GreeksDisplay } from "@/components/GreeksDisplay";
import { MarketDataSettings } from "@/components/MarketDataSettings";
import { calculateMTM, calculateTheoreticalPrice } from "@/utils/financialCalculations";
import { Shield, TrendingUp, Calendar, Edit, Trash2, Eye, BarChart3, DollarSign, Settings, RefreshCw } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";

export default function Hedging() {
  const { t } = useLanguage();
  const { hedgingInstruments, addHedgingInstrument, deleteHedgingInstrument, updateHedgingInstrument } = useHedging();
  const { marketData } = useMarketData();
  const [selectedInstrument, setSelectedInstrument] = useState<number | null>(null);
  const [filter, setFilter] = useState('All');
  const [showMarketSettings, setShowMarketSettings] = useState(false);

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

  const getEffectiveness = (instrument: any) => {
    const timeToMaturity = Math.max(0, (new Date(instrument.maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365));
    const effectiveness = Math.max(70, Math.min(99, 95 - (timeToMaturity * 10)));
    return effectiveness;
  };

  const getTimeToMaturity = (maturity: string) => {
    const days = Math.ceil((new Date(maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const getAbsoluteValue = (value: number, type: string, spotRate: number) => {
    if (type === 'percentage') {
      return spotRate * (value / 100);
    }
    return value;
  };

  const recalculateAllMTM = () => {
    console.log('Recalculating all MTM with current market data...');
    hedgingInstruments.forEach(instrument => {
      const newMTM = calculateMTM(instrument, marketData);
      updateHedgingInstrument(instrument.id, { mtm: newMTM });
    });
  };

  return (
    <div className="space-y-6 p-6">
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
            variant="outline"
            onClick={() => setShowMarketSettings(!showMarketSettings)}
            className="bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Settings className="h-4 w-4 mr-2" />
            Données de Marché
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={recalculateAllMTM}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalculer MTM
          </Button>
          <AddHedgingDialog onAddHedging={addHedgingInstrument} />
        </div>
      </div>

      {/* Market Data Settings */}
      {showMarketSettings && (
        <MarketDataSettings />
      )}

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
              €{(totalNotional / 1000000).toFixed(2)}M
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
              €{(totalMTM / 1000).toFixed(1)}K
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

      {/* Hedging Instruments Table */}
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Instruments de Couverture
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Devise</th>
                  <th className="p-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Nominal</th>
                  <th className="p-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Strike/Taux</th>
                  <th className="p-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Barrière</th>
                  <th className="p-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Prime</th>
                  <th className="p-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">MTM</th>
                  <th className="p-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Prix Théo</th>
                  <th className="p-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">TTM (j)</th>
                  <th className="p-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Vol Impl (%)</th>
                  <th className="p-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Taux (%)</th>
                  <th className="p-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Efficacité</th>
                  <th className="p-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInstruments.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-slate-500">
                      Aucun instrument trouvé
                    </td>
                  </tr>
                ) : (
                  filteredInstruments.map((instrument, index) => {
                    const ttm = getTimeToMaturity(instrument.maturity);
                    const effectiveness = getEffectiveness(instrument);
                    const spotRate = marketData.spotRates[`EUR${instrument.currency}`] || 1;
                    
                    // Calcul des valeurs absolues pour affichage
                    const displayStrike = getAbsoluteValue(instrument.rate, instrument.strikeType, spotRate);
                    
                    let displayBarrier = '';
                    if (instrument.barrier) {
                      const absBarrier = getAbsoluteValue(instrument.barrier, instrument.barrierType, spotRate);
                      displayBarrier = absBarrier.toFixed(4);
                    } else if (instrument.lowerBarrier && instrument.upperBarrier) {
                      const lowerAbs = getAbsoluteValue(instrument.lowerBarrier, instrument.barrierType, spotRate);
                      const upperAbs = getAbsoluteValue(instrument.upperBarrier, instrument.barrierType, spotRate);
                      displayBarrier = `${lowerAbs.toFixed(4)} / ${upperAbs.toFixed(4)}`;
                    }
                    
                    // Calcul du prix théorique avec paramètres de l'instrument
                    const instrumentMarketData = {
                      spotRates: marketData.spotRates,
                      volatilities: instrument.impliedVolatility ? 
                        { [`EUR${instrument.currency}`]: instrument.impliedVolatility } : 
                        marketData.volatilities,
                      riskFreeRate: instrument.riskFreeRate || marketData.riskFreeRate
                    };
                    
                    const theoreticalPrice = calculateTheoreticalPrice(instrument, instrumentMarketData);
                    
                    // Affichage de la volatilité et du taux utilisés
                    const displayVolatility = instrument.impliedVolatility ? 
                      (instrument.impliedVolatility * 100).toFixed(1) + ' (impl)' : 
                      ((marketData.volatilities[`EUR${instrument.currency}`] || 0.15) * 100).toFixed(1) + ' (mkt)';
                    
                    const displayRate = instrument.riskFreeRate ? 
                      (instrument.riskFreeRate * 100).toFixed(2) + ' (inst)' : 
                      (marketData.riskFreeRate * 100).toFixed(2) + ' (mkt)';

                    return (
                      <tr 
                        key={instrument.id} 
                        className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}
                      >
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              instrument.type.includes('Call') ? 'bg-green-500' :
                              instrument.type.includes('Put') ? 'bg-red-500' :
                              instrument.type === 'Forward' ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}></div>
                            <span className="font-medium text-slate-700">{instrument.type}</span>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{instrument.currency}</td>
                        <td className="p-3 text-right font-medium">
                          €{instrument.amount.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {displayStrike.toFixed(4)}
                        </td>
                        <td className="p-3 text-right text-sm text-slate-600">
                          {displayBarrier || '-'}
                        </td>
                        <td className="p-3 text-right text-sm">
                          {instrument.premium ? `€${instrument.premium.toLocaleString()}` : '-'}
                        </td>
                        <td className={`p-3 text-right font-bold ${
                          instrument.mtm >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          €{instrument.mtm.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-sm text-blue-600">
                          {theoreticalPrice.toFixed(6)}
                        </td>
                        <td className="p-3 text-center">{ttm}</td>
                        <td className="p-3 text-center text-sm">
                          <span className={instrument.impliedVolatility ? 'text-orange-600 font-semibold' : 'text-slate-500'}>
                            {displayVolatility}
                          </span>
                        </td>
                        <td className="p-3 text-center text-sm">
                          <span className={instrument.riskFreeRate ? 'text-blue-600 font-semibold' : 'text-slate-500'}>
                            {displayRate}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  effectiveness >= 80 ? 'bg-green-500' :
                                  effectiveness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(effectiveness, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-slate-600">
                              {effectiveness.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedInstrument(
                                selectedInstrument === instrument.id ? null : instrument.id
                              )}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-slate-100"
                            >
                              <Edit className="h-4 w-4 text-slate-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteHedgingInstrument(instrument.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Greeks Display */}
      {selectedInstrument && (
        <GreeksDisplay 
          instrument={hedgingInstruments.find(inst => inst.id === selectedInstrument)} 
        />
      )}
    </div>
  );
}

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
import { Shield, TrendingUp, Calendar, Edit, Trash2, Eye, BarChart3, DollarSign, Settings } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";

export default function Hedging() {
  const { t } = useLanguage();
  const { hedgingInstruments, addHedgingInstrument, deleteHedgingInstrument } = useHedging();
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
    // Utiliser d'abord la volatilité implicite de l'instrument, sinon celle du marché
    return (instrument: any) => {
      if (instrument.impliedVolatility) {
        return instrument.impliedVolatility * 100; // Convertir en pourcentage
      }
      return (marketData.volatilities[`EUR${currency}`] || 0.15) * 100;
    };
  };

  const getRiskFreeRate = (instrument: any) => {
    // Utiliser d'abord le taux spécifique de l'instrument, sinon celui du marché
    if (instrument.riskFreeRate) {
      return instrument.riskFreeRate;
    }
    return marketData.riskFreeRate;
  };

  const getTimeToMaturity = (maturity: string) => {
    const days = Math.ceil((new Date(maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  // Convert percentage values to absolute values for display
  const getAbsoluteStrike = (instrument: any) => {
    const spotRate = marketData.spotRates[`EUR${instrument.currency}`] || 1;
    if (instrument.strikeType === 'percentage') {
      return spotRate * (instrument.rate / 100);
    }
    return instrument.rate;
  };

  const getAbsoluteBarrier = (instrument: any) => {
    const spotRate = marketData.spotRates[`EUR${instrument.currency}`] || 1;
    if (instrument.barrierType === 'percentage' && instrument.barrier) {
      return spotRate * (instrument.barrier / 100);
    }
    return instrument.barrier;
  };

  const getAbsoluteLowerBarrier = (instrument: any) => {
    const spotRate = marketData.spotRates[`EUR${instrument.currency}`] || 1;
    if (instrument.barrierType === 'percentage' && instrument.lowerBarrier) {
      return spotRate * (instrument.lowerBarrier / 100);
    }
    return instrument.lowerBarrier;
  };

  const getAbsoluteUpperBarrier = (instrument: any) => {
    const spotRate = marketData.spotRates[`EUR${instrument.currency}`] || 1;
    if (instrument.barrierType === 'percentage' && instrument.upperBarrier) {
      return spotRate * (instrument.upperBarrier / 100);
    }
    return instrument.upperBarrier;
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

      {/* Hedging Instruments Table */}
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Instruments de Couverture
            </CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Tous</SelectItem>
                  <SelectItem value="Options">Options</SelectItem>
                  <SelectItem value="Forwards">Forwards</SelectItem>
                  <SelectItem value="Swaps">Swaps</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  <th className="p-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Prix Théo/Unit</th>
                  <th className="p-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">TTM</th>
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
                    const instrumentVolatility = getVolatility(instrument.currency)(instrument);
                    const instrumentRiskFreeRate = getRiskFreeRate(instrument);
                    const spotRate = marketData.spotRates[`EUR${instrument.currency}`] || 1;
                    
                    // Calculate effective strike and barriers for display
                    let displayStrike = instrument.rate;
                    if (instrument.strikeType === 'percentage') {
                      displayStrike = spotRate * (instrument.rate / 100);
                    }

                    let displayBarrier = '';
                    if (instrument.barrier) {
                      if (instrument.barrierType === 'percentage') {
                        displayBarrier = (spotRate * (instrument.barrier / 100)).toFixed(4);
                      } else {
                        displayBarrier = instrument.barrier.toFixed(4);
                      }
                    } else if (instrument.lowerBarrier && instrument.upperBarrier) {
                      let lowerDisplay, upperDisplay;
                      if (instrument.barrierType === 'percentage') {
                        lowerDisplay = (spotRate * (instrument.lowerBarrier / 100)).toFixed(4);
                        upperDisplay = (spotRate * (instrument.upperBarrier / 100)).toFixed(4);
                      } else {
                        lowerDisplay = instrument.lowerBarrier.toFixed(4);
                        upperDisplay = instrument.upperBarrier.toFixed(4);
                      }
                      displayBarrier = `${lowerDisplay} / ${upperDisplay}`;
                    }
                    
                    // Calculate theoretical price per unit using instrument-specific parameters
                    const marketDataForCalc = {
                      spotRates: marketData.spotRates,
                      volatilities: instrument.impliedVolatility ? 
                        { [`EUR${instrument.currency}`]: instrument.impliedVolatility } : 
                        marketData.volatilities,
                      riskFreeRate: instrumentRiskFreeRate
                    };
                    
                    const theoreticalPriceTotal = calculateTheoreticalPrice(instrument, marketDataForCalc);
                    const theoreticalPricePerUnit = theoreticalPriceTotal;

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
                          {theoreticalPricePerUnit.toFixed(6)}
                        </td>
                        <td className="p-3">{ttm}d</td>
                        <td className="p-3 font-semibold text-orange-600">{instrumentVolatility.toFixed(1)}%</td>
                        <td className="p-3 font-semibold text-blue-600">{(instrumentRiskFreeRate * 100).toFixed(2)}%</td>
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

      {/* ... keep existing code (Greeks display) */}
    </div>
  );
}

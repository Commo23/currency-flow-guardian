
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useExposures } from './ExposureContext';
import { useHedging } from './HedgingContext';
import { useMarketData } from './MarketDataContext';
import { calculateMTM } from '@/utils/financialCalculations';

interface MetricsContextType {
  totalExposure: number;
  totalMTM: number;
  totalNotional: number;
  averageMaturity: number;
  analyzedExposure: number;
  hedgeRatio: number;
  unrealizedPnL: number;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};

interface MetricsProviderProps {
  children: ReactNode;
}

export const MetricsProvider: React.FC<MetricsProviderProps> = ({ children }) => {
  const { exposures, lastUpdated: exposuresLastUpdated } = useExposures();
  const { hedgingInstruments, lastUpdated: hedgingLastUpdated } = useHedging();
  const { marketData } = useMarketData();

  const metrics = useMemo(() => {
    console.log('Recalculating metrics - exposures updated:', exposuresLastUpdated, 'hedging updated:', hedgingLastUpdated);
    
    const now = new Date();
    
    const activeExposures = exposures.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= now;
    });
    
    const activeInstruments = hedgingInstruments.filter(inst => {
      const maturityDate = new Date(inst.maturity);
      return maturityDate >= now;
    });
    
    console.log('Active exposures:', activeExposures.length, 'Active instruments:', activeInstruments.length);
    
    const totalExposure = activeExposures.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
    const totalNotional = activeInstruments.reduce((sum, inst) => sum + Math.abs(inst.amount), 0);
    
    const totalMTM = activeInstruments.reduce((sum, inst) => {
      const mtm = calculateMTM(inst, {
        spotRates: marketData.spotRates,
        volatilities: marketData.volatilities,
        riskFreeRate: marketData.riskFreeRate
      });
      return sum + mtm;
    }, 0);
    
    const exposureMaturitySum = activeExposures.reduce((sum, exp) => {
      const expDate = new Date(exp.date);
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return sum + (diffDays * Math.abs(exp.amount));
    }, 0);
    
    const instrumentMaturitySum = activeInstruments.reduce((sum, inst) => {
      const instDate = new Date(inst.maturity);
      const diffTime = instDate.getTime() - now.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return sum + (diffDays * Math.abs(inst.amount));
    }, 0);
    
    const totalAmount = totalExposure + totalNotional;
    const averageMaturity = totalAmount > 0 ? 
      (exposureMaturitySum + instrumentMaturitySum) / totalAmount : 0;
    
    const analyzedExposure = totalExposure + totalNotional;
    const hedgeRatio = totalExposure > 0 ? (totalNotional / totalExposure) * 100 : 0;
    const unrealizedPnL = totalMTM;
    
    return {
      totalExposure,
      totalMTM,
      totalNotional,
      averageMaturity,
      analyzedExposure,
      hedgeRatio,
      unrealizedPnL
    };
  }, [exposures, hedgingInstruments, marketData, exposuresLastUpdated, hedgingLastUpdated]);

  return (
    <MetricsContext.Provider value={metrics}>
      {children}
    </MetricsContext.Provider>
  );
};

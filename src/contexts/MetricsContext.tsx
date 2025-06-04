
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useExposures } from './ExposureContext';
import { useHedging } from './HedgingContext';
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
  const { exposures } = useExposures();
  const { instruments } = useHedging();

  const metrics = useMemo(() => {
    console.log('Recalculating metrics with exposures:', exposures.length, 'instruments:', instruments.length);
    
    // Calculate total exposure (absolute values)
    const totalExposure = exposures.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
    
    // Calculate total notional for instruments
    const totalNotional = instruments.reduce((sum, inst) => sum + Math.abs(inst.amount), 0);
    
    // Calculate total MTM for instruments
    const totalMTM = instruments.reduce((sum, inst) => {
      const mtm = calculateMTM(inst);
      console.log(`MTM for ${inst.type} ${inst.currency}:`, mtm);
      return sum + mtm;
    }, 0);
    
    // Calculate average maturity (in days from now)
    const now = new Date();
    const exposureMaturitySum = exposures.reduce((sum, exp) => {
      const expDate = new Date(exp.date);
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + (diffDays * Math.abs(exp.amount));
    }, 0);
    
    const instrumentMaturitySum = instruments.reduce((sum, inst) => {
      const instDate = new Date(inst.maturity);
      const diffTime = instDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + (diffDays * Math.abs(inst.amount));
    }, 0);
    
    const totalAmount = totalExposure + totalNotional;
    const averageMaturity = totalAmount > 0 ? 
      (exposureMaturitySum + instrumentMaturitySum) / totalAmount : 0;
    
    // Calculate analyzed exposure (sum of exposure and notional)
    const analyzedExposure = totalExposure + totalNotional;
    
    // Calculate hedge ratio
    const hedgeRatio = totalExposure > 0 ? (totalNotional / totalExposure) * 100 : 0;
    
    // Unrealized P&L is the total MTM
    const unrealizedPnL = totalMTM;
    
    console.log('Calculated metrics:', {
      totalExposure,
      totalMTM,
      totalNotional,
      averageMaturity,
      analyzedExposure,
      hedgeRatio,
      unrealizedPnL
    });
    
    return {
      totalExposure,
      totalMTM,
      totalNotional,
      averageMaturity,
      analyzedExposure,
      hedgeRatio,
      unrealizedPnL
    };
  }, [exposures, instruments]);

  return (
    <MetricsContext.Provider value={metrics}>
      {children}
    </MetricsContext.Provider>
  );
};

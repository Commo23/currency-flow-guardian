
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { calculateMTM } from '@/utils/financialCalculations';

interface HedgingInstrument {
  id: number;
  type: string;
  currency: string;
  amount: number;
  rate: number;
  maturity: string;
  premium?: number;
  mtm: number;
  barrier?: number;
  barrierType?: 'percentage' | 'absolute';
  strikeType?: 'percentage' | 'absolute';
  knockDirection?: 'in' | 'out';
  barrierDirection?: 'up' | 'down';
  isReverse?: boolean;
  isDouble?: boolean;
  lowerBarrier?: number;
  upperBarrier?: number;
  rebate?: number;
}

interface HedgingContextType {
  hedgingInstruments: HedgingInstrument[];
  addHedgingInstrument: (instrument: Omit<HedgingInstrument, 'id' | 'mtm'>) => void;
  updateHedgingInstrument: (id: number, instrument: Partial<HedgingInstrument>) => void;
  deleteHedgingInstrument: (id: number) => void;
  lastUpdated: number; // Pour forcer les mises à jour
}

const HedgingContext = createContext<HedgingContextType | undefined>(undefined);

export const useHedging = () => {
  const context = useContext(HedgingContext);
  if (!context) {
    throw new Error('useHedging must be used within a HedgingProvider');
  }
  return context;
};

interface HedgingProviderProps {
  children: ReactNode;
}

export const HedgingProvider: React.FC<HedgingProviderProps> = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [hedgingInstruments, setHedgingInstruments] = useState<HedgingInstrument[]>([
    { id: 1, type: 'Forward', currency: 'USD', amount: 500000, rate: 1.0800, maturity: '2024-07-15', mtm: 2500, strikeType: 'absolute' },
    { id: 2, type: 'Put', currency: 'GBP', amount: 300000, rate: 0.8500, maturity: '2024-06-28', premium: 1200, mtm: -800, strikeType: 'absolute' },
    { id: 3, type: 'Call Knock-Out', currency: 'JPY', amount: 200000, rate: 160.00, maturity: '2024-08-10', premium: 800, barrier: 165.00, barrierType: 'absolute', strikeType: 'absolute', mtm: 1800 },
  ]);

  const addHedgingInstrument = (instrumentData: Omit<HedgingInstrument, 'id' | 'mtm'>) => {
    const newInstrument = {
      ...instrumentData,
      id: Math.max(...hedgingInstruments.map(h => h.id), 0) + 1,
      mtm: calculateMTM(instrumentData)
    };
    console.log('Adding new hedging instrument:', newInstrument);
    setHedgingInstruments(prev => [...prev, newInstrument]);
    setLastUpdated(Date.now());
  };

  const updateHedgingInstrument = (id: number, instrumentData: Partial<HedgingInstrument>) => {
    setHedgingInstruments(prev => prev.map(inst => {
      if (inst.id === id) {
        const updatedInst = { ...inst, ...instrumentData };
        return {
          ...updatedInst,
          mtm: calculateMTM(updatedInst)
        };
      }
      return inst;
    }));
    setLastUpdated(Date.now());
  };

  const deleteHedgingInstrument = (id: number) => {
    setHedgingInstruments(prev => prev.filter(inst => inst.id !== id));
    setLastUpdated(Date.now());
  };

  return (
    <HedgingContext.Provider value={{
      hedgingInstruments,
      addHedgingInstrument,
      updateHedgingInstrument,
      deleteHedgingInstrument,
      lastUpdated
    }}>
      {children}
    </HedgingContext.Provider>
  );
};

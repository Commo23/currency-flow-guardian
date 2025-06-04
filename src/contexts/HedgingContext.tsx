
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HedgingInstrument {
  id: number;
  type: string;
  currency: string;
  amount: number;
  rate: number;
  maturity: string;
  premium?: number;
  mtm: number;
}

interface HedgingContextType {
  hedgingInstruments: HedgingInstrument[];
  addHedgingInstrument: (instrument: Omit<HedgingInstrument, 'id' | 'mtm'>) => void;
  updateHedgingInstrument: (id: number, instrument: Partial<HedgingInstrument>) => void;
  deleteHedgingInstrument: (id: number) => void;
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
  const [hedgingInstruments, setHedgingInstruments] = useState<HedgingInstrument[]>([
    { id: 1, type: 'Forward', currency: 'USD', amount: 500000, rate: 1.0800, maturity: '2024-03-15', mtm: 2500 },
    { id: 2, type: 'Option Put', currency: 'GBP', amount: 300000, rate: 0.8500, maturity: '2024-02-28', premium: 1200, mtm: -800 },
    { id: 3, type: 'Forward', currency: 'JPY', amount: 200000, rate: 160.00, maturity: '2024-04-10', mtm: 1800 },
  ]);

  const calculateMTM = (instrument: Omit<HedgingInstrument, 'id' | 'mtm'>) => {
    // Simulation simple du MTM
    return Math.random() * 10000 - 5000;
  };

  const addHedgingInstrument = (instrumentData: Omit<HedgingInstrument, 'id' | 'mtm'>) => {
    const newInstrument = {
      ...instrumentData,
      id: Math.max(...hedgingInstruments.map(h => h.id), 0) + 1,
      mtm: calculateMTM(instrumentData)
    };
    setHedgingInstruments(prev => [...prev, newInstrument]);
  };

  const updateHedgingInstrument = (id: number, instrumentData: Partial<HedgingInstrument>) => {
    setHedgingInstruments(prev => prev.map(inst => 
      inst.id === id ? { ...inst, ...instrumentData } : inst
    ));
  };

  const deleteHedgingInstrument = (id: number) => {
    setHedgingInstruments(prev => prev.filter(inst => inst.id !== id));
  };

  return (
    <HedgingContext.Provider value={{
      hedgingInstruments,
      addHedgingInstrument,
      updateHedgingInstrument,
      deleteHedgingInstrument
    }}>
      {children}
    </HedgingContext.Provider>
  );
};

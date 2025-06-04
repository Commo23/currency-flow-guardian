
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Exposure {
  id: number;
  currency: string;
  amount: number;
  date: string;
  type: string;
  description?: string;
}

interface ExposureContextType {
  exposures: Exposure[];
  addExposure: (exposure: Omit<Exposure, 'id'>) => void;
  updateExposure: (id: number, exposure: Partial<Exposure>) => void;
  deleteExposure: (id: number) => void;
}

const ExposureContext = createContext<ExposureContextType | undefined>(undefined);

export const useExposures = () => {
  const context = useContext(ExposureContext);
  if (!context) {
    throw new Error('useExposures must be used within an ExposureProvider');
  }
  return context;
};

interface ExposureProviderProps {
  children: ReactNode;
}

export const ExposureProvider: React.FC<ExposureProviderProps> = ({ children }) => {
  const [exposures, setExposures] = useState<Exposure[]>([
    { id: 1, currency: 'EUR', amount: 1200000, date: '2024-02-15', type: 'Encaissement', description: 'Vente export' },
    { id: 2, currency: 'USD', amount: -800000, date: '2024-02-20', type: 'Décaissement', description: 'Achat matières premières' },
    { id: 3, currency: 'GBP', amount: 500000, date: '2024-03-01', type: 'Encaissement', description: 'Contrat service' },
    { id: 4, currency: 'JPY', amount: -300000, date: '2024-03-10', type: 'Décaissement', description: 'Fournisseur Japon' },
  ]);

  const addExposure = (exposureData: Omit<Exposure, 'id'>) => {
    const newExposure = {
      ...exposureData,
      id: Math.max(...exposures.map(e => e.id), 0) + 1
    };
    setExposures(prev => [...prev, newExposure]);
  };

  const updateExposure = (id: number, exposureData: Partial<Exposure>) => {
    setExposures(prev => prev.map(exp => 
      exp.id === id ? { ...exp, ...exposureData } : exp
    ));
  };

  const deleteExposure = (id: number) => {
    setExposures(prev => prev.filter(exp => exp.id !== id));
  };

  return (
    <ExposureContext.Provider value={{
      exposures,
      addExposure,
      updateExposure,
      deleteExposure
    }}>
      {children}
    </ExposureContext.Provider>
  );
};


import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Exposure {
  id: number;
  currency: string;
  amount: number;
  date: string;
  type: string;
  description?: string;
}

interface ArchivedExposure extends Exposure {
  archivedAt: string;
}

interface ExposureContextType {
  exposures: Exposure[];
  archivedExposures: ArchivedExposure[];
  addExposure: (exposure: Omit<Exposure, 'id'>) => void;
  updateExposure: (id: number, exposure: Partial<Exposure>) => void;
  deleteExposure: (id: number) => void;
  archiveExpiredExposures: () => void;
  lastUpdated: number; // Pour forcer les mises à jour
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
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [exposures, setExposures] = useState<Exposure[]>([
    { id: 1, currency: 'EUR', amount: 1200000, date: '2024-07-15', type: 'Encaissement', description: 'Vente export' },
    { id: 2, currency: 'USD', amount: -800000, date: '2024-07-20', type: 'Décaissement', description: 'Achat matières premières' },
    { id: 3, currency: 'GBP', amount: 500000, date: '2024-08-01', type: 'Encaissement', description: 'Contrat service' },
    { id: 4, currency: 'JPY', amount: -300000, date: '2024-08-10', type: 'Décaissement', description: 'Fournisseur Japon' },
  ]);

  const [archivedExposures, setArchivedExposures] = useState<ArchivedExposure[]>([
    { id: 100, currency: 'USD', amount: 600000, date: '2023-12-15', type: 'Encaissement', description: 'Export Q4 2023', archivedAt: '2024-01-15' },
    { id: 101, currency: 'GBP', amount: -200000, date: '2023-11-30', type: 'Décaissement', description: 'Achat équipement UK', archivedAt: '2023-12-01' },
    { id: 102, currency: 'CHF', amount: 150000, date: '2023-10-20', type: 'Encaissement', description: 'Contrat Suisse', archivedAt: '2023-10-21' },
  ]);

  const addExposure = (exposureData: Omit<Exposure, 'id'>) => {
    const newExposure = {
      ...exposureData,
      id: Math.max(...exposures.map(e => e.id), ...archivedExposures.map(e => e.id), 0) + 1
    };
    console.log('Adding new exposure:', newExposure);
    setExposures(prev => [...prev, newExposure]);
    setLastUpdated(Date.now());
  };

  const updateExposure = (id: number, exposureData: Partial<Exposure>) => {
    setExposures(prev => prev.map(exp => 
      exp.id === id ? { ...exp, ...exposureData } : exp
    ));
    setLastUpdated(Date.now());
  };

  const deleteExposure = (id: number) => {
    setExposures(prev => prev.filter(exp => exp.id !== id));
    setLastUpdated(Date.now());
  };

  const archiveExpiredExposures = () => {
    const now = new Date();
    const bufferDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const expiredExposures: ArchivedExposure[] = [];
    const activeExposures: Exposure[] = [];

    exposures.forEach(exposure => {
      const expDate = new Date(exposure.date);
      if (expDate < bufferDate) {
        expiredExposures.push({
          ...exposure,
          archivedAt: now.toISOString()
        });
      } else {
        activeExposures.push(exposure);
      }
    });

    if (expiredExposures.length > 0) {
      setArchivedExposures(prev => [...prev, ...expiredExposures]);
      setExposures(activeExposures);
      setLastUpdated(Date.now());
      console.log(`Archived ${expiredExposures.length} expired exposures`);
    }
  };

  useEffect(() => {
    archiveExpiredExposures();
  }, []);

  return (
    <ExposureContext.Provider value={{
      exposures,
      archivedExposures,
      addExposure,
      updateExposure,
      deleteExposure,
      archiveExpiredExposures,
      lastUpdated
    }}>
      {children}
    </ExposureContext.Provider>
  );
};

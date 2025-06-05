
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MarketData {
  spotRates: { [key: string]: number };
  volatilities: { [key: string]: number };
  riskFreeRate: number;
  lastUpdated: string;
}

interface MarketDataContextType {
  marketData: MarketData;
  updateSpotRate: (currency: string, rate: number) => void;
  updateVolatility: (currency: string, volatility: number) => void;
  updateRiskFreeRate: (rate: number) => void;
  resetToDefaults: () => void;
}

const defaultMarketData: MarketData = {
  spotRates: {
    EURUSD: 1.0856,
    EURGBP: 0.8434,
    EURJPY: 161.85,
    EURCHF: 0.9642,
    EURAUD: 1.6234,
    EURCAD: 1.4567
  },
  volatilities: {
    EURUSD: 0.12,
    EURGBP: 0.10,
    EURJPY: 0.15,
    EURCHF: 0.08,
    EURAUD: 0.18,
    EURCAD: 0.14
  },
  riskFreeRate: 0.02,
  lastUpdated: new Date().toISOString()
};

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};

interface MarketDataProviderProps {
  children: ReactNode;
}

export const MarketDataProvider: React.FC<MarketDataProviderProps> = ({ children }) => {
  const [marketData, setMarketData] = useState<MarketData>(defaultMarketData);

  const updateSpotRate = (currency: string, rate: number) => {
    setMarketData(prev => ({
      ...prev,
      spotRates: { ...prev.spotRates, [`EUR${currency}`]: rate },
      lastUpdated: new Date().toISOString()
    }));
  };

  const updateVolatility = (currency: string, volatility: number) => {
    setMarketData(prev => ({
      ...prev,
      volatilities: { ...prev.volatilities, [`EUR${currency}`]: volatility },
      lastUpdated: new Date().toISOString()
    }));
  };

  const updateRiskFreeRate = (rate: number) => {
    setMarketData(prev => ({
      ...prev,
      riskFreeRate: rate,
      lastUpdated: new Date().toISOString()
    }));
  };

  const resetToDefaults = () => {
    setMarketData({ ...defaultMarketData, lastUpdated: new Date().toISOString() });
  };

  return (
    <MarketDataContext.Provider value={{
      marketData,
      updateSpotRate,
      updateVolatility,
      updateRiskFreeRate,
      resetToDefaults
    }}>
      {children}
    </MarketDataContext.Provider>
  );
};

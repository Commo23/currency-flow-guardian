
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    exposures: 'Expositions',
    scenarios: 'Scénarios',
    hedging: 'Couverture',
    reporting: 'Reporting',
    settings: 'Paramètres',
    
    // Dashboard
    welcomeTitle: 'Gestion des Risques de Change',
    globalExposure: 'Exposition Globale',
    hedgeRatio: 'Taux de Couverture',
    unrealizedPnL: 'P&L Latent',
    alerts: 'Alertes',
    
    // Currencies
    eur: 'EUR',
    usd: 'USD',
    gbp: 'GBP',
    jpy: 'JPY',
    chf: 'CHF',
    
    // Common
    amount: 'Montant',
    currency: 'Devise',
    date: 'Date',
    status: 'Statut',
    actions: 'Actions',
    add: 'Ajouter',
    edit: 'Modifier',
    delete: 'Supprimer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    
    // Exposure management
    cashFlows: 'Flux de Trésorerie',
    expectedFlows: 'Flux Prévisionnels',
    netPosition: 'Position Nette',
    maturity: 'Échéance',
    type: 'Type',
    inflow: 'Encaissement',
    outflow: 'Décaissement',
    
    // Hedging
    hedgingInstruments: 'Instruments de Couverture',
    forward: 'Forward',
    option: 'Option',
    swap: 'Swap',
    effectiveness: 'Efficacité',
    hedgeRatios: 'Ratios de Couverture',
    
    // Scenarios
    stressTest: 'Test de Stress',
    scenario: 'Scénario',
    impact: 'Impact',
    baseCurrency: 'Devise de Base',
    
    // Reporting
    reports: 'Rapports',
    period: 'Période',
    subsidiary: 'Filiale',
    exportPDF: 'Exporter PDF',
    exportExcel: 'Exporter Excel'
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    exposures: 'Exposures',
    scenarios: 'Scenarios',
    hedging: 'Hedging',
    reporting: 'Reporting',
    settings: 'Settings',
    
    // Dashboard
    welcomeTitle: 'FX Risk Management',
    globalExposure: 'Global Exposure',
    hedgeRatio: 'Hedge Ratio',
    unrealizedPnL: 'Unrealized P&L',
    alerts: 'Alerts',
    
    // Currencies
    eur: 'EUR',
    usd: 'USD',
    gbp: 'GBP',
    jpy: 'JPY',
    chf: 'CHF',
    
    // Common
    amount: 'Amount',
    currency: 'Currency',
    date: 'Date',
    status: 'Status',
    actions: 'Actions',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    
    // Exposure management
    cashFlows: 'Cash Flows',
    expectedFlows: 'Expected Flows',
    netPosition: 'Net Position',
    maturity: 'Maturity',
    type: 'Type',
    inflow: 'Inflow',
    outflow: 'Outflow',
    
    // Hedging
    hedgingInstruments: 'Hedging Instruments',
    forward: 'Forward',
    option: 'Option',
    swap: 'Swap',
    effectiveness: 'Effectiveness',
    hedgeRatios: 'Hedge Ratios',
    
    // Scenarios
    stressTest: 'Stress Test',
    scenario: 'Scenario',
    impact: 'Impact',
    baseCurrency: 'Base Currency',
    
    // Reporting
    reports: 'Reports',
    period: 'Period',
    subsidiary: 'Subsidiary',
    exportPDF: 'Export PDF',
    exportExcel: 'Export Excel'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fr']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

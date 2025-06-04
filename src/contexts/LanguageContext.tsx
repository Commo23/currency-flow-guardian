
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
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
    
    // Application name
    appName: 'Monetix',
    appDescription: 'Advanced FX Risk Management Platform',
    
    // Currencies
    eur: 'EUR',
    usd: 'USD',
    gbp: 'GBP',
    jpy: 'JPY',
    chf: 'CHF',
    cad: 'CAD',
    aud: 'AUD',
    
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
    generate: 'Generate',
    export: 'Export',
    download: 'Download',
    configure: 'Configure',
    total: 'Total',
    
    // Exposure management
    cashFlows: 'Cash Flows',
    expectedFlows: 'Expected Flows',
    netPosition: 'Net Position',
    maturity: 'Maturity',
    type: 'Type',
    inflow: 'Inflow',
    outflow: 'Outflow',
    totalExposure: 'Total Exposure',
    analyzedExposure: 'Analyzed Exposure',
    averageMaturity: 'Average Maturity',
    totalMTM: 'Total MTM',
    totalNotional: 'Total Notional',
    newExposure: 'New Exposure',
    addExposure: 'Add Exposure',
    exposureManagement: 'Exchange Rate Exposure Management',
    
    // Hedging
    hedgingInstruments: 'Hedging Instruments',
    forward: 'Forward',
    option: 'Option',
    swap: 'Swap',
    effectiveness: 'Effectiveness',
    hedgeRatios: 'Hedge Ratios',
    newInstrument: 'New Instrument',
    
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
    exportExcel: 'Export Excel',
    newReport: 'New Report',
    availableReports: 'Available Reports',
    reportGenerator: 'Report Generator',
    reportScheduling: 'Report Scheduling',
    dailyReports: 'Daily Reports',
    weeklyReports: 'Weekly Reports',
    monthlyReports: 'Monthly Reports',
    
    // KPIs
    var95: 'VaR 95%',
    expectedShortfall: 'Expected Shortfall',
    sharpeRatio: 'Sharpe Ratio',
    trackingError: 'Tracking Error',
    
    // Settings
    userManagement: 'User Management',
    securityAccess: 'Security & Access',
    currenciesRates: 'Currencies & Rates',
    notificationsAlerts: 'Notifications & Alerts',
    generalSettings: 'General Settings'
  },
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
    
    // Application name
    appName: 'Monetix',
    appDescription: 'Plateforme Avancée de Gestion des Risques de Change',
    
    // Currencies
    eur: 'EUR',
    usd: 'USD',
    gbp: 'GBP',
    jpy: 'JPY',
    chf: 'CHF',
    cad: 'CAD',
    aud: 'AUD',
    
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
    generate: 'Générer',
    export: 'Exporter',
    download: 'Télécharger',
    configure: 'Configurer',
    total: 'Total',
    
    // Exposure management
    cashFlows: 'Flux de Trésorerie',
    expectedFlows: 'Flux Prévisionnels',
    netPosition: 'Position Nette',
    maturity: 'Échéance',
    type: 'Type',
    inflow: 'Encaissement',
    outflow: 'Décaissement',
    totalExposure: 'Exposition totale',
    analyzedExposure: 'Exposition analysée',
    averageMaturity: 'Échéance moyenne',
    totalMTM: 'MTM Total',
    totalNotional: 'Notionnel total',
    newExposure: 'Nouvelle exposition',
    addExposure: 'Ajouter exposition',
    exposureManagement: 'Gestion des expositions de change',
    
    // Hedging
    hedgingInstruments: 'Instruments de Couverture',
    forward: 'Forward',
    option: 'Option',
    swap: 'Swap',
    effectiveness: 'Efficacité',
    hedgeRatios: 'Ratios de Couverture',
    newInstrument: 'Nouvel instrument',
    
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
    exportExcel: 'Exporter Excel',
    newReport: 'Nouveau rapport',
    availableReports: 'Rapports disponibles',
    reportGenerator: 'Générateur de rapports',
    reportScheduling: 'Planification des rapports',
    dailyReports: 'Rapports quotidiens',
    weeklyReports: 'Rapports hebdomadaires',
    monthlyReports: 'Rapports mensuels',
    
    // KPIs
    var95: 'VaR 95%',
    expectedShortfall: 'Expected Shortfall',
    sharpeRatio: 'Ratio de Sharpe',
    trackingError: 'Tracking Error',
    
    // Settings
    userManagement: 'Gestion des utilisateurs',
    securityAccess: 'Sécurité et accès',
    currenciesRates: 'Devises et taux',
    notificationsAlerts: 'Notifications et alertes',
    generalSettings: 'Paramètres généraux'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en'); // English as default

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
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

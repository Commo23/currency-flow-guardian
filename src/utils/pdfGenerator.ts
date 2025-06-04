
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExposureData {
  id: number;
  currency: string;
  amount: number;
  date: string;
  type: string;
  description?: string;
}

interface InstrumentData {
  id: number;
  type: string;
  currency: string;
  amount: number;
  rate: number;
  maturity: string;
  premium?: number;
}

interface ReportData {
  exposures: ExposureData[];
  instruments: InstrumentData[];
  metrics: {
    totalExposure: number;
    totalMTM: number;
    totalNotional: number;
    averageMaturity: number;
    hedgeRatio: number;
    unrealizedPnL: number;
  };
  reportType: string;
  language: 'en' | 'fr';
}

export const generatePDFReport = (data: ReportData): void => {
  const doc = new jsPDF();
  const isEnglish = data.language === 'en';
  
  // Title and header
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text(isEnglish ? 'Monetix - FX Risk Report' : 'Monetix - Rapport de Risque de Change', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`${isEnglish ? 'Generated on' : 'Généré le'}: ${new Date().toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR')}`, 20, 40);
  doc.text(`${isEnglish ? 'Report Type' : 'Type de rapport'}: ${data.reportType}`, 20, 50);
  
  let yPosition = 70;
  
  // Executive Summary
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text(isEnglish ? 'Executive Summary' : 'Résumé Exécutif', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(10);
  doc.setTextColor(60);
  
  const summaryData = [
    [isEnglish ? 'Total Exposure' : 'Exposition Totale', `€${(data.metrics.totalExposure / 1000000).toFixed(2)}M`],
    [isEnglish ? 'Total Notional' : 'Notionnel Total', `€${(data.metrics.totalNotional / 1000000).toFixed(2)}M`],
    [isEnglish ? 'Total MTM' : 'MTM Total', `€${(data.metrics.totalMTM / 1000).toFixed(0)}K`],
    [isEnglish ? 'Hedge Ratio' : 'Ratio de Couverture', `${data.metrics.hedgeRatio.toFixed(1)}%`],
    [isEnglish ? 'Unrealized P&L' : 'P&L Latent', `€${(data.metrics.unrealizedPnL / 1000).toFixed(0)}K`],
    [isEnglish ? 'Average Maturity' : 'Échéance Moyenne', `${Math.round(data.metrics.averageMaturity)} ${isEnglish ? 'days' : 'jours'}`]
  ];
  
  (doc as any).autoTable({
    startY: yPosition,
    head: [[isEnglish ? 'Metric' : 'Métrique', isEnglish ? 'Value' : 'Valeur']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [63, 81, 181] },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 20;
  
  // Exposures Table
  if (data.exposures.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(isEnglish ? 'Currency Exposures' : 'Expositions de Change', 20, yPosition);
    yPosition += 10;
    
    const exposureTableData = data.exposures.map(exp => [
      exp.currency,
      `€${(exp.amount / 1000).toFixed(0)}K`,
      new Date(exp.date).toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR'),
      exp.type,
      exp.description || ''
    ]);
    
    (doc as any).autoTable({
      startY: yPosition,
      head: [[
        isEnglish ? 'Currency' : 'Devise',
        isEnglish ? 'Amount' : 'Montant',
        isEnglish ? 'Maturity' : 'Échéance',
        isEnglish ? 'Type' : 'Type',
        isEnglish ? 'Description' : 'Description'
      ]],
      body: exposureTableData,
      theme: 'striped',
      headStyles: { fillColor: [76, 175, 80] },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }
  
  // Add new page if needed
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }
  
  // Hedging Instruments Table
  if (data.instruments.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(isEnglish ? 'Hedging Instruments' : 'Instruments de Couverture', 20, yPosition);
    yPosition += 10;
    
    const instrumentTableData = data.instruments.map(inst => [
      inst.type,
      inst.currency,
      `€${(inst.amount / 1000).toFixed(0)}K`,
      inst.rate.toFixed(4),
      new Date(inst.maturity).toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR'),
      inst.premium ? `€${(inst.premium / 1000).toFixed(0)}K` : 'N/A'
    ]);
    
    (doc as any).autoTable({
      startY: yPosition,
      head: [[
        isEnglish ? 'Type' : 'Type',
        isEnglish ? 'Currency' : 'Devise',
        isEnglish ? 'Amount' : 'Montant',
        isEnglish ? 'Rate' : 'Taux',
        isEnglish ? 'Maturity' : 'Échéance',
        isEnglish ? 'Premium' : 'Prime'
      ]],
      body: instrumentTableData,
      theme: 'striped',
      headStyles: { fillColor: [255, 152, 0] },
      margin: { left: 20, right: 20 }
    });
  }
  
  // Footer
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `${isEnglish ? 'Page' : 'Page'} ${i} ${isEnglish ? 'of' : 'sur'} ${pageCount} - Monetix Risk Management Platform`,
      20,
      290
    );
  }
  
  // Save the PDF
  const fileName = `Monetix_Report_${data.reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

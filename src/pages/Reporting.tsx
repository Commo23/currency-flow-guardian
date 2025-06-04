import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExposures } from "@/contexts/ExposureContext";
import { useHedging } from "@/contexts/HedgingContext";
import { useMetrics } from "@/contexts/MetricsContext";
import { ReportScheduler } from "@/components/ReportScheduler";
import { generatePDFReport } from "@/utils/pdfGenerator";
import { FileText, Download, Calendar, BarChart } from "lucide-react";

export default function Reporting() {
  const { t, language } = useLanguage();
  const { exposures } = useExposures();
  const { hedgingInstruments } = useHedging();
  const metrics = useMetrics();

  const generateReport = (reportType: string) => {
    const reportData = {
      exposures,
      instruments: hedgingInstruments,
      metrics,
      reportType,
      language
    };
    
    generatePDFReport(reportData);
  };

  const reports = [
    { 
      name: language === 'en' ? 'Monthly Report' : 'Rapport mensuel', 
      type: language === 'en' ? 'Summary' : 'Synthèse', 
      date: '2024-01-31', 
      status: language === 'en' ? 'Generated' : 'Généré' 
    },
    { 
      name: language === 'en' ? 'Risk Analysis' : 'Analyse des risques', 
      type: language === 'en' ? 'Detailed' : 'Détaillé', 
      date: '2024-01-28', 
      status: language === 'en' ? 'In Progress' : 'En cours' 
    },
    { 
      name: language === 'en' ? 'Hedge Performance' : 'Performance couvertures', 
      type: 'KPI', 
      date: '2024-01-25', 
      status: language === 'en' ? 'Generated' : 'Généré' 
    },
    { 
      name: language === 'en' ? 'Subsidiary Exposure' : 'Exposition par filiale', 
      type: language === 'en' ? 'Operational' : 'Opérationnel', 
      date: '2024-01-20', 
      status: language === 'en' ? 'Generated' : 'Généré' 
    },
  ];

  const kpis = [
    { name: t('var95'), value: '125K €', trend: '+5%' },
    { name: t('expectedShortfall'), value: '180K €', trend: '-2%' },
    { name: t('sharpeRatio'), value: '1.24', trend: '+8%' },
    { name: t('trackingError'), value: '2.1%', trend: '+1%' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('reporting')}</h1>
          <p className="text-gray-600 mt-1">
            {language === 'en' ? 'Performance reports and indicators' : 'Rapports et indicateurs de performance'}
          </p>
        </div>
        <Button 
          className="bg-primary text-white"
          onClick={() => generateReport(language === 'en' ? 'Executive Summary' : 'Synthèse Exécutive')}
        >
          <FileText className="h-4 w-4 mr-2" />
          {t('newReport')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="finance-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{kpi.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <div className={`text-sm mt-1 ${kpi.trend.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.trend} {language === 'en' ? 'vs previous month' : 'vs mois précédent'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>{t('availableReports')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((report, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-gray-500">{report.type} - {report.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.status === 'Généré' || report.status === 'Generated' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                    {(report.status === 'Généré' || report.status === 'Generated') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateReport(report.name)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              <span>{t('reportGenerator')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Report Type' : 'Type de rapport'}</label>
                <select className="w-full p-2 border rounded-md">
                  <option>{language === 'en' ? 'Monthly Summary' : 'Synthèse mensuelle'}</option>
                  <option>{language === 'en' ? 'Detailed Analysis' : 'Analyse détaillée'}</option>
                  <option>{language === 'en' ? 'KPI Report' : 'Rapport KPI'}</option>
                  <option>{language === 'en' ? 'Entity Exposure' : 'Exposition par entité'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('period')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" className="p-2 border rounded-md" />
                  <input type="date" className="p-2 border rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Currencies' : 'Devises'}</label>
                <select multiple className="w-full p-2 border rounded-md h-20">
                  <option>EUR</option>
                  <option>USD</option>
                  <option>GBP</option>
                  <option>JPY</option>
                  <option>CHF</option>
                </select>
              </div>
              <Button 
                className="w-full bg-primary text-white"
                onClick={() => generateReport(language === 'en' ? 'Custom Report' : 'Rapport Personnalisé')}
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('generate')} {language === 'en' ? 'Report' : 'le rapport'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ReportScheduler />
    </div>
  );
}

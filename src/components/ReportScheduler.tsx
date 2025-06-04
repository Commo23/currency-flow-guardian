
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, Clock, Mail } from "lucide-react";

interface ScheduledReport {
  id: number;
  name: string;
  type: string;
  frequency: string;
  time: string;
  enabled: boolean;
  recipients: string[];
}

export function ReportScheduler() {
  const { t, language } = useLanguage();
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: 1,
      name: language === 'en' ? 'Daily Position Report' : 'Rapport de Position Quotidien',
      type: 'position',
      frequency: 'daily',
      time: '09:00',
      enabled: true,
      recipients: ['treasurer@company.com']
    },
    {
      id: 2,
      name: language === 'en' ? 'Weekly Risk Analysis' : 'Analyse de Risque Hebdomadaire',
      type: 'risk',
      frequency: 'weekly',
      time: '08:00',
      enabled: true,
      recipients: ['risk@company.com', 'cfo@company.com']
    },
    {
      id: 3,
      name: language === 'en' ? 'Monthly Executive Summary' : 'Synthèse Mensuelle Direction',
      type: 'executive',
      frequency: 'monthly',
      time: '07:00',
      enabled: false,
      recipients: ['ceo@company.com', 'board@company.com']
    }
  ]);

  const [newReport, setNewReport] = useState({
    name: '',
    type: '',
    frequency: '',
    time: '',
    recipients: ''
  });

  const toggleReport = (id: number) => {
    setScheduledReports(prev => 
      prev.map(report => 
        report.id === id ? { ...report, enabled: !report.enabled } : report
      )
    );
  };

  const addScheduledReport = () => {
    if (newReport.name && newReport.type && newReport.frequency && newReport.time) {
      const report: ScheduledReport = {
        id: Math.max(...scheduledReports.map(r => r.id), 0) + 1,
        name: newReport.name,
        type: newReport.type,
        frequency: newReport.frequency,
        time: newReport.time,
        enabled: true,
        recipients: newReport.recipients.split(',').map(email => email.trim()).filter(email => email)
      };
      
      setScheduledReports(prev => [...prev, report]);
      setNewReport({ name: '', type: '', frequency: '', time: '', recipients: '' });
    }
  };

  const removeReport = (id: number) => {
    setScheduledReports(prev => prev.filter(report => report.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>{t('reportScheduling')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={report.enabled}
                      onCheckedChange={() => toggleReport(report.id)}
                    />
                    <div>
                      <h3 className="font-medium">{report.name}</h3>
                      <p className="text-sm text-gray-500">
                        {language === 'en' ? 'Every' : 'Chaque'} {report.frequency} {language === 'en' ? 'at' : 'à'} {report.time}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-400">
                          {report.recipients.length} {language === 'en' ? 'recipients' : 'destinataires'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeReport(report.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  {t('delete')}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span>{language === 'en' ? 'Add Scheduled Report' : 'Ajouter Rapport Planifié'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportName">{language === 'en' ? 'Report Name' : 'Nom du rapport'}</Label>
              <Input
                id="reportName"
                value={newReport.name}
                onChange={(e) => setNewReport({...newReport, name: e.target.value})}
                placeholder={language === 'en' ? 'Enter report name' : 'Nom du rapport'}
              />
            </div>
            
            <div>
              <Label htmlFor="reportType">{language === 'en' ? 'Report Type' : 'Type de rapport'}</Label>
              <Select value={newReport.type} onValueChange={(value) => setNewReport({...newReport, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Select type' : 'Sélectionner le type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="position">{language === 'en' ? 'Position Report' : 'Rapport de Position'}</SelectItem>
                  <SelectItem value="risk">{language === 'en' ? 'Risk Analysis' : 'Analyse de Risque'}</SelectItem>
                  <SelectItem value="executive">{language === 'en' ? 'Executive Summary' : 'Synthèse Direction'}</SelectItem>
                  <SelectItem value="pnl">{language === 'en' ? 'P&L Report' : 'Rapport P&L'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="frequency">{language === 'en' ? 'Frequency' : 'Fréquence'}</Label>
              <Select value={newReport.frequency} onValueChange={(value) => setNewReport({...newReport, frequency: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Select frequency' : 'Sélectionner la fréquence'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{language === 'en' ? 'Daily' : 'Quotidien'}</SelectItem>
                  <SelectItem value="weekly">{language === 'en' ? 'Weekly' : 'Hebdomadaire'}</SelectItem>
                  <SelectItem value="monthly">{language === 'en' ? 'Monthly' : 'Mensuel'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="time">{language === 'en' ? 'Time' : 'Heure'}</Label>
              <Input
                id="time"
                type="time"
                value={newReport.time}
                onChange={(e) => setNewReport({...newReport, time: e.target.value})}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="recipients">{language === 'en' ? 'Recipients (comma separated)' : 'Destinataires (séparés par virgule)'}</Label>
              <Input
                id="recipients"
                value={newReport.recipients}
                onChange={(e) => setNewReport({...newReport, recipients: e.target.value})}
                placeholder={language === 'en' ? 'email1@company.com, email2@company.com' : 'email1@entreprise.com, email2@entreprise.com'}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Button onClick={addScheduledReport} className="w-full">
              {language === 'en' ? 'Add Scheduled Report' : 'Ajouter Rapport Planifié'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

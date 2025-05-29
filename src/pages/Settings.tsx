import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Settings as SettingsIcon, Users, Shield, Globe, Bell } from "lucide-react";

export default function Settings() {
  const { t } = useLanguage();

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('settings')}</h1>
          <p className="text-gray-600 mt-1">Configuration et paramètres de l'application</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Gestion des utilisateurs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Marie Dupont</p>
                  <p className="text-sm text-gray-500">Trésorière - Administrateur</p>
                </div>
                <Button variant="outline" size="sm">Modifier</Button>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Pierre Martin</p>
                  <p className="text-sm text-gray-500">Analyste - Utilisateur</p>
                </div>
                <Button variant="outline" size="sm">Modifier</Button>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Sophie Bernard</p>
                  <p className="text-sm text-gray-500">Contrôleur - Lecture seule</p>
                </div>
                <Button variant="outline" size="sm">Modifier</Button>
              </div>
              <Button className="w-full bg-primary text-white">
                <Users className="h-4 w-4 mr-2" />
                Ajouter un utilisateur
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Sécurité et accès</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Authentification à deux facteurs</p>
                  <p className="text-sm text-gray-500">Sécurité renforcée</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-green-600">Activé</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Session automatique</p>
                  <p className="text-sm text-gray-500">Déconnexion après inactivité</p>
                </div>
                <select className="p-1 border rounded text-sm">
                  <option>30 min</option>
                  <option>1 heure</option>
                  <option>2 heures</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Audit des actions</p>
                  <p className="text-sm text-gray-500">Traçabilité complète</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-green-600">Activé</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-green-600" />
              <span>Devises et taux</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Source des taux de change</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Reuters</option>
                  <option>Bloomberg</option>
                  <option>ECB</option>
                  <option>Fed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fréquence de mise à jour</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Temps réel</option>
                  <option>Toutes les 15 minutes</option>
                  <option>Toutes les heures</option>
                  <option>Quotidienne</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Devises suivies</label>
                <div className="grid grid-cols-3 gap-2">
                  {['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD'].map((currency) => (
                    <label key={currency} className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">{currency}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-amber-600" />
              <span>Notifications et alertes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Alertes de volatilité</p>
                  <p className="text-sm text-gray-500">Seuil: 15%</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="mr-1" defaultChecked />
                  <Button variant="outline" size="sm">Config</Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Échéances proches</p>
                  <p className="text-sm text-gray-500">Rappel: 7 jours avant</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="mr-1" defaultChecked />
                  <Button variant="outline" size="sm">Config</Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Limites d'exposition</p>
                  <p className="text-sm text-gray-500">Dépassement automatique</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="mr-1" defaultChecked />
                  <Button variant="outline" size="sm">Config</Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Rapports automatiques</p>
                  <p className="text-sm text-gray-500">Email quotidien</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="mr-1" />
                  <Button variant="outline" size="sm">Config</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5 text-gray-600" />
            <span>Paramètres généraux</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Devise de référence</label>
                <select className="w-full p-2 border rounded-md">
                  <option>EUR</option>
                  <option>USD</option>
                  <option>GBP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Format de date</label>
                <select className="w-full p-2 border rounded-md">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fuseau horaire</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Europe/Paris</option>
                  <option>Europe/London</option>
                  <option>America/New_York</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Politique de couverture par défaut</label>
                <select className="w-full p-2 border rounded-md">
                  <option>75% minimum</option>
                  <option>50% minimum</option>
                  <option>100% recommandé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Horizon de prévision</label>
                <select className="w-full p-2 border rounded-md">
                  <option>12 mois</option>
                  <option>6 mois</option>
                  <option>24 mois</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Seuil d'alerte VaR</label>
                <input type="number" className="w-full p-2 border rounded-md" placeholder="100000" />
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t">
            <Button className="bg-primary text-white mr-4">Sauvegarder</Button>
            <Button variant="outline">Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

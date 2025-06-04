
import {
  BarChart3,
  DollarSign,
  Globe,
  Home,
  Settings,
  TrendingUp,
  FileText,
  AlertTriangle,
  Languages
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const menuItems = [
  {
    title: "dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "exposures",
    url: "/exposures",
    icon: DollarSign,
  },
  {
    title: "scenarios",
    url: "/scenarios",
    icon: TrendingUp,
  },
  {
    title: "hedging",
    url: "/hedging",
    icon: BarChart3,
  },
  {
    title: "reporting",
    url: "/reporting",
    icon: FileText,
  },
  {
    title: "settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-2">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">{t('appName')}</h2>
            <p className="text-sm text-sidebar-foreground/70">{language === 'en' ? 'Risk Management' : 'Gestion des Risques'}</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-sidebar-accent">
                    <a href={item.url} className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.title)}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs uppercase tracking-wider">
            {t('alerts')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800">EUR/USD volatility</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
          className="w-full"
        >
          <Languages className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Français' : 'English'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

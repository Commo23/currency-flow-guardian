
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  currency?: string;
  className?: string;
}

export function MetricCard({ title, value, subtitle, trend, currency, className }: MetricCardProps) {
  const trendColor = trend !== undefined 
    ? trend > 0 
      ? "text-green-600" 
      : trend < 0 
        ? "text-red-600" 
        : "text-gray-600"
    : "text-gray-600";

  const trendBgColor = trend !== undefined 
    ? trend > 0 
      ? "bg-green-100" 
      : trend < 0 
        ? "bg-red-100" 
        : "bg-gray-100"
    : "bg-gray-100";

  return (
    <Card className={cn("bg-white/70 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          {currency && <span className="text-lg text-gray-500 font-medium">{currency}</span>}
        </div>
        
        {subtitle && (
          <p className="text-sm text-gray-600 font-medium">{subtitle}</p>
        )}
        
        {trend !== undefined && (
          <div className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", trendColor, trendBgColor)}>
            <span className="mr-1">
              {trend > 0 ? "↗" : trend < 0 ? "↘" : "→"}
            </span>
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

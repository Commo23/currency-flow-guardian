
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

  return (
    <Card className={cn("finance-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {value}
          {currency && <span className="text-sm text-gray-500 ml-1">{currency}</span>}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className={cn("text-sm mt-2 flex items-center", trendColor)}>
            <span className="mr-1">
              {trend > 0 ? "↗" : trend < 0 ? "↘" : "→"}
            </span>
            {Math.abs(trend)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

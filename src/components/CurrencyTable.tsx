
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const currencyData = [
  {
    currency: 'EUR',
    rate: 1.0000,
    exposure: 1200000,
    hedged: 800000,
    ratio: 66.7,
    mtm: 15000,
    flag: '🇪🇺'
  },
  {
    currency: 'USD',
    rate: 1.0856,
    exposure: -800000,
    hedged: 600000,
    ratio: 75.0,
    mtm: -8500,
    flag: '🇺🇸'
  },
  {
    currency: 'GBP',
    rate: 0.8434,
    exposure: 500000,
    hedged: 300000,
    ratio: 60.0,
    mtm: 12000,
    flag: '🇬🇧'
  },
  {
    currency: 'JPY',
    rate: 161.85,
    exposure: -300000,
    hedged: 200000,
    ratio: 66.7,
    mtm: -3200,
    flag: '🇯🇵'
  },
  {
    currency: 'CHF',
    rate: 0.9341,
    exposure: 150000,
    hedged: 100000,
    ratio: 66.7,
    mtm: 2800,
    flag: '🇨🇭'
  }
];

export function CurrencyTable() {
  const { t } = useLanguage();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRiskBadge = (ratio: number) => {
    if (ratio >= 80) return <Badge className="bg-green-100 text-green-800">Faible</Badge>;
    if (ratio >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Modéré</Badge>;
    return <Badge className="bg-red-100 text-red-800">Élevé</Badge>;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">{t('currency')}</TableHead>
            <TableHead className="font-semibold">Taux</TableHead>
            <TableHead className="font-semibold text-right">Exposition</TableHead>
            <TableHead className="font-semibold text-right">Couvert</TableHead>
            <TableHead className="font-semibold text-right">Ratio %</TableHead>
            <TableHead className="font-semibold text-right">MTM</TableHead>
            <TableHead className="font-semibold">Risque</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currencyData.map((row) => (
            <TableRow key={row.currency} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{row.flag}</span>
                  <span className="font-medium">{row.currency}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{row.rate.toFixed(4)}</TableCell>
              <TableCell className={`text-right font-medium ${row.exposure >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(row.exposure)}
              </TableCell>
              <TableCell className="text-right text-blue-600 font-medium">
                {formatAmount(row.hedged)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {row.ratio.toFixed(1)}%
              </TableCell>
              <TableCell className={`text-right font-medium ${row.mtm >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(row.mtm)}
              </TableCell>
              <TableCell>
                {getRiskBadge(row.ratio)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

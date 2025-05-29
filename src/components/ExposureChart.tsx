
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { currency: 'EUR', exposure: 1200000, hedged: 800000 },
  { currency: 'USD', exposure: -800000, hedged: 600000 },
  { currency: 'GBP', exposure: 500000, hedged: 300000 },
  { currency: 'JPY', exposure: -300000, hedged: 200000 },
  { currency: 'CHF', exposure: 150000, hedged: 100000 },
];

const COLORS = {
  positive: '#16a34a',
  negative: '#dc2626',
  hedged: '#3b82f6'
};

export function ExposureChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="currency" 
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(value) => `${(value / 1000)}k`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `${(value / 1000).toFixed(0)}k €`,
              name === 'exposure' ? 'Exposition' : 'Couvert'
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="exposure" name="exposure" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.exposure >= 0 ? COLORS.positive : COLORS.negative} 
              />
            ))}
          </Bar>
          <Bar dataKey="hedged" name="hedged" fill={COLORS.hedged} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

interface PriceStatProps {
  label: string;
  value?: number | null;
  trend?: 'up' | 'down' | null;
  trendPercent?: number | null;
  valueClassName?: string;
}

export function PriceStat({
  label,
  value,
  trend,
  trendPercent,
  valueClassName = 'font-semibold',
}: PriceStatProps) {
  const hasTrend = trend && trendPercent !== null && trendPercent !== undefined;

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <span className={valueClassName}>{formatCurrency(value)}</span>
        {hasTrend && (
          <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{trendPercent}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

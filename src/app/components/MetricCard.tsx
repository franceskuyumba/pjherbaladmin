import React from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Truck, AlertTriangle, Receipt, BarChart2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type IconName = 'TrendingUp' | 'ShoppingCart' | 'Truck' | 'AlertTriangle' | 'Receipt' | 'BarChart2';
type Variant = 'hero' | 'default' | 'warning' | 'alert' | 'positive';

interface MetricCardProps {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  trend?: { pct: string; direction: 'up' | 'down' };
  icon: IconName;
  variant?: Variant;
  description?: string;
}

const iconMap: Record<IconName, React.ElementType> = {
  TrendingUp, ShoppingCart, Truck, AlertTriangle, Receipt, BarChart2,
};

const variantStyles: Record<Variant, { card: string; iconBg: string; iconColor: string; valueColor: string }> = {
  hero: {
    card: 'bg-primary border-primary/20 shadow-card-hover',
    iconBg: 'bg-primary-foreground/15',
    iconColor: 'text-primary-foreground',
    valueColor: 'text-primary-foreground',
  },
  default: {
    card: 'bg-card border-border shadow-card hover:shadow-card-hover',
    iconBg: 'bg-primary-light',
    iconColor: 'text-primary',
    valueColor: 'text-foreground',
  },
  warning: {
    card: 'bg-amber-50 border-amber-200 shadow-card',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    valueColor: 'text-amber-900',
  },
  alert: {
    card: 'bg-red-50 border-red-200 shadow-card',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    valueColor: 'text-red-900',
  },
  positive: {
    card: 'bg-green-50 border-green-200 shadow-card',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    valueColor: 'text-green-900',
  },
};

export default function MetricCard({ id, label, value, subValue, trend, icon, variant = 'default', description }: MetricCardProps) {
  const Icon = iconMap[icon];
  const styles = variantStyles[variant];
  const isHero = variant === 'hero';

  const labelColor = isHero ? 'text-primary-foreground/70' : 'text-muted-foreground';
  const descColor = isHero ? 'text-primary-foreground/60' : 'text-muted-foreground';

  return (
    <div className={`h-full rounded-xl border p-5 transition-all duration-200 ${styles.card}`}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-[11px] font-semibold uppercase tracking-wide ${labelColor}`}>{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
          <Icon size={18} className={styles.iconColor} />
        </div>
      </div>

      <p className={`font-tabular font-bold leading-none mb-1 ${isHero ? 'text-3xl' : 'text-2xl'} ${styles.valueColor}`}>
        {value}
      </p>

      {subValue && (
        <p className={`text-xs ${descColor} mt-1`}>{subValue}</p>
      )}

      {(trend || description) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-current/10">
          {trend && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              trend.direction === 'up' ? isHero ?'text-primary-foreground/80': 'text-green-600' :'text-red-500'
            }`}>
              {trend.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.pct}%
            </span>
          )}
          {description && (
            <span className={`text-[11px] ${descColor} truncate`}>{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
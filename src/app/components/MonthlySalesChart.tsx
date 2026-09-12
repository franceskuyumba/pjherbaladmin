'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Backend integration point: GET /api/admin/analytics/monthly-sales?year=2026
const monthlySalesData = [
  { month: 'Jan', revenue: 9_840_000, orders: 186 },
  { month: 'Feb', revenue: 11_200_000, orders: 212 },
  { month: 'Mar', revenue: 10_450_000, orders: 198 },
  { month: 'Apr', revenue: 13_750_000, orders: 261 },
  { month: 'May', revenue: 12_100_000, orders: 229 },
  { month: 'Jun', revenue: 14_900_000, orders: 283 },
  { month: 'Jul', revenue: 15_820_000, orders: 298 },
  { month: 'Aug', revenue: 18_450_000, orders: 347 },
];

const formatTZS = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-modal">
        <p className="text-xs font-semibold text-muted-foreground mb-2">{label} 2026</p>
        <p className="text-sm font-bold text-foreground font-tabular">
          TZS {payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {payload[1]?.value} orders
        </p>
      </div>
    );
  }
  return null;
};

export default function MonthlySalesChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={monthlySalesData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatTZS}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--primary)"
          strokeWidth={2.5}
          fill="url(#revenueGradient)"
          dot={{ fill: 'var(--primary)', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: 'var(--primary)', stroke: 'var(--card)', strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="orders"
          stroke="var(--accent)"
          strokeWidth={1.5}
          fill="none"
          strokeDasharray="4 4"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
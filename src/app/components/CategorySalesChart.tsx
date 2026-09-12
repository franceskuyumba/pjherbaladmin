'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Backend integration point: GET /api/admin/analytics/category-sales?month=2026-08
const categoryData = [
  { category: "Men\'s Health", revenue: 4_820_000, color: 'var(--primary)' },
  { category: 'Weight Mgmt', revenue: 3_940_000, color: 'var(--accent)' },
  { category: 'Energy & Imm.', revenue: 3_210_000, color: '#7C3AED' },
  { category: "Women\'s Well.", revenue: 2_870_000, color: '#EC4899' },
  { category: 'Brain & Focus', revenue: 2_140_000, color: '#0EA5E9' },
  { category: 'Detox & Dig.', revenue: 1_470_000, color: '#14B8A6' },
];

const formatTZS = (value: number) => `${(value / 1_000_000).toFixed(1)}M`;

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { category: string; revenue: number } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2.5 shadow-modal">
        <p className="text-xs font-semibold text-foreground">{payload[0].payload.category}</p>
        <p className="text-sm font-bold text-foreground font-tabular mt-0.5">
          TZS {payload[0].payload.revenue.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function CategorySalesChart() {
  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={formatTZS}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={14}>
            {categoryData.map((entry, index) => (
              <Cell key={`cell-cat-${index + 1}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 space-y-1.5">
        {categoryData.map((item, index) => (
          <div key={`legend-cat-${index + 1}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] text-muted-foreground truncate">{item.category}</span>
            </div>
            <span className="text-[11px] font-semibold text-foreground font-tabular">
              {((item.revenue / categoryData.reduce((a, b) => a + b.revenue, 0)) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
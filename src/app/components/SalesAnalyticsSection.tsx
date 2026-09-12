'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';

const MonthlySalesChart = dynamic(() => import('./MonthlySalesChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={280} />,
});

const CategorySalesChart = dynamic(() => import('./CategorySalesChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={280} />,
});

export default function SalesAnalyticsSection() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
      {/* Monthly Sales — spans 2/3 */}
      <div className="xl:col-span-2 card-base p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Monthly Sales Performance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Revenue in TZS · Jan – Aug 2026</p>
          </div>
          <select className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-card text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option>2026</option>
            <option>2025</option>
          </select>
        </div>
        <MonthlySalesChart />
      </div>

      {/* Category Breakdown — 1/3 */}
      <div className="xl:col-span-1 card-base p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Sales by Category</h2>
          <p className="text-xs text-muted-foreground mt-0.5">August 2026</p>
        </div>
        <CategorySalesChart />
      </div>
    </div>
  );
}
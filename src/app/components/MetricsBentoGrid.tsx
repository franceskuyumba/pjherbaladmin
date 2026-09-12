import React from 'react';
import MetricCard from './MetricCard';

// Backend integration point: GET /api/admin/dashboard/kpis — returns all KPI values
const kpiData = {
  totalRevenue: { value: 18_450_000, prev: 15_820_000, unit: 'TZS' },
  totalOrders: { value: 347, prev: 298 },
  pendingDeliveries: { value: 24, prev: 18 },
  lowStockItems: { value: 3, prev: 1 },
  avgOrderValue: { value: 53_170, prev: 53_087 },
  monthlyGrowth: { value: 16.6, prev: 12.1 },
};

function calcTrend(current: number, prev: number) {
  const pct = ((current - prev) / prev) * 100;
  return { pct: Math.abs(pct).toFixed(1), direction: pct >= 0 ? 'up' : 'down' as 'up' | 'down' };
}

export default function MetricsBentoGrid() {
  // Grid plan: 6 cards → grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-6
  // Row 1: Revenue (spans 2) + Orders + Pending → 4 cols
  // Row 2: Low Stock (alert) + AOV + Growth → 3 cols remaining
  // Final: 3+3 split across xl 6-col grid

  const revTrend = calcTrend(kpiData.totalRevenue.value, kpiData.totalRevenue.prev);
  const orderTrend = calcTrend(kpiData.totalOrders.value, kpiData.totalOrders.prev);
  const pendTrend = calcTrend(kpiData.pendingDeliveries.value, kpiData.pendingDeliveries.prev);
  const stockTrend = calcTrend(kpiData.lowStockItems.value, kpiData.lowStockItems.prev);
  const aovTrend = calcTrend(kpiData.avgOrderValue.value, kpiData.avgOrderValue.prev);
  const growthTrend = calcTrend(kpiData.monthlyGrowth.value, kpiData.monthlyGrowth.prev);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
      {/* Hero: Total Revenue — spans 2 cols on xl+ */}
      <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
        <MetricCard
          id="kpi-revenue"
          label="Total Revenue"
          value="TZS 18,450,000"
          subValue="August 2026"
          trend={revTrend}
          icon="TrendingUp"
          variant="hero"
          description="↑ TZS 2.63M vs July"
        />
      </div>

      {/* Total Orders */}
      <div className="xl:col-span-1 2xl:col-span-1">
        <MetricCard
          id="kpi-orders"
          label="Total Orders"
          value="347"
          subValue="This month"
          trend={orderTrend}
          icon="ShoppingCart"
          variant="default"
          description="+49 vs last month"
        />
      </div>

      {/* Pending Deliveries — warning */}
      <div className="xl:col-span-1 2xl:col-span-1">
        <MetricCard
          id="kpi-pending"
          label="Pending Deliveries"
          value="24"
          subValue="Awaiting dispatch"
          trend={pendTrend}
          icon="Truck"
          variant="warning"
          description="6 more than last week"
        />
      </div>

      {/* Low Stock — alert */}
      <div className="xl:col-span-1 2xl:col-span-1">
        <MetricCard
          id="kpi-stock"
          label="Low Stock Items"
          value="3"
          subValue="Below 10 units"
          trend={stockTrend}
          icon="AlertTriangle"
          variant="alert"
          description="Restock needed today"
        />
      </div>

      {/* Avg Order Value */}
      <div className="xl:col-span-1 2xl:col-span-1">
        <MetricCard
          id="kpi-aov"
          label="Avg. Order Value"
          value="TZS 53,170"
          subValue="Per transaction"
          trend={aovTrend}
          icon="Receipt"
          variant="default"
          description="Stable vs last month"
        />
      </div>
    </div>
  );
}
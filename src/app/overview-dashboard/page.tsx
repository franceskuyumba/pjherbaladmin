import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import MetricsBentoGrid from '../components/MetricsBentoGrid';
import SalesAnalyticsSection from '../components/SalesAnalyticsSection';
import RecentOrdersTable from '../components/RecentOrdersTable';
import QuickActionsBar from '../components/QuickActionsBar';

export default function AdminOverviewPage() {
  return (
    <AdminLayout currentPath="/overview-dashboard">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Overview Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              PJHERBAL CLINIC – Segerea Branch
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live data
            </span>
          </div>
        </div>

        <QuickActionsBar />
        <MetricsBentoGrid />
        <SalesAnalyticsSection />
        <RecentOrdersTable />
      </div>
    </AdminLayout>
  );
}

import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import OrdersHeader from './components/OrdersHeader';
import OrdersTableClient from './components/OrdersTableClient';

export default function OrdersManagementPage() {
  return (
    <AdminLayout currentPath="/orders-management">
      <div className="space-y-5">
        <OrdersHeader />
        <OrdersTableClient />
      </div>
    </AdminLayout>
  );
}
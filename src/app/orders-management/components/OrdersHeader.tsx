import React from 'react';
import { ShoppingCart, Download } from 'lucide-react';

export default function OrdersHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center flex-shrink-0">
          <ShoppingCart size={20} className="text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Process, track and dispatch all customer orders · 347 total this month
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="btn-secondary text-sm">
          <Download size={15} />
          Export CSV
        </button>
        <button className="btn-primary text-sm">
          <ShoppingCart size={15} />
          New Order
        </button>
      </div>
    </div>
  );
}
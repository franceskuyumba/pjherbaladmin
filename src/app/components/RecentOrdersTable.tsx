import React from 'react';
import Link from 'next/link';
import StatusBadge, { OrderStatus } from '@/components/ui/StatusBadge';
import { ArrowRight } from 'lucide-react';

// Backend integration point: GET /api/admin/orders?limit=8&sort=created_at:desc
const recentOrders = [
  { id: 'order-2847', customerId: 'cust-001', customer: 'Amina Juma', amount: 87_500, status: 'Pending' as OrderStatus, date: '05/08/2026', items: 'Moringa Plus x2, SlimFit Tea x1', payment: 'M-Pesa' },
  { id: 'order-2846', customerId: 'cust-002', customer: 'Hassan Mwangi', amount: 45_000, status: 'Paid' as OrderStatus, date: '05/08/2026', items: 'ProstaHealth x1', payment: 'Tigo Pesa' },
  { id: 'order-2845', customerId: 'cust-003', customer: 'Fatuma Ally', amount: 126_000, status: 'Processing' as OrderStatus, date: '04/08/2026', items: 'FemVital x3, BrainBoost x1', payment: 'M-Pesa' },
  { id: 'order-2844', customerId: 'cust-004', customer: 'Juma Rashid', amount: 54_000, status: 'Dispatched' as OrderStatus, date: '04/08/2026', items: 'EnergyMax x2', payment: 'Airtel Money' },
  { id: 'order-2843', customerId: 'cust-005', customer: 'Neema Kileo', amount: 38_500, status: 'Delivered' as OrderStatus, date: '03/08/2026', items: 'DetoxPure x1', payment: 'CRDB Bank' },
  { id: 'order-2842', customerId: 'cust-006', customer: 'Baraka Msigwa', amount: 72_000, status: 'Processing' as OrderStatus, date: '03/08/2026', items: 'SlimFit Tea x2, Moringa x1', payment: 'Selcom' },
  { id: 'order-2841', customerId: 'cust-007', customer: 'Zawadi Otieno', amount: 29_500, status: 'Cancelled' as OrderStatus, date: '02/08/2026', items: 'BrainBoost x1', payment: 'M-Pesa' },
  { id: 'order-2840', customerId: 'cust-008', customer: 'Omari Salehe', amount: 95_000, status: 'Delivered' as OrderStatus, date: '02/08/2026', items: 'ProstaHealth x2, EnergyMax x1', payment: 'NMB Bank' },
];

export default function RecentOrdersTable() {
  return (
    <div className="card-base overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Latest 8 orders — updated 12:38 PM</p>
        </div>
        <Link
          href="/orders-management"
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-mid transition-colors duration-150"
        >
          View all orders
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="table-header-cell">Order ID</th>
              <th className="table-header-cell">Customer</th>
              <th className="table-header-cell">Items</th>
              <th className="table-header-cell">Amount</th>
              <th className="table-header-cell">Payment</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Date</th>
              <th className="table-header-cell">Action</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border hover:bg-muted/40 transition-colors duration-150"
              >
                <td className="table-cell">
                  <span className="font-mono text-xs font-semibold text-primary">#{order.id.split('-')[1]}</span>
                </td>
                <td className="table-cell">
                  <span className="font-medium text-foreground whitespace-nowrap">{order.customer}</span>
                </td>
                <td className="table-cell">
                  <span className="text-muted-foreground max-w-[160px] truncate block text-xs">{order.items}</span>
                </td>
                <td className="table-cell">
                  <span className="font-tabular font-semibold text-foreground whitespace-nowrap">
                    TZS {order.amount.toLocaleString()}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{order.payment}</span>
                </td>
                <td className="table-cell">
                  <StatusBadge status={order.status} size="sm" />
                </td>
                <td className="table-cell">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{order.date}</span>
                </td>
                <td className="table-cell">
                  <Link
                    href="/orders-management"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-mid transition-colors duration-150 whitespace-nowrap"
                  >
                    Process
                    <ArrowRight size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
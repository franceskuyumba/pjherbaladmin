'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, ChevronUp, ChevronDown, Eye, Printer, Loader2, RefreshCw, Truck } from 'lucide-react';
import StatusBadge, { OrderStatus } from '@/components/ui/StatusBadge';
import { statusTabs } from './ordersData';
import OrderDetailModal from './OrderDetailModal';
import { toast } from 'sonner';

export type PaymentMethod = 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'HaloPesa' | 'CRDB Bank' | 'NMB Bank' | 'Selcom';

export interface OrderItem {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  email: string;
  region: string;
  district: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentRef: string;
  status: OrderStatus;
  courier: string;
  date: string;
  notes: string;
  // Delivery workflow fields
  deliveryStatus: string;
  deliveryAddress: string;
  deliveryDistrict: string;
  deliveryRegion: string;
  deliveryNotes: string;
  courierPhone: string;
  courierName: string;
  paymentStatus: string;
}

type SortKey = 'orderId' | 'customer' | 'total' | 'date' | 'status';
type SortDir = 'asc' | 'desc';

const paymentMethodColors: Record<string, string> = {
  'M-Pesa': 'bg-green-100 text-green-700',
  'Tigo Pesa': 'bg-blue-100 text-blue-700',
  'Airtel Money': 'bg-red-100 text-red-700',
  'HaloPesa': 'bg-orange-100 text-orange-700',
  'CRDB Bank': 'bg-slate-100 text-slate-700',
  'NMB Bank': 'bg-purple-100 text-purple-700',
  'Selcom': 'bg-amber-100 text-amber-700',
};

const DELIVERY_STATUS_COLORS: Record<string, string> = {
  Preparing:  'bg-amber-100 text-amber-700',
  Assigned:   'bg-blue-100 text-blue-700',
  Dispatched: 'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
};

function toOrder(row: any): Order {
  return {
    id: row.id,
    orderId: row.order_id,
    customer: row.customer,
    phone: row.phone,
    email: row.email || '',
    region: row.region,
    district: row.district,
    address: row.address || '',
    items: [],
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee ?? 0,
    total: row.total,
    paymentMethod: row.payment_method as PaymentMethod,
    paymentRef: row.payment_ref || '',
    status: row.order_status as OrderStatus,
    courier: row.courier || '',
    date: new Date(row.created_at).toLocaleDateString('en-GB'),
    notes: row.notes || '',
    // Delivery workflow fields
    deliveryStatus: row.delivery_status || 'Preparing',
    deliveryAddress: row.delivery_address || row.address || '',
    deliveryDistrict: row.delivery_district || row.district || '',
    deliveryRegion: row.delivery_region || row.region || '',
    deliveryNotes: row.delivery_notes || '',
    courierPhone: row.courier_phone || '',
    courierName: row.courier_name || '',
    paymentStatus: row.payment_status || 'pending',
  };
}

const statusCounts = (data: Order[]) => {
  const counts: Record<string, number> = { all: data.length };
  data.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
  return counts;
};

export default function OrdersTableClient() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders((data || []).map(toOrder));
    } catch (err: any) {
      toast.error('Failed to load orders', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('orders_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const counts = statusCounts(orders);

  const filtered = useMemo(() => {
    let data = [...orders];
    if (activeTab !== 'all') data = data.filter((o) => o.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.region.toLowerCase().includes(q) ||
          o.paymentMethod.toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortKey === 'total') { av = a.total; bv = b.total; }
      else if (sortKey === 'orderId') { av = a.orderId; bv = b.orderId; }
      else if (sortKey === 'customer') { av = a.customer; bv = b.customer; }
      else if (sortKey === 'date') { av = a.date; bv = b.date; }
      else if (sortKey === 'status') { av = a.status; bv = b.status; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [orders, activeTab, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setCurrentPage(1);
  };

  const handleOrderUpdate = async (orderId: string, status: OrderStatus, courier: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status, courier })
        .eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, courier } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status, courier } : null);
      }
    } catch (err: any) {
      toast.error('Update failed', { description: err.message });
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={13} className="text-muted-foreground/40" />;
    return sortDir === 'asc'
      ? <ChevronUp size={13} className="text-primary" />
      : <ChevronDown size={13} className="text-primary" />;
  };

  return (
    <>
      <div className="card-base overflow-hidden">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-0 border-b border-border overflow-x-auto scrollbar-thin">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.value); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150 ${
                activeTab === tab.value
                  ? 'border-primary text-primary bg-primary-light/40' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {counts[tab.value] || 0}
              </span>
            </button>
          ))}
          <div className="ml-auto px-3">
            <button onClick={fetchOrders} className="p-1.5 rounded hover:bg-muted text-muted-foreground" title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Search + Filters Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3.5 border-b border-border bg-muted/30">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order ID, customer, region, payment…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="input-field pl-8 text-xs py-2"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="btn-ghost text-xs py-2 px-3">
              <Filter size={13} />
              More Filters
            </button>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="text-xs border border-border rounded-lg px-2.5 py-2 bg-card text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={5}>5 per page</option>
              <option value={8}>8 per page</option>
              <option value={15}>15 per page</option>
              <option value={25}>25 per page</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading orders…</span>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="table-header-cell">
                    <button onClick={() => handleSort('orderId')} className="flex items-center gap-1 hover:text-foreground transition-colors duration-150">
                      Order ID <SortIcon col="orderId" />
                    </button>
                  </th>
                  <th className="table-header-cell">
                    <button onClick={() => handleSort('customer')} className="flex items-center gap-1 hover:text-foreground transition-colors duration-150">
                      Customer <SortIcon col="customer" />
                    </button>
                  </th>
                  <th className="table-header-cell">Region / District</th>
                  <th className="table-header-cell">Items</th>
                  <th className="table-header-cell">
                    <button onClick={() => handleSort('total')} className="flex items-center gap-1 hover:text-foreground transition-colors duration-150">
                      Total (TZS) <SortIcon col="total" />
                    </button>
                  </th>
                  <th className="table-header-cell">Payment</th>
                  <th className="table-header-cell">
                    <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-foreground transition-colors duration-150">
                      Status <SortIcon col="status" />
                    </button>
                  </th>
                  <th className="table-header-cell">
                    <span className="flex items-center gap-1"><Truck size={12} /> Delivery</span>
                  </th>
                  <th className="table-header-cell">Courier</th>
                  <th className="table-header-cell">
                    <button onClick={() => handleSort('date')} className="flex items-center gap-1 hover:text-foreground transition-colors duration-150">
                      Date <SortIcon col="date" />
                    </button>
                  </th>
                  <th className="table-header-cell text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={32} className="text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">No orders found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-primary-light/20 transition-colors duration-150 group">
                      <td className="table-cell">
                        <span className="font-mono text-xs font-bold text-primary">{order.orderId}</span>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="font-semibold text-foreground text-sm whitespace-nowrap">{order.customer}</p>
                          <p className="text-[11px] text-muted-foreground">{order.phone}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <p className="text-sm text-foreground whitespace-nowrap">{order.region}</p>
                        <p className="text-[11px] text-muted-foreground">{order.district}</p>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="font-tabular font-semibold text-foreground text-sm whitespace-nowrap">
                          {order.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${paymentMethodColors[order.paymentMethod] || 'bg-muted text-muted-foreground'}`}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="table-cell">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${DELIVERY_STATUS_COLORS[order.deliveryStatus] || 'bg-muted text-muted-foreground'}`}>
                          {order.deliveryStatus || 'Preparing'}
                        </span>
                      </td>
                      <td className="table-cell">
                        {order.courier ? (
                          <span className="text-xs text-foreground">{order.courier}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{order.date}</span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg hover:bg-primary-light text-muted-foreground hover:text-primary transition-colors duration-150"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150"
                            title="Print Invoice"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filtered.length)}–{Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} orders
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleOrderUpdate}
        />
      )}
    </>
  );
}
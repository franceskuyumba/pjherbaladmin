'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { createClient } from '@/lib/supabase/client';
import { Users, Search, MessageCircle, Phone, MapPin, ShoppingBag, TrendingUp, Loader2, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


interface Customer {
  id: string;
  customer: string;
  phone: string;
  email: string | null;
  region: string;
  district: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export default function AdminCustomersPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('customer, phone, email, region, district, total, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate by phone number
      const map = new Map<string, Customer>();
      (data || []).forEach((row: any) => {
        const key = row.phone;
        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.orderCount += 1;
          existing.totalSpent += row.total || 0;
          if (row.created_at > existing.lastOrderDate) {
            existing.lastOrderDate = row.created_at;
          }
        } else {
          map.set(key, {
            id: key,
            customer: row.customer,
            phone: row.phone,
            email: row.email,
            region: row.region,
            district: row.district,
            orderCount: 1,
            totalSpent: row.total || 0,
            lastOrderDate: row.created_at,
          });
        }
      });

      setCustomers(Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent));
    } catch (err: any) {
      toast.error('Failed to load customers', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const regions = useMemo(() => {
    const r = new Set(customers.map(c => c.region).filter(Boolean));
    return Array.from(r).sort();
  }, [customers]);

  const filtered = useMemo(() => {
    let data = [...customers];
    if (regionFilter !== 'all') data = data.filter(c => c.region === regionFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(c =>
        c.customer?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.region?.toLowerCase().includes(q) ||
        c.district?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [customers, search, regionFilter]);

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.orderCount, 0);

  const whatsappLink = (phone: string, name: string) => {
    const num = phone.replace(/\D/g, '');
    const intl = num.startsWith('0') ? '255' + num.slice(1) : num;
    const msg = encodeURIComponent(`Hello ${name}, this is PJHERBAL CLINIC – Segerea Branch. How can we assist you today?`);
    return `https://wa.me/${intl}?text=${msg}`;
  };

  return (
    <AdminLayout currentPath="/admin/customers">
      <div className="p-4 lg:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users size={20} className="text-primary" /> Customer Database
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{customers.length} unique customers from order history</p>
          </div>
          <button onClick={fetchCustomers} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Customers', value: customers.length.toString(), icon: Users, color: 'text-[#1b4d3e]', bg: 'bg-[#f0f7f4]' },
            { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, color: 'text-[#4e9f3d]', bg: 'bg-[#f0f7f4]' },
            { label: 'Total Revenue', value: `TZS ${(totalRevenue / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-[#d4af37]', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-4">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon size={15} className={color} />
              </div>
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, phone, region…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-card"
            />
          </div>
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border text-xs bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading customers…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users size={40} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Customer</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Region</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Orders</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total Spent</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Last Order</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(customer => (
                    <tr key={customer.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-white">{customer.customer?.slice(0, 2).toUpperCase() || 'CU'}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{customer.customer}</p>
                            <p className="text-[10px] text-muted-foreground">{customer.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin size={10} />
                          <span>{customer.region}{customer.district ? `, ${customer.district}` : ''}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f7f4] text-[#1b4d3e] font-bold text-[10px]">
                          {customer.orderCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-foreground">TZS {customer.totalSpent.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell text-muted-foreground">
                        {new Date(customer.lastOrderDate).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="View details"
                          >
                            <Eye size={13} />
                          </button>
                          <a
                            href={whatsappLink(customer.phone, customer.customer)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-[#f0fdf4] text-[#25D366] transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={13} />
                          </a>
                          <a
                            href={`tel:${customer.phone}`}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Call customer"
                          >
                            <Phone size={13} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCustomer(null)}>
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center">
                  <span className="text-base font-bold text-white">{selectedCustomer.customer?.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{selectedCustomer.customer}</h3>
                  <p className="text-xs text-muted-foreground">PJHERBAL Customer</p>
                </div>
              </div>
              <div className="space-y-2.5 text-xs">
                {[
                  { label: 'Phone', value: selectedCustomer.phone },
                  { label: 'Email', value: selectedCustomer.email || 'Not provided' },
                  { label: 'Region', value: selectedCustomer.region },
                  { label: 'District', value: selectedCustomer.district },
                  { label: 'Total Orders', value: selectedCustomer.orderCount.toString() },
                  { label: 'Total Spent', value: `TZS ${selectedCustomer.totalSpent.toLocaleString()}` },
                  { label: 'Last Order', value: new Date(selectedCustomer.lastOrderDate).toLocaleDateString('en-TZ', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground text-right">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-5">
                <a
                  href={whatsappLink(selectedCustomer.phone, selectedCustomer.customer)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-xs hover:bg-[#20bd5a] transition-colors"
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>
                <button onClick={() => setSelectedCustomer(null)} className="flex-1 py-2.5 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

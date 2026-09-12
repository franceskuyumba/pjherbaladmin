'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { createClient } from '@/lib/supabase/client';
import { Boxes, Search, AlertTriangle, Loader2, RefreshCw, TrendingDown, Package, Edit2, Save, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


interface InventoryItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  stock_count: number;
  price: number;
  is_active: boolean;
  updated_at: string;
}

const LOW_STOCK_THRESHOLD = 10;
const CRITICAL_STOCK_THRESHOLD = 3;

function getStockStatus(count: number): { label: string; color: string } {
  if (count === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
  if (count <= CRITICAL_STOCK_THRESHOLD) return { label: 'Critical', color: 'bg-red-100 text-red-700' };
  if (count <= LOW_STOCK_THRESHOLD) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700' };
  return { label: 'In Stock', color: 'bg-green-100 text-green-700' };
}

export default function AdminInventoryPage() {
  const supabase = createClient();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, category, stock_count, price, is_active, updated_at')
        .order('stock_count', { ascending: true });
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      toast.error('Failed to load inventory', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    const channel = supabase
      .channel('inventory_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchInventory)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    let data = [...items];
    if (stockFilter === 'low') data = data.filter(i => i.stock_count > 0 && i.stock_count <= LOW_STOCK_THRESHOLD);
    if (stockFilter === 'out') data = data.filter(i => i.stock_count === 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    return data;
  }, [items, search, stockFilter]);

  const stats = useMemo(() => ({
    total: items.length,
    inStock: items.filter(i => i.stock_count > LOW_STOCK_THRESHOLD).length,
    lowStock: items.filter(i => i.stock_count > 0 && i.stock_count <= LOW_STOCK_THRESHOLD).length,
    outOfStock: items.filter(i => i.stock_count === 0).length,
    totalUnits: items.reduce((sum, i) => sum + i.stock_count, 0),
  }), [items]);

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditStock(item.stock_count);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStock(0);
  };

  const saveStock = async (id: string) => {
    if (editStock < 0) { toast.error('Stock cannot be negative'); return; }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_count: editStock, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      toast.success('Stock updated');
      setEditingId(null);
      fetchInventory();
    } catch (err: any) {
      toast.error('Update failed', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout currentPath="/admin/inventory">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center flex-shrink-0">
              <Boxes size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {stats.totalUnits.toLocaleString()} total units across {stats.total} products
              </p>
            </div>
          </div>
          <button onClick={fetchInventory} className="btn-ghost text-sm" title="Refresh">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'In Stock', value: stats.inStock, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Low Stock', value: stats.lowStock, icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Out of Stock', value: stats.outOfStock, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Total Units', value: stats.totalUnits.toLocaleString(), icon: Package, color: 'text-primary', bg: 'bg-primary-light' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card-base p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Low Stock Alert Banner */}
        {stats.lowStock > 0 || stats.outOfStock > 0 ? (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Stock Alert</p>
              <p className="text-xs text-red-600 mt-0.5">
                {stats.outOfStock > 0 && <span>{stats.outOfStock} product{stats.outOfStock > 1 ? 's' : ''} out of stock. </span>}
                {stats.lowStock > 0 && <span>{stats.lowStock} product{stats.lowStock > 1 ? 's' : ''} running low (≤{LOW_STOCK_THRESHOLD} units).</span>}
              </p>
            </div>
          </div>
        ) : null}

        {/* Filters */}
        <div className="card-base p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text" placeholder="Search products…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {([
              { key: 'all', label: 'All' },
              { key: 'low', label: `Low (${stats.lowStock})` },
              { key: 'out', label: `Out (${stats.outOfStock})` },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStockFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stockFilter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="card-base overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading inventory…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Boxes size={32} className="text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No products match filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Stock</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Price</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Update Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(item => {
                    const status = getStockStatus(item.stock_count);
                    const isEditing = editingId === item.id;
                    return (
                      <tr key={item.id} className={`hover:bg-muted/20 transition-colors ${item.stock_count === 0 ? 'bg-red-50/30' : item.stock_count <= LOW_STOCK_THRESHOLD ? 'bg-amber-50/20' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground text-sm">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.slug}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">{item.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number" min={0} value={editStock}
                              onChange={e => setEditStock(Number(e.target.value))}
                              className="w-20 px-2 py-1 rounded-lg border border-primary text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                              autoFocus
                            />
                          ) : (
                            <span className={`text-sm font-bold ${item.stock_count === 0 ? 'text-red-600' : item.stock_count <= LOW_STOCK_THRESHOLD ? 'text-amber-600' : 'text-foreground'}`}>
                              {item.stock_count}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs font-semibold text-foreground">TZS {item.price.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveStock(item.id)}
                                  disabled={saving}
                                  className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                  title="Save"
                                >
                                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEdit(item)}
                                className="p-1.5 rounded-lg hover:bg-primary-light text-muted-foreground hover:text-primary transition-colors"
                                title="Edit stock"
                              >
                                <Edit2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

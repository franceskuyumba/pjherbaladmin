'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { createClient } from '@/lib/supabase/client';
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle, Loader2, X, Save, RefreshCw, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice: number;
  stockCount: number;
  description: string;
  ingredients: string;
  usageInstructions: string;
  warnings: string;
  imageUrl: string;
  imageUrl2: string;
  imageUrl3: string;
  isActive: boolean;
  isFeatured: boolean;
}

const CATEGORIES = [
  "Men\'s Health", "Women\'s Wellness", "Weight Management",
  "Brain & Focus", "Energy & Immunity", "Detox & Digestion", "Pain Relief", "General Wellness"
];

const emptyForm = (): Omit<Product, 'id'> => ({
  name: '', slug: '', category: "Men's Health", price: 0, originalPrice: 0,
  stockCount: 0, description: '', ingredients: '', usageInstructions: '',
  warnings: '', imageUrl: '', imageUrl2: '', imageUrl3: '', isActive: true, isFeatured: false,
});

function toProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: row.price,
    originalPrice: row.original_price || 0,
    stockCount: row.stock_count,
    description: row.description || '',
    ingredients: row.ingredients || '',
    usageInstructions: row.usage_instructions || '',
    warnings: row.warnings || '',
    imageUrl: row.image_url || '',
    imageUrl2: row.image_url_2 || '',
    imageUrl3: row.image_url_3 || '',
    isActive: row.is_active,
    isFeatured: row.is_featured || false,
  };
}

function ImagePreview({ url, label }: { url: string; label: string }) {
  const [error, setError] = useState(false);
  useEffect(() => { setError(false); }, [url]);
  if (!url) return null;
  return (
    <div className="mt-1.5 relative w-full h-24 rounded-lg overflow-hidden border border-border bg-muted/30">
      {error ? (
        <div className="flex flex-col items-center justify-center h-full gap-1 text-muted-foreground">
          <ImageIcon size={18} />
          <span className="text-[10px]">Invalid URL</span>
        </div>
      ) : (
        <img
          src={url}
          alt={label}
          className="w-full h-full object-contain"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'images'>('basic');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts((data || []).map(toProduct));
    } catch (err: any) {
      toast.error('Failed to load products', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel('products_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    let data = [...products];
    if (categoryFilter !== 'all') data = data.filter(p => p.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return data;
  }, [products, search, categoryFilter]);

  const lowStockCount = products.filter(p => p.stockCount < 10).length;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setActiveTab('basic');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, slug: p.slug, category: p.category, price: p.price,
      originalPrice: p.originalPrice, stockCount: p.stockCount,
      description: p.description, ingredients: p.ingredients,
      usageInstructions: p.usageInstructions, warnings: p.warnings,
      imageUrl: p.imageUrl, imageUrl2: p.imageUrl2, imageUrl3: p.imageUrl3,
      isActive: p.isActive, isFeatured: p.isFeatured,
    });
    setActiveTab('basic');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Name and Slug are required');
      setActiveTab('basic');
      return;
    }
    if (form.price <= 0) {
      toast.error('Price must be greater than 0');
      setActiveTab('basic');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name, slug: form.slug, category: form.category,
        price: Number(form.price),
        stock_count: Number(form.stockCount),
        description: form.description, ingredients: form.ingredients,
        usage_instructions: form.usageInstructions, warnings: form.warnings,
        image_url: form.imageUrl,
        is_active: form.isActive,
        is_featured: form.isFeatured,
      };
      // Only add extra image fields if they exist in schema (graceful)
      if (form.originalPrice > 0) payload.original_price = Number(form.originalPrice);
      if (form.imageUrl2) payload.image_url_2 = form.imageUrl2;
      if (form.imageUrl3) payload.image_url_3 = form.imageUrl3;

      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast.success('Product added successfully');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err: any) {
      toast.error('Save failed', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success(`"${name}" deleted`);
      fetchProducts();
    } catch (err: any) {
      toast.error('Delete failed', { description: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (p: Product) => {
    try {
      const { error } = await supabase.from('products').update({ is_active: !p.isActive }).eq('id', p.id);
      if (error) throw error;
      toast.success(`${p.name} ${!p.isActive ? 'activated' : 'deactivated'}`);
      fetchProducts();
    } catch (err: any) {
      toast.error('Update failed', { description: err.message });
    }
  };

  const TABS = [
    { id: 'basic' as const, label: 'Basic Info' },
    { id: 'details' as const, label: 'Details' },
    { id: 'images' as const, label: 'Photos' },
  ];

  return (
    <AdminLayout currentPath="/admin/products">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center flex-shrink-0">
              <Package size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Product Catalog</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {products.length} products{lowStockCount > 0 && (
                  <> · <span className="text-red-600 font-semibold">{lowStockCount} low stock</span></>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchProducts} className="btn-ghost text-sm" title="Refresh">
              <RefreshCw size={15} />
            </button>
            <button onClick={openAdd} className="btn-primary text-sm">
              <Plus size={15} />
              Add Product
            </button>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockCount > 0 && (
          <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">
              {lowStockCount} product{lowStockCount > 1 ? 's' : ''} with stock below 10 units — restock needed
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="card-base p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-8 text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="input-field text-sm w-full sm:w-48"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card-base overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading products…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Package size={32} className="text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="table-header-cell">Product</th>
                    <th className="table-header-cell">Category</th>
                    <th className="table-header-cell">Price (TZS)</th>
                    <th className="table-header-cell">Stock</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-border hover:bg-primary-light/20 transition-colors duration-150">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          {/* Product thumbnail */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-border bg-muted/30">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={e => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full gradient-emerald flex items-center justify-center"><span class="text-white text-xs">🌿</span></div>';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full gradient-emerald flex items-center justify-center">
                                <span className="text-white text-xs">🌿</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">{p.slug}</p>
                            {p.isFeatured && (
                              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">⭐ Featured</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs px-2 py-1 bg-primary-light text-primary rounded-full font-medium">{p.category}</span>
                      </td>
                      <td className="table-cell">
                        <div>
                          <span className="font-tabular font-semibold text-foreground text-sm">
                            {p.price.toLocaleString()}
                          </span>
                          {p.originalPrice > 0 && p.originalPrice > p.price && (
                            <p className="text-[10px] text-muted-foreground line-through">{p.originalPrice.toLocaleString()}</p>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${
                          p.stockCount < 10
                            ? 'bg-red-100 text-red-700'
                            : p.stockCount < 20
                              ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {p.stockCount < 10 && <AlertTriangle size={10} />}
                          {p.stockCount} units
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                            p.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg hover:bg-primary-light text-muted-foreground hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deletingId === p.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 fade-in">
            <div className="bg-card rounded-t-2xl sm:rounded-2xl shadow-modal w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Changes reflect on storefront immediately
                  </p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border px-4 sm:px-6 sticky top-[65px] bg-card z-10">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="px-4 sm:px-6 py-5 space-y-4">

                {/* ── BASIC INFO TAB ── */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-foreground mb-1.5">Product Name *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={e => setForm(f => ({
                            ...f,
                            name: e.target.value,
                            slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                          }))}
                          className="input-field text-sm"
                          placeholder="e.g. Moringa Plus Capsules"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">URL Slug *</label>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                          className="input-field text-sm font-mono"
                          placeholder="moringa-plus-capsules"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">Category</label>
                        <select
                          value={form.category}
                          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                          className="input-field text-sm"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">Selling Price (TZS) *</label>
                        <input
                          type="number"
                          value={form.price}
                          onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                          className="input-field text-sm"
                          min={0}
                          placeholder="e.g. 25000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Original Price (TZS)
                          <span className="ml-1 text-muted-foreground font-normal">(for discount display)</span>
                        </label>
                        <input
                          type="number"
                          value={form.originalPrice}
                          onChange={e => setForm(f => ({ ...f, originalPrice: Number(e.target.value) }))}
                          className="input-field text-sm"
                          min={0}
                          placeholder="Leave 0 if no discount"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">Stock Count</label>
                        <input
                          type="number"
                          value={form.stockCount}
                          onChange={e => setForm(f => ({ ...f, stockCount: Number(e.target.value) }))}
                          className="input-field text-sm"
                          min={0}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Description</label>
                      <textarea
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        className="input-field text-sm resize-none"
                        rows={3}
                        placeholder="Describe the product benefits and what it does…"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-2.5">
                        <input
                          id="is-active"
                          type="checkbox"
                          checked={form.isActive}
                          onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <label htmlFor="is-active" className="text-sm text-foreground cursor-pointer">
                          Active <span className="text-muted-foreground text-xs">(visible on storefront)</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <input
                          id="is-featured"
                          type="checkbox"
                          checked={form.isFeatured}
                          onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <label htmlFor="is-featured" className="text-sm text-foreground cursor-pointer">
                          Featured <span className="text-muted-foreground text-xs">(show on homepage)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── DETAILS TAB ── */}
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Ingredients</label>
                      <textarea
                        value={form.ingredients}
                        onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                        className="input-field text-sm resize-none"
                        rows={3}
                        placeholder="List all ingredients, e.g. Moringa leaf extract, Ginger root…"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Usage Instructions</label>
                      <textarea
                        value={form.usageInstructions}
                        onChange={e => setForm(f => ({ ...f, usageInstructions: e.target.value }))}
                        className="input-field text-sm resize-none"
                        rows={3}
                        placeholder="e.g. Take 2 capsules daily with water after meals…"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Warnings / Precautions</label>
                      <textarea
                        value={form.warnings}
                        onChange={e => setForm(f => ({ ...f, warnings: e.target.value }))}
                        className="input-field text-sm resize-none"
                        rows={2}
                        placeholder="e.g. Keep out of reach of children. Consult doctor if pregnant…"
                      />
                    </div>
                  </div>
                )}

                {/* ── IMAGES TAB ── */}
                {activeTab === 'images' && (
                  <div className="space-y-5">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                      <p className="font-semibold mb-0.5">📸 How to add product photos</p>
                      <p>Paste a direct image URL (ending in .jpg, .png, .webp). You can upload images to free services like <strong>imgbb.com</strong> or <strong>postimages.org</strong> and paste the direct link here.</p>
                    </div>

                    {/* Main Photo */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Main Photo URL <span className="text-red-500">*</span>
                        <span className="ml-1 text-muted-foreground font-normal">(shown on homepage & product page)</span>
                      </label>
                      <input
                        type="url"
                        value={form.imageUrl}
                        onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                        className="input-field text-sm"
                        placeholder="https://i.ibb.co/example/product-main.jpg"
                      />
                      <ImagePreview url={form.imageUrl} label="Main product photo" />
                    </div>

                    {/* Photo 2 */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Photo 2 URL
                        <span className="ml-1 text-muted-foreground font-normal">(optional — gallery)</span>
                      </label>
                      <input
                        type="url"
                        value={form.imageUrl2}
                        onChange={e => setForm(f => ({ ...f, imageUrl2: e.target.value }))}
                        className="input-field text-sm"
                        placeholder="https://i.ibb.co/example/product-2.jpg"
                      />
                      <ImagePreview url={form.imageUrl2} label="Product photo 2" />
                    </div>

                    {/* Photo 3 */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Photo 3 URL
                        <span className="ml-1 text-muted-foreground font-normal">(optional — gallery)</span>
                      </label>
                      <input
                        type="url"
                        value={form.imageUrl3}
                        onChange={e => setForm(f => ({ ...f, imageUrl3: e.target.value }))}
                        className="input-field text-sm"
                        placeholder="https://i.ibb.co/example/product-3.jpg"
                      />
                      <ImagePreview url={form.imageUrl3} label="Product photo 3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-border sticky bottom-0 bg-card">
                <div className="flex gap-2">
                  {TABS.map((tab, i) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-2 h-2 rounded-full transition-all ${activeTab === tab.id ? 'bg-primary w-4' : 'bg-muted-foreground/30'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                    {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Product</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { createClient } from '@/lib/supabase/client';
import { Megaphone, Plus, Tag, Percent, DollarSign, Trash2, Loader2, RefreshCw, MessageCircle, Send, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const CAMPAIGN_TEMPLATES = [
  {
    id: 'abandoned_cart',
    title: 'Abandoned Cart Reminder',
    icon: '🛒',
    message: `Hello {name}! 👋\n\nYou left some amazing PJHERBAL products in your cart. Don't miss out!\n\n🌿 Your cart is waiting for you.\n🚚 FREE delivery across Tanzania.\n\nOrder now: https://pjherbalad2363.builtwithrocket.new/shop\n\n– PJHERBAL CLINIC, Segerea Branch\n📞 0763 963 644`,
  },
  {
    id: 'reorder_prompt',title: 'Reorder Reminder',icon: '🔄',
    message: `Hello {name}! 🌿\n\nIt's been a while since your last order. Time to restock your herbal wellness products!\n\n✅ Same great quality\n🚚 FREE delivery to your door\n💊 Your health is our priority\n\nShop now: https://pjherbalad2363.builtwithrocket.new/shop\n\n– PJHERBAL CLINIC, Segerea Branch\n📞 0763 963 644`,
  },
  {
    id: 'flash_sale',
    title: 'Flash Sale Announcement',
    icon: '⚡',
    message: `🔥 FLASH SALE ALERT! 🔥\n\nHello {name}!\n\nFor the next 24 hours, enjoy SPECIAL DISCOUNTS on selected PJHERBAL products!\n\n🌿 Men's Health products\n💪 Energy & Immunity boosters\n⚖️ Weight Management solutions\n\n🚚 FREE delivery across Tanzania\n\nShop now before stock runs out:\nhttps://pjherbalad2363.builtwithrocket.new/shop\n\n– PJHERBAL CLINIC, Segerea Branch`,
  },
  {
    id: 'new_product',title: 'New Product Launch',icon: '🆕',
    message: `Hello {name}! 🌿\n\nExciting news! We've just launched a NEW herbal wellness product at PJHERBAL CLINIC!\n\n✨ Specially formulated for Tanzanian health needs\n🌱 100% natural ingredients\n🚚 FREE delivery across Tanzania\n\nBe among the first to try it:\nhttps://pjherbalad2363.builtwithrocket.new/shop\n\n– PJHERBAL CLINIC, Segerea Branch\n📞 0763 963 644`,
  },
  {
    id: 'wellness_tip',
    title: 'Wellness Tip + Soft Sell',
    icon: '💡',
    message: `Hello {name}! 🌿\n\nHealth Tip of the Week:\n\n"Staying hydrated and taking natural herbal supplements daily can significantly improve your energy levels and immunity."\n\n💊 Explore our Energy & Immunity range:\nhttps://pjherbalad2363.builtwithrocket.new/shop\n\n🚚 FREE delivery across Tanzania\n\n– PJHERBAL CLINIC, Segerea Branch`,
  },
];

const emptyPromo = () => ({
  code: '',
  discount_type: 'percentage' as const,
  discount_value: 10,
  min_order_amount: '',
  max_uses: '',
  expires_at: '',
});

export default function AdminMarketingPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<'campaigns' | 'promos'>('campaigns');
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm] = useState(emptyPromo());
  const [savingPromo, setSavingPromo] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof CAMPAIGN_TEMPLATES[0] | null>(null);

  const fetchPromoCodes = async () => {
    setLoadingPromos(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPromoCodes(data || []);
    } catch (err: any) {
      toast.error('Failed to load promo codes', { description: err.message });
    } finally {
      setLoadingPromos(false);
    }
  };

  useEffect(() => { fetchPromoCodes(); }, []);

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.code.trim()) { toast.error('Promo code is required'); return; }
    setSavingPromo(true);
    try {
      const payload: any = {
        code: promoForm.code.toUpperCase().trim(),
        discount_type: promoForm.discount_type,
        discount_value: Number(promoForm.discount_value),
        min_order_amount: promoForm.min_order_amount ? Number(promoForm.min_order_amount) : null,
        max_uses: promoForm.max_uses ? Number(promoForm.max_uses) : null,
        expires_at: promoForm.expires_at || null,
        is_active: true,
        used_count: 0,
      };
      const { error } = await supabase.from('promo_codes').insert(payload);
      if (error) throw error;
      toast.success('Promo code created!');
      setPromoForm(emptyPromo());
      setShowPromoForm(false);
      fetchPromoCodes();
    } catch (err: any) {
      toast.error('Failed to create promo code', { description: err.message });
    } finally {
      setSavingPromo(false);
    }
  };

  const handleDeletePromo = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
      toast.success('Promo code deleted');
      setPromoCodes(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      toast.error('Failed to delete', { description: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePromo = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('promo_codes').update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
      toast.success(`Promo code ${!current ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      toast.error('Failed to update', { description: err.message });
    }
  };

  const copyTemplate = (template: typeof CAMPAIGN_TEMPLATES[0]) => {
    navigator.clipboard.writeText(template.message).then(() => {
      setCopiedTemplate(template.id);
      toast.success('Template copied to clipboard!');
      setTimeout(() => setCopiedTemplate(null), 2000);
    });
  };

  return (
    <AdminLayout currentPath="/admin/marketing">
      <div className="p-4 lg:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Megaphone size={20} className="text-primary" /> Marketing & Automation
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">WhatsApp campaigns and promo code management</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-fit">
          {(['campaigns', 'promos'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t === 'campaigns' ? '📱 WhatsApp Campaigns' : '🏷️ Promo Codes'}
            </button>
          ))}
        </div>

        {/* WhatsApp Campaigns Tab */}
        {tab === 'campaigns' && (
          <div className="space-y-4">
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4">
              <p className="text-sm font-semibold text-[#166534] flex items-center gap-2">
                <MessageCircle size={15} /> WhatsApp Campaign Templates
              </p>
              <p className="text-xs text-[#166534]/70 mt-1">
                Copy any template below and send via WhatsApp Business. Replace {'{name}'} with the customer's name before sending.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CAMPAIGN_TEMPLATES.map(template => (
                <div key={template.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{template.icon}</span>
                      <span className="text-sm font-bold text-foreground">{template.title}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => copyTemplate(template)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${copiedTemplate === template.id ? 'bg-[#f0f7f4] text-[#1b4d3e]' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                      >
                        {copiedTemplate === template.id ? <><CheckCircle size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                      </button>
                      <button
                        onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                      >
                        {selectedTemplate?.id === template.id ? 'Hide' : 'Preview'}
                      </button>
                    </div>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <div className="p-4">
                      <pre className="text-xs text-[#555] whitespace-pre-wrap font-sans leading-relaxed bg-[#f9f8f6] rounded-lg p-3 border border-[#e8e4dc]">{template.message}</pre>
                      <a
                        href={`https://wa.me/255763963644?text=${encodeURIComponent(template.message.replace('{name}', 'Customer'))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-xs hover:bg-[#20bd5a] transition-colors"
                      >
                        <Send size={12} /> Send via WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promo Codes Tab */}
        {tab === 'promos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-foreground">{promoCodes.length} promo codes</p>
              <div className="flex gap-2">
                <button onClick={fetchPromoCodes} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <RefreshCw size={12} /> Refresh
                </button>
                <button
                  onClick={() => setShowPromoForm(!showPromoForm)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                  <Plus size={13} /> New Code
                </button>
              </div>
            </div>

            {/* Create Promo Form */}
            {showPromoForm && (
              <form onSubmit={handleSavePromo} className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Create Promo Code</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Code *</label>
                    <input
                      value={promoForm.code}
                      onChange={e => setPromoForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                      required
                      placeholder="e.g. SAVE20"
                      className="w-full px-3 py-2 rounded-lg border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Discount Type</label>
                    <select
                      value={promoForm.discount_type}
                      onChange={e => setPromoForm(p => ({ ...p, discount_type: e.target.value as any }))}
                      className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (TZS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Discount Value {promoForm.discount_type === 'percentage' ? '(%)' : '(TZS)'}
                    </label>
                    <input
                      type="number"
                      value={promoForm.discount_value}
                      onChange={e => setPromoForm(p => ({ ...p, discount_value: Number(e.target.value) }))}
                      required
                      min={1}
                      className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Min. Order Amount (TZS)</label>
                    <input
                      type="number"
                      value={promoForm.min_order_amount}
                      onChange={e => setPromoForm(p => ({ ...p, min_order_amount: e.target.value }))}
                      placeholder="Optional"
                      className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Max Uses</label>
                    <input
                      type="number"
                      value={promoForm.max_uses}
                      onChange={e => setPromoForm(p => ({ ...p, max_uses: e.target.value }))}
                      placeholder="Unlimited"
                      className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={promoForm.expires_at}
                      onChange={e => setPromoForm(p => ({ ...p, expires_at: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={savingPromo} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {savingPromo ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : <><Plus size={12} /> Create Code</>}
                  </button>
                  <button type="button" onClick={() => setShowPromoForm(false)} className="px-4 py-2 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Promo Codes List */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {loadingPromos ? (
                <div className="flex items-center justify-center py-12 gap-2">
                  <Loader2 size={18} className="animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Loading promo codes…</span>
                </div>
              ) : promoCodes.length === 0 ? (
                <div className="text-center py-12">
                  <Tag size={36} className="text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">No promo codes yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first promo code above</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Code</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Discount</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Uses</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Expires</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {promoCodes.map(promo => (
                        <tr key={promo.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">{promo.code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {promo.discount_type === 'percentage' ? <Percent size={11} className="text-[#4e9f3d]" /> : <DollarSign size={11} className="text-[#d4af37]" />}
                              <span className="font-semibold text-foreground">
                                {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `TZS ${promo.discount_value.toLocaleString()}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center hidden sm:table-cell text-muted-foreground">
                            {promo.used_count}{promo.max_uses ? `/${promo.max_uses}` : ''}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                            {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No expiry'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleTogglePromo(promo.id, promo.is_active)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${promo.is_active ? 'bg-[#f0f7f4] text-[#1b4d3e] hover:bg-red-50 hover:text-red-600' : 'bg-red-50 text-red-600 hover:bg-[#f0f7f4] hover:text-[#1b4d3e]'}`}
                            >
                              {promo.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeletePromo(promo.id)}
                              disabled={deletingId === promo.id}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-40"
                            >
                              {deletingId === promo.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { ShoppingCart, Search, Plus, Minus, Trash2, Loader2, CheckCircle, Leaf, User, Phone, CreditCard, Banknote, Printer, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_count: number;
  image_url: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'mpesa', label: 'M-Pesa', icon: CreditCard },
  { value: 'airtel', label: 'Airtel Money', icon: CreditCard },
  { value: 'tigopesa', label: 'Tigo Pesa', icon: CreditCard },
  { value: 'halopesa', label: 'Halo Pesa', icon: CreditCard },
  { value: 'nmb', label: 'NMB Bank', icon: CreditCard },
  { value: 'crdb', label: 'CRDB Bank', icon: CreditCard },
];

export default function POSPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState<{ orderId: string; total: number } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, category, price, stock_count, image_url')
        .eq('is_active', true)
        .gt('stock_count', 0)
        .order('name');
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.findIndex(i => i.product.id === product.id);
      if (existing >= 0) {
        const updated = [...prev];
        if (updated[existing].quantity < product.stock_count) {
          updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
        }
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev
      .map(item => item.product.id === productId
        ? { ...item, quantity: Math.max(0, Math.min(item.product.stock_count, item.quantity + delta)) }
        : item
      )
      .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const generateOrderId = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `POS-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.floor(Math.random() * 9000) + 1000}`;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setProcessing(true);
    try {
      const orderId = generateOrderId();
      const email = customerPhone
        ? `pos_${customerPhone.replace(/\s/g, '')}@pjherbal.pos`
        : `pos_walkin_${Date.now()}@pjherbal.pos`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_id: orderId,
          email,
          customer_name: customerName || 'Walk-in Customer',
          phone: customerPhone || null,
          total: cartTotal,
          order_status: 'Delivered',
          payment_method: paymentMethod,
          payment_status: 'paid',
          delivery_type: 'walk_in',
          notes: 'POS Walk-in Sale',
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Update stock
      for (const item of cart) {
        await supabase
          .from('products')
          .update({ stock_count: item.product.stock_count - item.quantity })
          .eq('id', item.product.id);
      }

      setLastOrder({ orderId, total: cartTotal });
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('cash');
      toast.success(`Order ${orderId} completed!`);

      // Refresh products to update stock
      const { data: refreshed } = await supabase
        .from('products')
        .select('id, name, category, price, stock_count, image_url')
        .eq('is_active', true)
        .gt('stock_count', 0)
        .order('name');
      setProducts(refreshed || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process order');
    }
    setProcessing(false);
  };

  const printReceipt = () => {
    if (!lastOrder) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt ${lastOrder.orderId}</title>
    <style>body{font-family:monospace;max-width:300px;margin:0 auto;padding:16px;font-size:12px;}
    h2{text-align:center;margin:0;font-size:14px;} .center{text-align:center;} .line{border-top:1px dashed #000;margin:8px 0;}
    .row{display:flex;justify-content:space-between;} .total{font-weight:bold;font-size:14px;}
    </style></head><body>
    <h2>PJHERBAL CLINIC</h2>
    <p class="center">Segerea Branch, Dar es Salaam</p>
    <p class="center">Tel: 0765 754 024</p>
    <div class="line"></div>
    <p><strong>Order:</strong> ${lastOrder.orderId}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString('en-TZ')}</p>
    <p><strong>Payment:</strong> ${paymentMethod.toUpperCase()}</p>
    <div class="line"></div>
    <div class="row total"><span>TOTAL</span><span>TZS ${lastOrder.total.toLocaleString()}</span></div>
    <div class="line"></div>
    <p class="center">Thank you for your purchase!</p>
    <p class="center">wa.me/255763963644</p>
    </body></html>`);
    win.print();
  };

  return (
    <AdminLayout currentPath="/admin/pos">
      <div className="flex flex-col lg:flex-row h-full gap-0 min-h-screen">
        {/* Products Panel */}
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary" /> Point of Sale
            </h1>
            {lastOrder && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle size={13} className="text-green-600" />
                <span className="text-xs font-semibold text-green-700">Last: {lastOrder.orderId}</span>
                <button onClick={printReceipt} className="text-xs text-green-600 hover:underline flex items-center gap-1">
                  <Printer size={11} /> Print
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const inCart = cart.find(i => i.product.id === product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`text-left rounded-xl border p-3 transition-all hover:shadow-md ${
                      inCart ? 'border-primary bg-primary-light' : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center mb-2 overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <Leaf size={20} className="text-white/50" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{product.category}</p>
                    <p className="text-xs font-bold text-primary mt-1">TZS {product.price.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">Stock: {product.stock_count}</p>
                    {inCart && (
                      <span className="inline-block mt-1 text-[9px] font-bold text-primary bg-primary-light px-1.5 py-0.5 rounded-full">
                        × {inCart.quantity} in cart
                      </span>
                    )}
                  </button>
                );
              })}
              {filteredProducts.length === 0 && !loading && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 gap-2">
                  <Leaf size={32} className="text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No products found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShoppingCart size={15} /> Cart
              {cartCount > 0 && (
                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{cartCount} items</span>
              )}
            </h2>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <ShoppingCart size={28} className="text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Cart is empty</p>
                <p className="text-xs text-muted-foreground">Click products to add them</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{item.product.name}</p>
                    <p className="text-[10px] text-muted-foreground">TZS {item.product.price.toLocaleString()} each</p>
                    <p className="text-xs font-bold text-primary">TZS {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.product.id, -1)} className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80">
                      <Minus size={10} />
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, 1)} className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80">
                      <Plus size={10} />
                    </button>
                    <button onClick={() => removeFromCart(item.product.id)} className="w-6 h-6 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 flex items-center justify-center ml-1">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer + Payment */}
          <div className="px-5 py-4 border-t border-border space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Customer Name</label>
                <div className="relative">
                  <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Walk-in"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full pl-7 pr-2 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Phone</label>
                <div className="relative">
                  <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="07xx xxx xxx"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full pl-7 pr-2 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Payment Method</label>
              <div className="grid grid-cols-4 gap-1.5">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.value}
                    onClick={() => setPaymentMethod(pm.value)}
                    className={`py-1.5 px-1 rounded-lg text-[9px] font-bold border transition-colors ${
                      paymentMethod === pm.value ? 'border-primary bg-primary-light text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Total + Checkout */}
            <div className="bg-primary rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-primary-foreground/80">Total</span>
                <span className="text-xl font-bold text-primary-foreground">TZS {cartTotal.toLocaleString()}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || processing}
                className="w-full py-3 rounded-xl bg-white text-primary text-sm font-bold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <><Loader2 size={15} className="animate-spin" /> Processing…</>
                ) : (
                  <><CheckCircle size={15} /> Complete Sale</>
                )}
              </button>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="w-full mt-2 py-2 rounded-xl text-primary-foreground/60 text-xs font-semibold hover:text-primary-foreground transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={11} /> Clear Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

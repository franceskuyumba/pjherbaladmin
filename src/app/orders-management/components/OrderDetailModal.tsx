'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import StatusBadge, { OrderStatus } from '@/components/ui/StatusBadge';
import { Order } from './OrdersTableClient';
import {
  Phone, Mail, MapPin, Package, CreditCard, MessageCircle, Printer,
  CheckCircle2, Loader2, AlertCircle, DollarSign, Truck, X,
  User, Navigation, ClipboardCheck, Clock, ArrowRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdate?: (orderId: string, status: OrderStatus, courier: string) => Promise<void>;
}

const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];

// Delivery-specific statuses (sub-workflow within Processing → Dispatched → Delivered)
const DELIVERY_STATUSES = ['Preparing', 'Assigned', 'Dispatched', 'Delivered'] as const;
type DeliveryStatus = typeof DELIVERY_STATUSES[number];

const DELIVERY_STATUS_CONFIG: Record<DeliveryStatus, { color: string; icon: React.ReactNode; description: string }> = {
  Preparing:  { color: 'bg-amber-100 text-amber-700 border-amber-200',  icon: <Clock size={12} />,         description: 'Order is being prepared for dispatch' },
  Assigned:   { color: 'bg-blue-100 text-blue-700 border-blue-200',     icon: <User size={12} />,          description: 'Courier has been assigned' },
  Dispatched: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Truck size={12} />,       description: 'Order is on the way to customer' },
  Delivered:  { color: 'bg-green-100 text-green-700 border-green-200',  icon: <CheckCircle2 size={12} />,  description: 'Order successfully delivered' },
};

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded', 'cancelled'] as const;
type PaymentStatus = typeof PAYMENT_STATUSES[number];

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending:   'bg-amber-100 text-amber-700 border-amber-200',
  paid:      'bg-green-100 text-green-700 border-green-200',
  failed:    'bg-red-100 text-red-700 border-red-200',
  refunded:  'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

const courierOptions = [
  { value: 'Ali Express Courier',   label: 'Ali Express Courier',   phone: '' },
  { value: 'G4S Tanzania',          label: 'G4S Tanzania',          phone: '+255 22 211 0000' },
  { value: 'Salama Express',        label: 'Salama Express',        phone: '' },
  { value: 'DHL Tanzania',          label: 'DHL Tanzania',          phone: '+255 800 750 750' },
  { value: 'Precision Air Cargo',   label: 'Precision Air Cargo',   phone: '' },
  { value: 'Boda Boda Local',       label: 'Boda Boda Local',       phone: '' },
  { value: 'Customer Pickup',       label: 'Customer Pickup',       phone: '' },
  { value: 'Posta Tanzania',        label: 'Posta Tanzania',        phone: '+255 22 211 6000' },
  { value: 'Fastway Tanzania',      label: 'Fastway Tanzania',      phone: '' },
  { value: 'Own Staff Delivery',    label: 'Own Staff Delivery',    phone: '+255763963644' },
];

// Address validation helper
function validateAddress(address: string, district: string, region: string): string[] {
  const errors: string[] = [];
  if (!address || address.trim().length < 5) errors.push('Delivery address is too short or missing');
  if (!district || district.trim().length < 2) errors.push('District is required');
  if (!region || region.trim().length < 2) errors.push('Region is required');
  return errors;
}

export default function OrderDetailModal({ order, onClose, onUpdate }: OrderDetailModalProps) {
  const supabase = createClient();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [courier, setCourier] = useState(order.courier || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>((order as any).paymentStatus || 'pending');
  const [confirmNotes, setConfirmNotes] = useState('');
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'payment' | 'delivery'>('details');

  // Delivery workflow state
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(
    (order as any).deliveryStatus || 'Preparing'
  );
  const [deliveryAddress, setDeliveryAddress] = useState(order.address || '');
  const [deliveryDistrict, setDeliveryDistrict] = useState(order.district || '');
  const [deliveryRegion, setDeliveryRegion] = useState(order.region || '');
  const [deliveryNotes, setDeliveryNotes] = useState((order as any).deliveryNotes || '');
  const [courierPhone, setCourierPhone] = useState((order as any).courierPhone || '');
  const [courierName, setCourierName] = useState((order as any).courierName || '');
  const [deliveryFee, setDeliveryFee] = useState<number>(0); // Always 0 per FREE DELIVERY policy
  const [addressErrors, setAddressErrors] = useState<string[]>([]);
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);

  // When courier dropdown changes, auto-fill phone if known
  const handleCourierChange = (val: string) => {
    setCourier(val);
    const found = courierOptions.find(c => c.value === val);
    if (found?.phone) setCourierPhone(found.phone);
  };

  const handleSaveDelivery = async () => {
    // Validate address
    const errors = validateAddress(deliveryAddress, deliveryDistrict, deliveryRegion);
    setAddressErrors(errors);
    if (errors.length > 0) return;

    setIsSavingDelivery(true);
    try {
      // Map delivery status to order status
      const orderStatusMap: Record<DeliveryStatus, OrderStatus> = {
        Preparing:  'Processing',
        Assigned:   'Processing',
        Dispatched: 'Dispatched',
        Delivered:  'Delivered',
      };
      const newOrderStatus = orderStatusMap[deliveryStatus];

      const { error } = await supabase
        .from('orders')
        .update({
          courier,
          courier_phone: courierPhone,
          courier_name: courierName,
          delivery_status: deliveryStatus,
          delivery_address: deliveryAddress,
          delivery_district: deliveryDistrict,
          delivery_region: deliveryRegion,
          delivery_notes: deliveryNotes,
          delivery_fee: deliveryFee, // Always 0 — FREE DELIVERY
          order_status: newOrderStatus,
        })
        .eq('id', order.id);

      if (error) throw error;

      // Audit log
      await supabase.from('audit_log').insert({
        action: 'DELIVERY_UPDATED',
        entity_type: 'order',
        entity_id: order.id,
        previous_state: { delivery_status: (order as any).deliveryStatus, order_status: order.status, courier: order.courier },
        new_state: { delivery_status: deliveryStatus, order_status: newOrderStatus, courier },
        notes: `Delivery updated: ${deliveryStatus}. Courier: ${courier || 'Unassigned'}. Address: ${deliveryAddress}, ${deliveryDistrict}, ${deliveryRegion}`,
      });

      setStatus(newOrderStatus);
      if (onUpdate) await onUpdate(order.id, newOrderStatus, courier);

      toast.success('Delivery details saved!', {
        description: `Status: ${deliveryStatus} · Courier: ${courier || 'Unassigned'}`,
      });
    } catch (err: any) {
      toast.error('Failed to save delivery details', { description: err.message });
    } finally {
      setIsSavingDelivery(false);
    }
  };

  const handleSaveStatus = async () => {
    setIsSaving(true);
    try {
      if (onUpdate) {
        await onUpdate(order.id, status, courier);
      }
      toast.success(`Order ${order.orderId} updated`, {
        description: `Status changed to ${status}.`,
      });
    } catch (err: any) {
      toast.error('Update failed', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmCashPayment = async () => {
    setIsConfirmingPayment(true);
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          order_status: 'Processing',
          verified_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) throw updateError;

      await supabase.from('audit_log').insert({
        action: 'CASH_PAYMENT_CONFIRMED',
        entity_type: 'order',
        entity_id: order.id,
        previous_state: { payment_status: 'pending', order_status: order.status },
        new_state: { payment_status: 'paid', order_status: 'Processing' },
        notes: confirmNotes || `Cash payment confirmed for order ${order.orderId}. Amount: TZS ${order.total.toLocaleString()}`,
      });

      setPaymentStatus('paid');
      setStatus('Processing');
      setShowPaymentConfirm(false);
      toast.success('Cash payment confirmed!', {
        description: `Order ${order.orderId} payment marked as PAID. Order moved to Processing.`,
      });
    } catch (err: any) {
      toast.error('Failed to confirm payment', { description: err.message });
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Habari ${order.customer.split(' ')[0]}! 🌿 Agizo lako #${order.orderId} la PJHERBAL CLINIC lina hali ya: *${status}*. Kwa maswali piga: +255763963644`
    );
    window.open(`https://wa.me/${order.phone.replace(/[\s+]/g, '')}?text=${msg}`, '_blank');
  };

  const handlePrintInvoice = () => {
    const invoiceContent = `
PJHERBAL CLINIC – SEGEREA BRANCH
=====================================
INVOICE

Order #: ${order.orderId}
Date: ${order.date}
Customer: ${order.customer}
Phone: ${order.phone}
${order.email ? `Email: ${order.email}` : ''}
Address: ${deliveryAddress || order.address}, ${deliveryDistrict || order.district}, ${deliveryRegion || order.region}

ITEMS:
${order.items.length > 0
  ? order.items.map(i => `  ${i.productName} x${i.quantity} @ TZS ${i.unitPrice.toLocaleString()} = TZS ${i.total.toLocaleString()}`).join('\n')
  : '  (Items stored in order record)'}

-------------------------------------
Subtotal:     TZS ${order.subtotal.toLocaleString()}
Delivery:     FREE (TZS 0)
Total:        TZS ${order.total.toLocaleString()}
-------------------------------------
Payment:      ${order.paymentMethod}
Pay Status:   ${paymentStatus.toUpperCase()}
Order Status: ${status}
Delivery:     ${deliveryStatus}
Courier:      ${courier || 'Not assigned'}
${courierPhone ? `Courier Tel: ${courierPhone}` : ''}

${order.notes ? `Notes: ${order.notes}` : ''}

Thank you for choosing PJHERBAL CLINIC!
Head Office: 0765754024 / 0750405256
Specialist: 0765754024
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<pre style="font-family:monospace;padding:20px;font-size:13px;">${invoiceContent}</pre>`);
      win.document.close();
      win.print();
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Order ${order.orderId}`}
      subtitle={`Placed on ${order.date} · ${order.items.length} item${order.items.length !== 1 ? 's' : ''}`}
      size="2xl"
    >
      <div className="px-6 py-5 space-y-5">
        {/* Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/50 rounded-xl border border-border">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={status} />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PAYMENT_STATUS_COLORS[paymentStatus]}`}>
              💳 {paymentStatus.toUpperCase()}
            </span>
            {deliveryStatus && (
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${DELIVERY_STATUS_CONFIG[deliveryStatus].color}`}>
                {DELIVERY_STATUS_CONFIG[deliveryStatus].icon}
                {deliveryStatus.toUpperCase()}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{order.paymentMethod}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleWhatsApp} className="btn-ghost text-xs py-1.5 text-green-700 hover:bg-green-50">
              <MessageCircle size={13} /> WhatsApp
            </button>
            <button onClick={handlePrintInvoice} className="btn-ghost text-xs py-1.5">
              <Printer size={13} /> Invoice
            </button>
          </div>
        </div>

        {/* Cash Payment Confirmation Banner */}
        {paymentStatus === 'pending' && order.paymentMethod !== 'M-Pesa' && (
          <div className="flex items-center justify-between gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <DollarSign size={16} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800">Cash Payment Pending Confirmation</p>
                <p className="text-[10px] text-amber-700">Confirm when physical cash has been received from customer.</p>
              </div>
            </div>
            <button
              onClick={() => setShowPaymentConfirm(true)}
              className="flex-shrink-0 px-3 py-1.5 bg-[#1b4d3e] text-white text-xs font-bold rounded-lg hover:bg-[#163d30] transition-colors"
            >
              Confirm Payment
            </button>
          </div>
        )}

        {paymentStatus === 'paid' && (
          <div className="flex items-center gap-2.5 p-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 size={15} className="text-green-600 flex-shrink-0" />
            <p className="text-xs font-semibold text-green-800">Payment confirmed — TZS {order.total.toLocaleString()} received</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { key: 'details',  label: 'Customer & Items', icon: Package },
            { key: 'payment',  label: 'Payment',          icon: CreditCard },
            { key: 'delivery', label: 'Delivery',         icon: Truck },
          ].map(({ key, label, icon: TabIcon }) => {
            const Icon = TabIcon;
            return (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
            );
          })}
        </div>

        {/* Tab: Customer & Items */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Customer Details</h3>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary-foreground">
                      {order.customer.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{order.customer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone size={13} className="text-muted-foreground" />
                  <a href={`tel:${order.phone}`} className="text-foreground font-medium hover:text-primary">{order.phone}</a>
                </div>
                {order.email && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail size={13} className="text-muted-foreground" />
                    <span className="text-foreground">{order.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin size={13} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-foreground">{order.address || '—'}</p>
                    <p className="text-muted-foreground text-xs">{order.district}, {order.region}</p>
                  </div>
                </div>
                {order.notes && (
                  <div className="p-2.5 bg-accent-light/50 border border-accent/20 rounded-lg">
                    <p className="text-xs font-medium text-accent">Note:</p>
                    <p className="text-xs text-foreground mt-0.5">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Items Ordered</h3>
              {order.items.length === 0 ? (
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Item details stored in order record</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg gradient-emerald flex items-center justify-center flex-shrink-0">
                          <Package size={12} className="text-primary-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{item.productName}</p>
                          <p className="text-[10px] text-muted-foreground">TZS {item.unitPrice.toLocaleString()} × {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold font-tabular text-foreground flex-shrink-0">TZS {item.total.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 p-3 bg-muted/50 border border-border rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-tabular font-medium">TZS {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={11} /> FREE (TZS 0)
                  </span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between">
                  <span className="text-sm font-bold text-foreground">Total</span>
                  <span className="text-sm font-bold font-tabular text-primary">TZS {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Payment */}
        {activeTab === 'payment' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-muted/50 border border-border rounded-xl">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Payment Method</p>
                <p className="text-sm font-bold text-foreground">{order.paymentMethod}</p>
              </div>
              <div className="p-3.5 bg-muted/50 border border-border rounded-xl">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Payment Status</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PAYMENT_STATUS_COLORS[paymentStatus]}`}>
                  {paymentStatus.toUpperCase()}
                </span>
              </div>
              <div className="p-3.5 bg-muted/50 border border-border rounded-xl">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Amount Due</p>
                <p className="text-sm font-bold font-tabular text-primary">TZS {order.total.toLocaleString()}</p>
              </div>
              <div className="p-3.5 bg-muted/50 border border-border rounded-xl">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Reference</p>
                <p className="text-xs font-mono text-foreground">{order.paymentRef || '—'}</p>
              </div>
            </div>
            {paymentStatus === 'pending' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2.5 mb-3">
                  <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Action Required: Confirm Cash Receipt</p>
                    <p className="text-[10px] text-amber-700 mt-0.5">
                      Only confirm after physically receiving TZS {order.total.toLocaleString()} from the customer. This action is recorded in the audit log.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentConfirm(true)}
                  className="w-full py-2.5 bg-[#1b4d3e] text-white text-xs font-bold rounded-lg hover:bg-[#163d30] transition-colors flex items-center justify-center gap-2"
                >
                  <DollarSign size={13} /> Confirm Cash Payment Received
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab: Delivery — Full Workflow */}
        {activeTab === 'delivery' && (
          <div className="space-y-5">

            {/* Delivery Status Progression */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Navigation size={12} /> Delivery Status Progression
              </h3>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {DELIVERY_STATUSES.map((ds, idx) => {
                  const cfg = DELIVERY_STATUS_CONFIG[ds];
                  const isActive = deliveryStatus === ds;
                  const isPast = DELIVERY_STATUSES.indexOf(deliveryStatus) > idx;
                  return (
                    <React.Fragment key={ds}>
                      <button
                        onClick={() => setDeliveryStatus(ds)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all min-w-[80px] text-center ${
                          isActive
                            ? `${cfg.color} border-current font-bold shadow-sm`
                            : isPast
                            ? 'bg-green-50 text-green-600 border-green-200' :'bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/60">
                          {isPast && !isActive ? <CheckCircle2 size={14} className="text-green-600" /> : cfg.icon}
                        </span>
                        <span className="text-[10px] font-semibold leading-tight">{ds}</span>
                      </button>
                      {idx < DELIVERY_STATUSES.length - 1 && (
                        <ArrowRight size={14} className={`flex-shrink-0 ${isPast ? 'text-green-400' : 'text-muted-foreground/30'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} /> {DELIVERY_STATUS_CONFIG[deliveryStatus].description}
              </p>
            </div>

            {/* Delivery Fee — FREE DELIVERY Policy */}
            <div className="flex items-center justify-between p-3.5 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Truck size={14} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-800">FREE DELIVERY Policy Active</p>
                  <p className="text-[10px] text-green-700">All orders across Tanzania — no minimum threshold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-green-700 line-through opacity-50">TZS {deliveryFee.toLocaleString()}</p>
                <p className="text-sm font-bold text-green-700">TZS 0</p>
              </div>
            </div>

            {/* Courier Assignment */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <User size={12} /> Courier Assignment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Select Courier</label>
                  <select
                    value={courier}
                    onChange={(e) => handleCourierChange(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">— Select courier —</option>
                    {courierOptions.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Courier Contact Name</label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="e.g. John Mwangi"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Courier Phone</label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      value={courierPhone}
                      onChange={(e) => setCourierPhone(e.target.value)}
                      placeholder="+255 7XX XXX XXX"
                      className="input-field text-sm pl-8"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Order Status (auto-mapped)</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    className="input-field text-sm"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery Address Validation */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <MapPin size={12} /> Delivery Address
              </h3>
              {addressErrors.length > 0 && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                  {addressErrors.map((err, i) => (
                    <p key={i} className="text-[11px] text-red-700 flex items-center gap-1.5">
                      <AlertCircle size={11} className="flex-shrink-0" /> {err}
                    </p>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Street / Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-3 text-muted-foreground" />
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => { setDeliveryAddress(e.target.value); setAddressErrors([]); }}
                      rows={2}
                      placeholder="e.g. Segerea Street, near PJHERBAL Clinic, House No. 12"
                      className={`input-field text-sm pl-8 resize-none ${addressErrors.some(e => e.includes('address')) ? 'border-red-400 focus:ring-red-300' : ''}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryDistrict}
                    onChange={(e) => { setDeliveryDistrict(e.target.value); setAddressErrors([]); }}
                    placeholder="e.g. Ilala"
                    className={`input-field text-sm ${addressErrors.some(e => e.includes('District')) ? 'border-red-400 focus:ring-red-300' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Region <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryRegion}
                    onChange={(e) => { setDeliveryRegion(e.target.value); setAddressErrors([]); }}
                    placeholder="e.g. Dar es Salaam"
                    className={`input-field text-sm ${addressErrors.some(e => e.includes('Region')) ? 'border-red-400 focus:ring-red-300' : ''}`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Delivery Notes / Instructions</label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Call before arriving, leave at gate, landmark details…"
                    className="input-field text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Contact Fields */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Phone size={12} /> Delivery Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 border border-border rounded-xl">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Customer Phone</p>
                  <a href={`tel:${order.phone}`} className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5">
                    <Phone size={12} /> {order.phone}
                  </a>
                </div>
                <div className="p-3 bg-muted/50 border border-border rounded-xl">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">WhatsApp Customer</p>
                  <button
                    onClick={handleWhatsApp}
                    className="text-sm font-bold text-green-700 hover:underline flex items-center gap-1.5"
                  >
                    <MessageCircle size={12} /> Send Update
                  </button>
                </div>
                {courierPhone && (
                  <div className="p-3 bg-muted/50 border border-border rounded-xl">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Courier Phone</p>
                    <a href={`tel:${courierPhone}`} className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5">
                      <Phone size={12} /> {courierPhone}
                    </a>
                  </div>
                )}
                <div className="p-3 bg-muted/50 border border-border rounded-xl">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Head Office</p>
                  <a href="tel:+255765754024" className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5">
                    <Phone size={12} /> 0765754024
                  </a>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle size={13} className="text-blue-600 flex-shrink-0" />
              <p className="text-[11px] text-blue-700">
                Saving will update the order status, courier assignment, and delivery address in the database and write an audit log entry.
              </p>
            </div>
            <button
              onClick={handleSaveDelivery}
              disabled={isSavingDelivery}
              className="btn-primary w-full text-sm"
            >
              {isSavingDelivery ? (
                <><Loader2 size={15} className="animate-spin" /> Saving Delivery Details…</>
              ) : (
                <><ClipboardCheck size={15} /> Save Delivery Details</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Cash Payment Confirmation Modal */}
      {showPaymentConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPaymentConfirm(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <button onClick={() => setShowPaymentConfirm(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
              <X size={16} className="text-gray-500" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign size={18} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Confirm Cash Payment</h3>
                <p className="text-xs text-gray-500">Order {order.orderId}</p>
              </div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-sm font-bold text-green-800">Amount: TZS {order.total.toLocaleString()}</p>
              <p className="text-xs text-green-700 mt-0.5">Customer: {order.customer}</p>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirmation Notes (Optional)</label>
              <textarea
                value={confirmNotes}
                onChange={e => setConfirmNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Cash received at branch, receipt #123"
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none"
              />
            </div>
            <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <AlertCircle size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700">
                This action is irreversible and will be recorded in the audit log with your admin ID and timestamp. Only confirm after physically receiving the cash.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCashPayment}
                disabled={isConfirmingPayment}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isConfirmingPayment ? (
                  <><Loader2 size={13} className="animate-spin" /> Confirming…</>
                ) : (
                  <><CheckCircle2 size={13} /> Confirm Received</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
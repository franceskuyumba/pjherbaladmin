import React from 'react';

type OrderStatus = 'Pending' | 'Paid' | 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<OrderStatus, { bg: string; text: string; dot: string; label: string }> = {
  Pending: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pending' },
  Paid: { bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Paid' },
  Processing: { bg: 'bg-orange-50 border border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Processing' },
  Dispatched: { bg: 'bg-purple-50 border border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500', label: 'Dispatched' },
  Delivered: { bg: 'bg-green-50 border border-green-200', text: 'text-green-700', dot: 'bg-green-500', label: 'Delivered' },
  Cancelled: { bg: 'bg-red-50 border border-red-200', text: 'text-red-700', dot: 'bg-red-500', label: 'Cancelled' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.bg} ${config.text} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}

export type { OrderStatus };
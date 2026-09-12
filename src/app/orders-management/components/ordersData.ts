import { OrderStatus } from '@/components/ui/StatusBadge';

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
}

export const statusTabs = [
  { id: 'tab-all', label: 'All Orders', value: 'all' },
  { id: 'tab-pending', label: 'Pending', value: 'Pending' },
  { id: 'tab-paid', label: 'Paid', value: 'Paid' },
  { id: 'tab-processing', label: 'Processing', value: 'Processing' },
  { id: 'tab-dispatched', label: 'Dispatched', value: 'Dispatched' },
  { id: 'tab-delivered', label: 'Delivered', value: 'Delivered' },
  { id: 'tab-cancelled', label: 'Cancelled', value: 'Cancelled' },
];

// Legacy mock data kept for reference — components now use Supabase
export const ordersData: Order[] = [];
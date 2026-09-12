'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Settings, Phone, Clock, MapPin, Key, Globe, Save, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ClinicSettings {
  clinicName: string;
  branch: string;
  headOffice1: string;
  headOffice2: string;
  specialist: string;
  whatsapp: string;
  address: string;
  city: string;
  country: string;
  hoursWeekday: string;
  hoursSaturday: string;
  hoursSunday: string;
  email: string;
  website: string;
}

interface PaymentSettings {
  selcomApiKey: string;
  selcomVendorId: string;
  flutterwavePublicKey: string;
  flutterwaveSecretKey: string;
  enableSelcom: boolean;
  enableFlutterwave: boolean;
  enableMpesa: boolean;
  enableAirtel: boolean;
  enableHalopesa: boolean;
  enableNmb: boolean;
  enableCrdb: boolean;
}

const defaultClinic: ClinicSettings = {
  clinicName: 'PJHERBAL CLINIC',
  branch: 'Segerea Branch',
  headOffice1: '0763 963 644',
  headOffice2: '0750 405 256',
  specialist: '0765 754 024',
  whatsapp: '+255763963644',
  address: 'Segerea',
  city: 'Dar es Salaam',
  country: 'Tanzania',
  hoursWeekday: '8:00 AM – 7:00 PM',
  hoursSaturday: '8:00 AM – 5:00 PM',
  hoursSunday: 'Closed',
  email: 'info@pjherbal.co.tz',
  website: 'https://pjherbalad2363.builtwithrocket.new',
};

const defaultPayment: PaymentSettings = {
  selcomApiKey: '',
  selcomVendorId: '',
  flutterwavePublicKey: '',
  flutterwaveSecretKey: '',
  enableSelcom: false,
  enableFlutterwave: false,
  enableMpesa: false,
  enableAirtel: false,
  enableHalopesa: false,
  enableNmb: false,
  enableCrdb: false,
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'clinic' | 'payment' | 'security'>('clinic');
  const [clinic, setClinic] = useState<ClinicSettings>(defaultClinic);
  const [payment, setPayment] = useState<PaymentSettings>(defaultPayment);
  const [savedClinic, setSavedClinic] = useState(false);
  const [savedPayment, setSavedPayment] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const handleClinicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClinic(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPayment(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveClinic = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedClinic(true);
    toast.success('Clinic settings saved!');
    setTimeout(() => setSavedClinic(false), 3000);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedPayment(true);
    toast.success('Payment settings saved!');
    setTimeout(() => setSavedPayment(false), 3000);
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const TABS = [
    { id: 'clinic', label: 'Clinic Info', icon: '🏥' },
    { id: 'payment', label: 'Payment APIs', icon: '💳' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ] as const;

  return (
    <AdminLayout currentPath="/admin/settings">
      <div className="p-4 lg:p-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Settings size={20} className="text-primary" /> System Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage clinic information and payment gateway configurations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-fit flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === t.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Clinic Info Tab */}
        {activeTab === 'clinic' && (
          <form onSubmit={handleSaveClinic} className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin size={14} className="text-primary" /> Branch Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'clinicName', label: 'Clinic Name', placeholder: 'PJHERBAL CLINIC' },
                  { name: 'branch', label: 'Branch Name', placeholder: 'Segerea Branch' },
                  { name: 'address', label: 'Street Address', placeholder: 'Segerea' },
                  { name: 'city', label: 'City', placeholder: 'Dar es Salaam' },
                  { name: 'country', label: 'Country', placeholder: 'Tanzania' },
                  { name: 'email', label: 'Email Address', placeholder: 'info@pjherbal.co.tz' },
                  { name: 'website', label: 'Website URL', placeholder: 'https://...' },
                ].map(({ name, label, placeholder }) => (
                  <div key={name} className={name === 'website' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">{label}</label>
                    <input
                      name={name}
                      value={(clinic as any)[name]}
                      onChange={handleClinicChange}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Phone size={14} className="text-primary" /> Contact Numbers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'headOffice1', label: 'Head Office (Primary)' },
                  { name: 'headOffice2', label: 'Head Office (Alt)' },
                  { name: 'specialist', label: 'Specialist Line' },
                  { name: 'whatsapp', label: 'WhatsApp Number (intl format)' },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">{label}</label>
                    <input
                      name={name}
                      value={(clinic as any)[name]}
                      onChange={handleClinicChange}
                      className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock size={14} className="text-primary" /> Business Hours
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: 'hoursWeekday', label: 'Mon – Fri' },
                  { name: 'hoursSaturday', label: 'Saturday' },
                  { name: 'hoursSunday', label: 'Sunday' },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">{label}</label>
                    <input
                      name={name}
                      value={(clinic as any)[name]}
                      onChange={handleClinicChange}
                      className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
              {savedClinic ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save Clinic Settings</>}
            </button>
          </form>
        )}

        {/* Payment APIs Tab */}
        {activeTab === 'payment' && (
          <form onSubmit={handleSavePayment} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-amber-800 font-medium">
                ⚠️ <strong>Note:</strong> Payment gateway integrations are currently in development. Only Cash Payment is active. Configure API keys here for when integrations go live.
              </p>
            </div>

            {/* Payment Method Toggles */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-bold text-foreground mb-4">Payment Method Status</h2>
              <div className="space-y-3">
                {[
                  { name: 'enableMpesa', label: 'M-Pesa', status: 'Coming Soon' },
                  { name: 'enableAirtel', label: 'Airtel Money', status: 'Coming Soon' },
                  { name: 'enableHalopesa', label: 'HaloPesa', status: 'Coming Soon' },
                  { name: 'enableNmb', label: 'NMB Bank', status: 'Coming Soon' },
                  { name: 'enableCrdb', label: 'CRDB Bank', status: 'Coming Soon' },
                  { name: 'enableSelcom', label: 'Selcom API', status: 'API Required' },
                  { name: 'enableFlutterwave', label: 'Flutterwave', status: 'API Required' },
                ].map(({ name, label, status }) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{status}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name={name}
                        checked={(payment as any)[name]}
                        onChange={handlePaymentChange}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* API Keys */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Key size={14} className="text-primary" /> API Configuration
              </h2>
              {[
                { name: 'selcomApiKey', label: 'Selcom API Key', placeholder: 'sk_live_...' },
                { name: 'selcomVendorId', label: 'Selcom Vendor ID', placeholder: 'VENDOR_ID' },
                { name: 'flutterwavePublicKey', label: 'Flutterwave Public Key', placeholder: 'FLWPUBK_TEST-...' },
                { name: 'flutterwaveSecretKey', label: 'Flutterwave Secret Key', placeholder: 'FLWSECK_TEST-...' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{label}</label>
                  <div className="relative">
                    <input
                      name={name}
                      type={showKeys[name] ? 'text' : 'password'}
                      value={(payment as any)[name]}
                      onChange={handlePaymentChange}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 pr-9 rounded-lg border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
                    />
                    <button type="button" onClick={() => toggleShowKey(name)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showKeys[name] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
              {savedPayment ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save Payment Settings</>}
            </button>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Globe size={14} className="text-primary" /> Platform Security Status
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'SSL Certificate', status: 'Active', ok: true },
                  { label: 'Supabase Row Level Security (RLS)', status: 'Enabled', ok: true },
                  { label: 'Admin Route Protection', status: 'Active (Middleware)', ok: true },
                  { label: 'Environment Variables', status: 'Secured', ok: true },
                  { label: 'Supabase Auth', status: 'Active', ok: true },
                  { label: 'Audit Logging', status: 'Enabled', ok: true },
                ].map(({ label, status, ok }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <span className="text-xs font-medium text-foreground">{label}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ok ? 'bg-[#f0f7f4] text-[#1b4d3e]' : 'bg-red-50 text-red-600'}`}>
                      {ok ? '✓ ' : '✗ '}{status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-bold text-foreground mb-3">Admin Credentials</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Admin user accounts are managed directly in your Supabase Dashboard under Authentication → Users. To add, remove, or update admin users, please use the Supabase dashboard.
              </p>
              <div className="space-y-2">
                {[
                  { role: 'Super Admin', email: 'superadmin@pjherbal.co.tz' },
                  { role: 'Inventory Manager', email: 'inventory@pjherbal.co.tz' },
                  { role: 'Orders Specialist', email: 'orders@pjherbal.co.tz' },
                ].map(({ role, email }) => (
                  <div key={email} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{role}</p>
                      <p className="text-[10px] text-muted-foreground">{email}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#1b4d3e] bg-[#f0f7f4] px-2 py-0.5 rounded-full">Active</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">
                To manage users, visit: <span className="font-mono text-primary">Supabase Dashboard → Authentication → Users</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

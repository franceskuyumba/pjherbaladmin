'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { Leaf, Phone, MessageCircle, MapPin, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';
import Icon from '@/components/ui/AppIcon';


export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send via WhatsApp
    const msg = `Hello PJHERBAL CLINIC,%0AName: ${form.name}%0APhone: ${form.phone}%0AEmail: ${form.email}%0AMessage: ${form.message}`;
    window.open(`https://wa.me/255763963644?text=${msg}`, '_blank');
    setTimeout(() => { setLoading(false); setSent(true); }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#e8e4dc] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><AppLogo size={30} /></Link>
          <h1 className="text-sm font-bold text-[#222]">Contact Us</h1>
          <Link href="/shop" className="text-xs font-semibold text-[#1b4d3e] hover:underline">Shop</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center mx-auto mb-3">
            <Leaf size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#222]">Get in Touch</h2>
          <p className="text-sm text-[#888] mt-1">We're here to help with your herbal wellness journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#e8e4dc] p-5">
              <h3 className="text-sm font-bold text-[#222] mb-4">PJHERBAL CLINIC – Segerea Branch</h3>
              <div className="space-y-3">
                {[
                  { icon: Phone, label: 'Head Office', value: '0763 963 644', href: 'tel:+255763963644' },
                  { icon: Phone, label: 'Alt Line', value: '0750 405 256', href: 'tel:+255750405256' },
                  { icon: Phone, label: 'Specialist', value: '0765 754 024', href: 'tel:+255765754024' },
                  { icon: MapPin, label: 'Location', value: 'Segerea, Dar es Salaam, Tanzania', href: '#' },
                  { icon: Clock, label: 'Hours', value: 'Mon–Sat: 8am – 7pm', href: '#' },
                ].map(({ icon: Icon, label, value, href }) => (
                  <a key={label} href={href} className="flex items-start gap-3 hover:text-[#1b4d3e] transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-[#f0f7f4] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={14} className="text-[#1b4d3e]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#888]">{label}</p>
                      <p className="text-xs font-semibold text-[#222] group-hover:text-[#1b4d3e]">{value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <a
              href="https://wa.me/255763963644?text=Hello%20PJHERBAL%20CLINIC%2C%20I%20need%20assistance."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-[#25D366] rounded-xl text-white font-bold text-sm hover:bg-[#20bd5a] transition-colors"
            >
              <MessageCircle size={20} />
              <div>
                <p className="font-bold">Chat on WhatsApp</p>
                <p className="text-white/80 text-xs font-normal">Fastest response — usually within minutes</p>
              </div>
            </a>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl border border-[#e8e4dc] p-5">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-8 text-center">
                <CheckCircle size={40} className="text-[#4e9f3d]" />
                <p className="font-bold text-[#222]">Message Sent!</p>
                <p className="text-xs text-[#888]">Your message was forwarded to our WhatsApp. We'll respond shortly.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', phone: '', email: '', message: '' }); }} className="text-xs text-[#1b4d3e] font-bold hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <h3 className="text-sm font-bold text-[#222]">Send a Message</h3>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Your Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Full name" className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Phone Number *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+255 7XX XXX XXX" className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Email (Optional)</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="How can we help you?" className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e] resize-none" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-[#1b4d3e] text-white rounded-xl font-bold text-sm hover:bg-[#163d30] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send via WhatsApp</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}

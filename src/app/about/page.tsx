'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, Shield, Heart, Star, Phone, MessageCircle, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';
import Icon from '@/components/ui/AppIcon';


const VALUES = [
  { icon: Leaf, title: 'Natural & Pure', desc: 'Every product is sourced from trusted natural ingredients with no harmful additives.' },
  { icon: Shield, title: 'Clinically Trusted', desc: 'Our formulations are developed by wellness specialists with years of herbal medicine expertise.' },
  { icon: Heart, title: 'Community First', desc: 'We serve Tanzanian families with affordable, accessible herbal wellness solutions.' },
  { icon: Star, title: 'Quality Assured', desc: 'Rigorous quality checks ensure every product meets our high standards before reaching you.' },
];

const CATEGORIES = [
  "Men\'s Health", "Women\'s Wellness", "Weight Management",
  "Brain & Focus", "Energy & Immunity", "Detox & Digestion",
];

const TEAM = [
  { name: 'Dr. Pj Herbal', role: 'Founder & Chief Herbalist', initials: 'PJ' },
  { name: 'Wellness Specialist', role: 'Product Formulation', initials: 'WS' },
  { name: 'Customer Care Team', role: 'Support & Consultations', initials: 'CC' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e8e4dc] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><AppLogo size={30} /></Link>
          <h1 className="text-sm font-bold text-[#222]">About Us</h1>
          <Link href="/shop" className="text-xs font-semibold text-[#1b4d3e] hover:underline">Shop</Link>
        </div>
      </header>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1b4d3e] via-[#2d6b55] to-[#4e9f3d] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-4 right-8 w-48 h-48 rounded-full bg-[#d4af37]/30 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mx-auto mb-4">
            <Leaf size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">PJHERBAL CLINIC</h2>
          <p className="text-[#d4af37] font-semibold text-sm mt-1 tracking-wide">SEGEREA BRANCH – DAR ES SALAAM</p>
          <p className="text-white/75 text-sm mt-4 max-w-lg mx-auto leading-relaxed">
            Tanzania's trusted herbal wellness clinic, delivering natural health solutions to families across the nation since our founding.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6">
            {[['500+', 'Products Sold'], ['10K+', 'Happy Customers'], ['6', 'Health Categories']]?.map(([num, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white">{num}</p>
                <p className="text-white/60 text-[10px] font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-[#e8e4dc] p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#f0f7f4] flex items-center justify-center flex-shrink-0">
              <Heart size={18} className="text-[#1b4d3e]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#222] mb-2">Our Mission</h3>
              <p className="text-sm text-[#555] leading-relaxed">
                At PJHERBAL CLINIC – Segerea Branch, our mission is to make premium herbal wellness accessible to every Tanzanian family. We believe in the healing power of nature and are committed to providing safe, effective, and affordable herbal remedies that support a healthy, vibrant life.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h3 className="text-base font-bold text-[#222] mb-4">Our Core Values</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES?.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-[#e8e4dc] p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#222]">{title}</p>
                  <p className="text-xs text-[#777] mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Categories */}
        <div className="bg-gradient-to-r from-[#f0f7f4] to-[#f9f8f6] rounded-2xl border border-[#d4e8df] p-6">
          <h3 className="text-base font-bold text-[#222] mb-4">What We Offer</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES?.map(cat => (
              <div key={cat} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2.5 border border-[#e8e4dc]">
                <CheckCircle size={13} className="text-[#4e9f3d] flex-shrink-0" />
                <span className="text-xs font-medium text-[#333]">{cat}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-[#1b4d3e] rounded-xl text-center">
            <p className="text-white text-xs font-bold">🚚 FREE DELIVERY ACROSS ALL OF TANZANIA</p>
            <p className="text-white/70 text-[10px] mt-0.5">No minimum order required</p>
          </div>
        </div>

        {/* Team */}
        <div>
          <h3 className="text-base font-bold text-[#222] mb-4">Our Team</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TEAM?.map(({ name, role, initials }) => (
              <div key={name} className="bg-white rounded-xl border border-[#e8e4dc] p-5 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-white">{initials}</span>
                </div>
                <p className="text-sm font-bold text-[#222]">{name}</p>
                <p className="text-[11px] text-[#888] mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Location & Hours */}
        <div className="bg-white rounded-2xl border border-[#e8e4dc] p-6">
          <h3 className="text-base font-bold text-[#222] mb-4">Visit Us</h3>
          <div className="space-y-3">
            {[
              { icon: MapPin, label: 'Location', value: 'Segerea, Dar es Salaam, Tanzania' },
              { icon: Clock, label: 'Business Hours', value: 'Monday – Saturday: 8:00 AM – 7:00 PM' },
              { icon: Phone, label: 'Head Office', value: '0763 963 644 / 0750 405 256' },
              { icon: Phone, label: 'Specialist Line', value: '0765 754 024' },
            ]?.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f0f7f4] flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-[#1b4d3e]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#999] font-medium">{label}</p>
                  <p className="text-xs font-semibold text-[#333]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/shop" className="flex items-center justify-center gap-2 py-4 bg-[#1b4d3e] text-white rounded-xl font-bold text-sm hover:bg-[#163d30] transition-colors">
            Browse Products <ArrowRight size={15} />
          </Link>
          <a
            href="https://wa.me/255763963644?text=Hello%20PJHERBAL%20CLINIC%2C%20I%20want%20to%20learn%20more."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#20bd5a] transition-colors"
          >
            <MessageCircle size={15} /> Chat on WhatsApp
          </a>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}

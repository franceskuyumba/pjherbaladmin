'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `When you use our platform, we may collect the following information:
• Personal identification: Full name, phone number, email address
• Delivery information: Region, district, street address
• Order data: Products purchased, quantities, payment method selected
• Account data: Login credentials (stored securely via Supabase Auth)
• Usage data: Pages visited, search queries, device type (for analytics purposes)`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use your information to:
• Process and fulfill your orders
• Contact you regarding your order status and delivery
• Send order confirmations and updates via WhatsApp or SMS
• Improve our products and services
• Respond to customer support inquiries
• Comply with legal obligations`,
  },
  {
    title: '3. Data Sharing & Disclosure',
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with:
• Delivery partners: Only your name, phone, and delivery address for order fulfillment
• Payment processors: Only transaction-relevant data (we do not store payment credentials)
• Legal authorities: When required by Tanzanian law or court order`,
  },
  {
    title: '4. Data Security',
    content: `We take the security of your personal data seriously. We implement:
• Encrypted data transmission (HTTPS/SSL)
• Secure database storage via Supabase with Row Level Security (RLS)
• Access controls limiting who can view customer data
• Regular security reviews

However, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and keep your account credentials confidential.`,
  },
  {
    title: '5. Cookies & Tracking',
    content: `Our website uses cookies and similar technologies to:
• Maintain your shopping cart session
• Remember your login state
• Analyze website traffic and usage patterns (via Google Analytics)

You can disable cookies in your browser settings, but this may affect the functionality of our website.`,
  },
  {
    title: '6. Your Rights',
    content: `You have the right to:
• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your account and associated data
• Opt out of marketing communications
• Lodge a complaint with relevant data protection authorities

To exercise these rights, contact us via WhatsApp at +255 763 963 644 or email us.`,
  },
  {
    title: '7. Data Retention',
    content: `We retain your personal data for as long as necessary to:
• Fulfill the purposes outlined in this policy
• Comply with legal and regulatory requirements
• Resolve disputes and enforce our agreements

Order records are retained for a minimum of 3 years for accounting and legal purposes.`,
  },
  {
    title: '8. Children\'s Privacy',
    content: `Our services are not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated effective date. We encourage you to review this policy periodically.`,
  },
  {
    title: '10. Contact Us',
    content: `If you have questions about this Privacy Policy or how we handle your data, please contact us:

PJHERBAL CLINIC – Segerea Branch
📍 Segerea, Dar es Salaam, Tanzania
📞 Head Office: 0763 963 644
📞 Alt Line: 0750 405 256
💬 WhatsApp: +255 763 963 644`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#e8e4dc] shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-[#555] hover:text-[#1b4d3e] transition-colors">
            <ArrowLeft size={16} />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <AppLogo size={28} />
          <div className="w-16" />
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1b4d3e] to-[#4e9f3d] py-10 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
          <Shield size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
        <p className="text-white/70 text-sm mt-1">PJHERBAL CLINIC – Segerea Branch</p>
        <p className="text-white/50 text-xs mt-2">Effective Date: January 1, 2025 · Last Updated: September 2026</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Intro */}
        <div className="bg-[#f0f7f4] border border-[#c8e6c9] rounded-xl p-4 mb-6">
          <p className="text-sm text-[#1b4d3e] leading-relaxed">
            At PJHERBAL CLINIC, we are committed to protecting your privacy and handling your personal data with transparency and care. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {SECTIONS?.map(({ title, content }) => (
            <div key={title} className="bg-white rounded-xl border border-[#e8e4dc] p-5">
              <h2 className="text-sm font-bold text-[#1b4d3e] mb-3">{title}</h2>
              <p className="text-xs text-[#555] leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          ))}
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/terms" className="text-xs text-[#1b4d3e] font-semibold hover:underline">Terms & Conditions</Link>
          <span className="text-[#ccc]">·</span>
          <Link href="/contact" className="text-xs text-[#1b4d3e] font-semibold hover:underline">Contact Us</Link>
          <span className="text-[#ccc]">·</span>
          <Link href="/" className="text-xs text-[#1b4d3e] font-semibold hover:underline">Back to Home</Link>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}

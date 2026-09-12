'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing and using the PJHERBAL CLINIC website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.

These terms apply to all visitors, customers, and users of our platform.`,
  },
  {
    title: '2. Products & Health Disclaimer',
    content: `PJHERBAL CLINIC sells herbal wellness products intended to support general health and wellbeing. Please note:

• Our products are NOT intended to diagnose, treat, cure, or prevent any disease
• Always consult a qualified healthcare professional before starting any herbal supplement regimen
• Results may vary from person to person
• If you are pregnant, nursing, or have a medical condition, consult your doctor before use
• Keep all products out of reach of children
• Do not exceed recommended dosages`,
  },
  {
    title: '3. Ordering & Payment',
    content: `When placing an order on our platform:

• All prices are listed in Tanzanian Shillings (TZS)
• Orders are subject to product availability
• We reserve the right to cancel orders if products are out of stock
• Currently, Cash Payment is the only active payment method. Other payment methods (M-Pesa, Airtel Money, HaloPesa, NMB Bank, CRDB Bank) are coming soon
• For cash orders, payment is collected on delivery or at our Segerea Branch
• Orders are confirmed only after our team verifies the order details with you`,
  },
  {
    title: '4. Delivery Policy',
    content: `PJHERBAL CLINIC offers FREE DELIVERY across all regions of Tanzania with no minimum order requirement.

• Delivery times vary by region (typically 1–5 business days)
• Dar es Salaam orders may be delivered same-day or next-day
• We will contact you via phone/WhatsApp to confirm delivery details
• Delivery is subject to courier availability in your area
• We are not responsible for delays caused by incorrect delivery information provided by the customer`,
  },
  {
    title: '5. Returns & Refunds',
    content: `We want you to be completely satisfied with your purchase. Our return policy:

• Products may be returned within 7 days of delivery if they are unopened and in original condition
• Damaged or defective products will be replaced or refunded at no cost
• To initiate a return, contact us via WhatsApp at +255 763 963 644
• Refunds are processed within 5–7 business days after we receive the returned product
• We do not accept returns on opened products unless they are defective`,
  },
  {
    title: '6. User Accounts',
    content: `If you create an account on our platform:

• You are responsible for maintaining the confidentiality of your login credentials
• You agree to provide accurate and complete information
• You must notify us immediately of any unauthorized use of your account
• We reserve the right to suspend or terminate accounts that violate these terms
• You may delete your account at any time by contacting us`,
  },
  {
    title: '7. Intellectual Property',
    content: `All content on this website, including but not limited to text, images, logos, product descriptions, and design elements, is the property of PJHERBAL CLINIC and is protected by applicable intellectual property laws.

You may not reproduce, distribute, or create derivative works from our content without prior written permission.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `To the maximum extent permitted by Tanzanian law, PJHERBAL CLINIC shall not be liable for:

• Any indirect, incidental, or consequential damages arising from the use of our products or services
• Health outcomes resulting from the use of our herbal products
• Delays in delivery caused by factors beyond our control (weather, courier issues, etc.)
• Technical issues, website downtime, or data loss

Our total liability shall not exceed the amount paid for the specific product or service in question.`,
  },
  {
    title: '9. Governing Law',
    content: `These Terms and Conditions are governed by and construed in accordance with the laws of the United Republic of Tanzania. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Tanzania.`,
  },
  {
    title: '10. Changes to Terms',
    content: `We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services after any changes constitutes your acceptance of the new terms.`,
  },
  {
    title: '11. Contact Information',
    content: `For questions about these Terms and Conditions, please contact us:

PJHERBAL CLINIC – Segerea Branch
📍 Segerea, Dar es Salaam, Tanzania
📞 Head Office: 0763 963 644
📞 Alt Line: 0750 405 256
💬 WhatsApp: +255 763 963 644
🕐 Mon–Sat: 8:00 AM – 7:00 PM`,
  },
];

export default function TermsPage() {
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
          <FileText size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Terms & Conditions</h1>
        <p className="text-white/70 text-sm mt-1">PJHERBAL CLINIC – Segerea Branch</p>
        <p className="text-white/50 text-xs mt-2">Effective Date: January 1, 2025 · Last Updated: September 2026</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Intro */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Important:</strong> Please read these Terms and Conditions carefully before using our website or purchasing our products. By using our services, you agree to these terms.
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
          <Link href="/privacy-policy" className="text-xs text-[#1b4d3e] font-semibold hover:underline">Privacy Policy</Link>
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

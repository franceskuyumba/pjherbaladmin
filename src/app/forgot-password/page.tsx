'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Leaf, Loader2, CheckCircle, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AppLogo from '@/components/ui/AppLogo';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
      <header className="bg-white border-b border-[#e8e4dc] px-4 py-3">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-1.5 text-[#555] hover:text-[#1b4d3e] transition-colors">
            <ArrowLeft size={16} />
            <span className="text-xs font-medium">Back to Login</span>
          </Link>
          <AppLogo size={28} />
          <div className="w-20" />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#f0f7f4] border-4 border-[#4e9f3d] flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-[#4e9f3d]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#222]">Check Your Email</h1>
                <p className="text-sm text-[#888] mt-2 leading-relaxed">
                  We've sent a password reset link to <strong className="text-[#222]">{email}</strong>. Please check your inbox and follow the instructions.
                </p>
              </div>
              <div className="bg-[#f0f7f4] border border-[#c8e6c9] rounded-xl p-4">
                <p className="text-xs text-[#1b4d3e] leading-relaxed">
                  Didn't receive the email? Check your spam folder or contact us on WhatsApp at <strong>+255 763 963 644</strong> for assistance.
                </p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full py-3 border-2 border-[#1b4d3e] text-[#1b4d3e] rounded-xl font-bold text-sm hover:bg-[#f0f7f4] transition-colors"
                >
                  Try Another Email
                </button>
                <Link href="/login" className="block w-full py-3 bg-[#1b4d3e] text-white rounded-xl font-bold text-sm text-center hover:bg-[#163d30] transition-colors">
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center mx-auto mb-3">
                  <Leaf size={24} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#222]">Forgot Password?</h1>
                <p className="text-sm text-[#888] mt-1">Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e8e4dc] p-6 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1b4d3e] text-white rounded-xl font-bold text-sm hover:bg-[#163d30] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : 'Send Reset Link'}
                </button>

                <p className="text-center text-xs text-[#888]">
                  Remember your password?{' '}
                  <Link href="/login" className="text-[#1b4d3e] font-bold hover:underline">Sign In</Link>
                </p>
              </form>

              <p className="text-center text-xs text-[#aaa] mt-4">
                Need help?{' '}
                <a href="https://wa.me/255763963644" target="_blank" rel="noopener noreferrer" className="text-[#888] hover:text-[#1b4d3e] font-medium">Contact Support →</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

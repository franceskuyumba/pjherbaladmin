'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowLeft, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import AppLogo from '@/components/ui/AppLogo';

function isPhoneNumber(value: string): boolean {
  const cleaned = value.replace(/\s/g, '');
  return /^(\+255|0)[67]\d{8}$/.test(cleaned);
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('0')) return '+255' + cleaned.slice(1);
  return cleaned;
}

export default function LoginPage() {
  const { signIn } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPhone = isPhoneNumber(identifier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isPhone) {
        // Phone login: look up email from user_profiles then sign in
        const phone = normalizePhone(identifier);
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('phone', phone)
          .single();
        if (profileError || !profile?.email) {
          throw new Error('No account found with this phone number.');
        }
        await signIn(profile.email, password);
      } else {
        await signIn(identifier, password);
      }
      router.push('/customer-dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
      <header className="bg-white border-b border-[#e8e4dc] px-4 py-3">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-[#555] hover:text-[#1b4d3e] transition-colors">
            <ArrowLeft size={16} />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <AppLogo size={36} showTagline={false} />
          <div className="w-16" />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <AppLogo size={56} />
            </div>
            <h1 className="text-2xl font-bold text-[#222]">Welcome Back</h1>
            <p className="text-sm text-[#888] mt-1">Sign in to your PJHERBAL account</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e8e4dc] p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#444] mb-1.5">
                Email or Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]">
                  {isPhone ? <Phone size={14} /> : <Mail size={14} />}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  placeholder="your@email.com or 0712345678"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]"
                />
              </div>
              {isPhone && (
                <p className="text-[10px] text-[#4e9f3d] mt-1 font-medium">📱 Phone number detected</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#444] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-[#1b4d3e] font-semibold hover:underline">Forgot password?</Link>
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
              {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : 'Sign In'}
            </button>

            <p className="text-center text-xs text-[#888]">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#1b4d3e] font-bold hover:underline">Create Account</Link>
            </p>
          </form>

          <p className="text-center text-xs text-[#aaa] mt-4">
            Admin?{' '}
            <Link href="/admin-login" className="text-[#888] hover:text-[#1b4d3e] font-medium">Admin Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from '@/components/ui/AppLogo';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password, { fullName: form.fullName });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f0f7f4] border-4 border-[#4e9f3d] flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-[#4e9f3d]" />
          </div>
          <h1 className="text-xl font-bold text-[#222]">Account Created!</h1>
          <p className="text-sm text-[#888]">Please check your email to verify your account, then sign in.</p>
          <Link href="/login" className="inline-block px-6 py-3 bg-[#1b4d3e] text-white rounded-xl font-bold text-sm hover:bg-[#163d30] transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

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
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <AppLogo size={56} />
            </div>
            <h1 className="text-2xl font-bold text-[#222]">Create Account</h1>
            <p className="text-sm text-[#888] mt-1">Join PJHERBAL for exclusive wellness benefits</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e8e4dc] p-6 shadow-sm space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#444] mb-1.5">Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="e.g. Amina Juma" className="w-full px-3.5 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#444] mb-1.5">Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className="w-full px-3.5 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#444] mb-1.5">Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+255 7XX XXX XXX" className="w-full px-3.5 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#444] mb-1.5">Password *</label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange} required placeholder="Min. 6 characters" className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#444] mb-1.5">Confirm Password *</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required placeholder="Repeat password" className="w-full px-3.5 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/30 focus:border-[#1b4d3e]" />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 bg-[#1b4d3e] text-white rounded-xl font-bold text-sm hover:bg-[#163d30] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Creating Account…</> : 'Create Account'}
            </button>

            <p className="text-center text-xs text-[#888]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#1b4d3e] font-bold hover:underline">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

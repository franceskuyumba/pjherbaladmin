'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

type FormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setLoginError('');
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!', { description: 'Redirecting to dashboard…' });
      router.push('/overview-dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials — please check your email and password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="slide-up">
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <AppLogo size={36} />
        <div>
          <p className="text-sm font-bold text-foreground">PJHERBAL CLINIC</p>
          <p className="text-xs text-muted-foreground">Segerea Branch · Admin</p>
        </div>
      </div>

      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground">Sign in to Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your credentials to access the management dashboard.
        </p>
      </div>

      {loginError && (
        <div className="flex items-start gap-2.5 p-3.5 mb-5 bg-red-50 border border-red-200 rounded-lg fade-in">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{loginError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="login-email" className="block text-sm font-semibold text-foreground mb-1.5">
            Email Address
          </label>
          <p className="text-xs text-muted-foreground mb-2">Use your assigned clinic admin email</p>
          <input
            id="login-email"
            type="email"
            placeholder="yourname@pjherbal.co.tz"
            className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Enter a valid email address',
              },
            })}
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
              <AlertCircle size={11} />
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-sm font-semibold text-foreground">
              Password
            </label>
            <button
              type="button"
              className="text-xs text-primary hover:text-primary-mid font-medium transition-colors duration-150"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`input-field pr-11 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
              <AlertCircle size={11} />
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <input
            id="remember-me"
            type="checkbox"
            className="w-4 h-4 rounded border-input accent-primary cursor-pointer"
            {...register('rememberMe')}
          />
          <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer select-none">
            Keep me signed in for 30 days
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 text-sm mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign In to Dashboard'
          )}
        </button>
      </form>
    </div>
  );
}

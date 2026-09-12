import React from 'react';
import AdminLoginForm from './components/AdminLoginForm';
import AdminLoginBranding from './components/AdminLoginBranding';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Branding Panel */}
      <AdminLoginBranding />

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Store, Lock, Phone, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';

export default function LoginPage({ onLoginSuccess, onGoToRegister }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.demoLogin();
      apiClient.setToken(data.access_token);
      apiClient.setMerchant(data.merchant);
      onLoginSuccess(data.merchant);
    } catch (err) {
      setError(err.message || 'Demo login failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setError('Please enter both mobile number and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.login(phone, password);
      apiClient.setToken(data.access_token);
      apiClient.setMerchant(data.merchant);
      onLoginSuccess(data.merchant);
    } catch (err) {
      setError(err.message || 'Incorrect mobile number or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 sm:p-8">
        
        {/* Header with Official Paytm for Business Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img 
              src="/paytm-for-business.png" 
              alt="Paytm for Business" 
              className="h-10 w-auto object-contain"
            />
            <div className="h-6 w-px bg-[#E5E7EB]" />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-[#002970]">Gullak AI</span>
              <span className="text-[10px] font-semibold text-[#002970] bg-[#002970]/8 border border-[#002970]/15 px-1.5 py-0.2 rounded">Beta</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Merchant Portal Login</h2>
          <p className="text-xs text-[#6B7280] mt-1">Autonomous Kirana Intelligence & Working Capital</p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="mb-6 p-4 rounded-xl bg-[#002970]/5 border border-[#002970]/15 text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <Store className="w-4 h-4 text-[#002970]" />
            <span className="font-bold text-xs text-[#002970] uppercase tracking-wide">Quick Merchant Access</span>
          </div>
          <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
            Explore <strong>Sharma General Stores</strong> (Mumbai) with pre-seeded Diwali sales, inventory, and customer records.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#002970] hover:bg-[#071E46] text-white text-xs font-semibold rounded-lg shadow-sm active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Store className="w-4 h-4" />
            <span>1-Click Demo Login (Sharma Stores)</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-[#E5E7EB] w-full" />
          <span className="bg-white px-3 text-xs text-[#6B7280] font-medium uppercase">Or Sign In with Mobile</span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-[#D92D20] text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">Registered Mobile Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9820012345"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#002970] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#002970] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#002970] hover:bg-[#071E46] text-white font-semibold text-sm rounded-lg shadow-sm transition active:scale-98 flex items-center justify-center gap-2"
          >
            <span>Sign In to Merchant Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#6B7280]">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onGoToRegister}
            className="font-semibold text-[#002970] hover:underline"
          >
            Register your store
          </button>
        </div>

      </div>
    </div>
  );
}

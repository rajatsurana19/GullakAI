import React, { useState } from 'react';
import { Store, User, Phone, Lock, Globe, ArrowRight, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';

export default function RegisterPage({ onRegisterSuccess, onGoToLogin }) {
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    phone_number: '',
    password: '',
    category: 'Grocery & General Store',
    city: 'Mumbai',
    preferred_language: 'mr'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.business_name || !formData.owner_name || !formData.phone_number || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.register(formData);
      apiClient.setToken(data.access_token);
      apiClient.setMerchant(data.merchant);
      onRegisterSuccess(data.merchant);
    } catch (err) {
      setError(err.message || 'Registration failed. Mobile number may already exist.');
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
          <h2 className="text-xl font-bold text-[#1A1A1A]">Register Store</h2>
          <p className="text-xs text-[#6B7280] mt-1">Join the Gullak AI Merchant Ecosystem</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-[#D92D20] text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Store / Business Name *</label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              placeholder="e.g. Laxmi Super Market"
              className="w-full px-3.5 py-2.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#002970] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Owner Name *</label>
            <input
              type="text"
              value={formData.owner_name}
              onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              placeholder="e.g. Santosh Gaikwad"
              className="w-full px-3.5 py-2.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#002970] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Mobile Number (Paytm linked) *</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="e.g. 9819900000"
              className="w-full px-3.5 py-2.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#002970] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Create Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#002970] focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Language</label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#002970]"
              >
                <option value="mr">मराठी (Marathi)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Mumbai"
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#002970]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-[#002970] hover:bg-[#071E46] text-white font-semibold text-sm rounded-lg shadow-sm transition active:scale-98 flex items-center justify-center gap-2"
          >
            <span>Complete Registration</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-[#6B7280]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onGoToLogin}
            className="font-semibold text-[#002970] hover:underline"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
}

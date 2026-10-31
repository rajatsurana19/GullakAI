import React, { useState, useEffect } from 'react';
import { Store, User, Phone, MapPin, CreditCard, LogOut, ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';
import { apiClient } from '../api/client';
import { LoadingState } from '../components/common/EmptyState';

export default function MerchantProfilePage({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [integrations, setIntegrations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profRes, intRes] = await Promise.all([
        apiClient.getMe(),
        apiClient.getIntegrationsStatus()
      ]);
      setProfile(profRes);
      setIntegrations(intRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return <LoadingState message="Loading merchant business profile..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-paytm-blue to-paytm-cyan text-white flex items-center justify-center font-black text-xl">
            {profile.business_name?.[0] || 'S'}
          </div>
          <div>
            <h2 className="text-xl font-black text-paytm-navy">{profile.business_name}</h2>
            <p className="text-xs text-paytm-muted">{profile.owner_name} • {profile.city}, {profile.state}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Details Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-paytm-navy">Store Profile & Settlement Account</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 font-semibold block">Business Category</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{profile.category}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 font-semibold block">Paytm Linked Mobile</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">+91 {profile.phone_number}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 font-semibold block">Daily Settlement VPA</span>
            <span className="font-bold text-paytm-blue text-sm mt-0.5 block">{profile.settlement_vpa}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 font-semibold block">Primary Language</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {profile.preferred_language === 'mr' ? 'मराठी (Marathi)' : profile.preferred_language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
            </span>
          </div>
        </div>
      </div>

      {/* Connected Integrations & Devices */}
      {integrations && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-paytm-blue" />
            <h3 className="font-bold text-base text-paytm-navy">Connected Hardware & Adapters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Paytm Soundbox 4G</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Online</span>
              </div>
              <p className="text-slate-500 text-[11px]">Battery: {integrations.soundbox.battery} • {integrations.soundbox.language}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Voice Engine (Sarvam AI)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Active</span>
              </div>
              <p className="text-slate-500 text-[11px]">{integrations.voice_engine.provider}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">WhatsApp Business API</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Connected</span>
              </div>
              <p className="text-slate-500 text-[11px]">Sender: {integrations.whatsapp_business.sender_phone} ({integrations.whatsapp_business.mode})</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">ONDC / B2B Distributors</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Linked</span>
              </div>
              <p className="text-slate-500 text-[11px]">Partner: {integrations.ondc_distributors.primary_distributor}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { apiClient } from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/EmptyState';

export default function ConsentSettingsPage() {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getConsents();
      setConsents(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id, purpose) => {
    if (!confirm(`Are you sure you want to withdraw consent for "${purpose}" under DPDPA 2023?`)) return;
    try {
      await apiClient.withdrawConsent(id);
      setMsg(`Consent withdrawn for ${purpose}. The agent will no longer process this data.`);
      setTimeout(() => setMsg(''), 5000);
      loadConsents();
    } catch (err) {
      alert(err.message || 'Failed to withdraw consent');
    }
  };

  if (loading) {
    return <LoadingState message="Retrieving DPDPA 2023 active consent certificates..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-paytm-navy">Consent & Privacy Governance</h2>
            <p className="text-xs text-paytm-muted">Compliance with India's Digital Personal Data Protection Act (DPDPA 2023)</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full self-start sm:self-auto">
          DPDPA 2023 Compliant
        </span>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Purpose Consents Cards */}
      <div className="space-y-4">
        {consents.map((c) => {
          const isGranted = c.status === 'GRANTED';
          return (
            <div key={c.id} className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-paytm-navy">{c.purpose.replace('_', ' ')}</h3>
                  <StatusBadge status={c.status} />
                </div>
                <div className="text-xs text-slate-400">
                  Granted: {new Date(c.granted_at).toLocaleDateString()} • Retention: {c.retention_period_days} Days
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {c.processing_activity}
              </p>

              <div className="p-3 bg-slate-50 rounded-2xl flex flex-wrap items-center gap-2 text-xs text-slate-700">
                <span className="font-bold text-slate-500">Authorized Data Categories:</span>
                {Array.isArray(c.data_categories) && c.data_categories.map((cat, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-mono text-[10px]">
                    {cat}
                  </span>
                ))}
              </div>

              {isGranted && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleWithdraw(c.id, c.purpose)}
                    className="px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Withdraw Consent</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

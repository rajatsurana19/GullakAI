import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Users, ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { apiClient } from '../api/client';
import { LoadingState } from '../components/common/EmptyState';

export default function HyperlocalInsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHyperlocal();
  }, []);

  const loadHyperlocal = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getHyperlocalTrends();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <LoadingState message="Aggregating neighbourhood demand trends & peer benchmarks..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-paytm-cyan flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-paytm-navy">Hyperlocal Market Intelligence</h2>
            <p className="text-xs text-paytm-muted">{data.region} • Sample: {data.sample_size}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Anonymized Peer Data</span>
        </div>
      </div>

      {/* Peer Benchmarks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-tr from-blue-50 to-white rounded-3xl border border-blue-200/80 shadow-xs">
          <div className="text-xs font-bold text-paytm-blue uppercase tracking-wide mb-1">Revenue vs Peers</div>
          <div className="text-xl font-black text-paytm-navy">{data.merchant_benchmark.sales_vs_peers}</div>
          <p className="text-xs text-slate-600 mt-1">Sharma Stores is outperforming local grocery average in Dadar West</p>
        </div>
        <div className="p-5 bg-gradient-to-tr from-cyan-50 to-white rounded-3xl border border-cyan-200/80 shadow-xs">
          <div className="text-xs font-bold text-paytm-cyan uppercase tracking-wide mb-1">Average Ticket Size</div>
          <div className="text-xl font-black text-paytm-navy">{data.merchant_benchmark.atv_comparison}</div>
          <p className="text-xs text-slate-600 mt-1">High proportion of bulk festival hampers and 5L ghee orders</p>
        </div>
        <div className="p-5 bg-gradient-to-tr from-emerald-50 to-white rounded-3xl border border-emerald-200/80 shadow-xs">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">Paytm Soundbox UPI</div>
          <div className="text-xl font-black text-emerald-950">{data.merchant_benchmark.upi_acceptance_rate}</div>
          <p className="text-xs text-slate-600 mt-1">Zero payment friction leading to higher customer checkout speed</p>
        </div>
      </div>

      {/* Neighbourhood Demand Trends */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-base text-paytm-navy">Top Trending Categories in Dadar / Mumbai Central</h3>
        <div className="space-y-3">
          {data.trends.map((t, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-800">{t.category}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-paytm-blue">{t.neighbourhood_rank}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{t.insight}</p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-base font-black text-emerald-600">{t.demand_surge}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Demand</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

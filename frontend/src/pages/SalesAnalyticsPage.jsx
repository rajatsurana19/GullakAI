import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, BarChart3, Clock, PieChart, ShieldCheck } from 'lucide-react';
import { apiClient } from '../api/client';
import { LoadingState } from '../components/common/EmptyState';

export default function SalesAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getSalesAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <LoadingState message="Loading sales analytics and hourly breakdown..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-paytm-navy">Sales & Revenue Analytics</h2>
          <p className="text-xs text-paytm-muted">Live insights from Paytm Soundbox and UPI payments</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-paytm-blue border border-blue-200 rounded-xl">
            {data.period}
          </span>
        </div>
      </div>

      {/* Hourly Sales Velocity Grid */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-paytm-blue" />
            <div>
              <h3 className="text-base font-bold text-paytm-navy">Hourly Sales Activity</h3>
              <p className="text-xs text-paytm-muted">Peak rush hours: 10:00 AM - 1:00 PM and 6:00 PM - 9:00 PM</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2 pt-2">
          {data.hourly_breakdown.map((h, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">{h.hour}</span>
              <span className="text-xs sm:text-sm font-black text-paytm-navy block">₹{Math.round(h.sales)}</span>
              <span className="text-[10px] font-semibold text-paytm-blue block mt-0.5">{h.orders} orders</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method Distribution & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Payment Methods */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-paytm-navy mb-1">Payment Method Distribution</h3>
          <p className="text-xs text-paytm-muted mb-4">Channel volume over the past 7 days</p>

          <div className="space-y-3">
            {Object.entries(data.payment_method_distribution).map(([method, amount], idx) => {
              const total = Object.values(data.payment_method_distribution).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{method}</span>
                    <span>₹{Number(amount).toLocaleString('en-IN')} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-paytm-cyan to-paytm-blue rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-paytm-navy mb-1">Product Category Contribution</h3>
          <p className="text-xs text-paytm-muted mb-4">Festive categories driving highest margin</p>

          <div className="space-y-3">
            {data.category_breakdown.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{cat.category}</span>
                  <span className="text-paytm-navy">₹{cat.sales.toLocaleString('en-IN')} ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

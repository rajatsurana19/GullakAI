import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertCircle, Sparkles, Megaphone, ArrowRight, Phone } from 'lucide-react';
import { apiClient } from '../api/client';
import { LoadingState } from '../components/common/EmptyState';

export default function CustomerIntelligencePage({ onNavigate }) {
  const [customers, setCustomers] = useState([]);
  const [segments, setSegments] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
  }, [selectedSegment]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const [custList, segRes] = await Promise.all([
        apiClient.getCustomers(selectedSegment ? { segment: selectedSegment } : {}),
        apiClient.getCustomerSegments()
      ]);
      setCustomers(custList);
      setSegments(segRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !segments) {
    return <LoadingState message="Analyzing customer recency, frequency, and spend patterns..." />;
  }

  const atRiskCount = segments?.['At-Risk Customers']?.count || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-paytm-navy">Customer Intelligence & Retention</h2>
          <p className="text-xs text-paytm-muted">RFM customer segmentation with churn prediction</p>
        </div>
        <button
          onClick={() => onNavigate('campaigns')}
          className="px-4 py-2 bg-gradient-to-r from-paytm-cyan to-paytm-blue text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Megaphone className="w-4 h-4" />
          <span>Create WhatsApp Campaign</span>
        </button>
      </div>

      {/* At-Risk Warning Card (Signature Scenario Target) */}
      {atRiskCount > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-amber-950">
                {atRiskCount} Loyal Customers Have Not Visited in 30+ Days
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed max-w-xl">
                These shoppers previously spent over ₹8,000 each in your store. Sending a 10% Diwali WhatsApp discount is predicted to bring back ~18% of them.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('campaigns')}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <span>Draft Re-engagement Campaign</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* RFM Segments Cards Grid */}
      {segments && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(segments).map(([name, data]) => {
            const isSelected = selectedSegment === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedSegment(isSelected ? '' : name)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected 
                    ? 'border-paytm-blue bg-blue-50/70 shadow-xs ring-2 ring-blue-100' 
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-500 truncate mb-1">{name}</div>
                <div className="text-xl font-black text-paytm-navy">{data.count}</div>
                <div className="text-[10px] text-paytm-muted mt-0.5 truncate">
                  ₹{Number(data.total_spend).toLocaleString('en-IN', { maximumFractionDigits: 0 })} spend
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Customer Directory Table / Mobile Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-paytm-navy">
            {selectedSegment ? `${selectedSegment} (${customers.length})` : `All Verified Customers (${customers.length})`}
          </h3>
          {selectedSegment && (
            <button
              onClick={() => setSelectedSegment('')}
              className="text-xs text-paytm-blue font-bold hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">RFM Segment</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total Spend</th>
                <th className="py-3 px-4">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{c.phone_number}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.segment === 'Champions' ? 'bg-emerald-50 text-emerald-700' :
                      c.segment === 'At-Risk Customers' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {c.segment}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{c.total_orders} orders</td>
                  <td className="py-3 px-4 font-black text-paytm-navy">₹{c.total_spend.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-slate-500">{c.recency_days} days ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {customers.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 text-sm">{c.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{c.phone_number} • {c.recency_days}d ago</div>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {c.segment}
                </span>
              </div>
              <div className="text-right">
                <div className="font-black text-paytm-navy text-sm">₹{c.total_spend.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-400">{c.total_orders} orders</div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

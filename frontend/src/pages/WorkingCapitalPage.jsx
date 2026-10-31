import React, { useState, useEffect } from 'react';
import { Coins, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { apiClient } from '../api/client';
import { LoadingState } from '../components/common/EmptyState';

export default function WorkingCapitalPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkingCapital();
  }, []);

  const loadWorkingCapital = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getWorkingCapital();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <LoadingState message="Analyzing cash flow gaps and eligible lender products..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-paytm-navy">Working Capital & Festive Funding</h2>
          <p className="text-xs text-paytm-muted">AI cashflow gap forecasting and partner lender options</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-paytm-blue border border-blue-200 rounded-xl self-start sm:self-auto">
          5 Days to Peak Festive Rush
        </span>
      </div>

      {/* Mandatory Regulatory Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          <strong>Important Regulatory Disclaimer:</strong> {data.disclaimer}
        </p>
      </div>

      {/* Funding Gap Projection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Festive Stock-Up Requirement</span>
          <div className="text-2xl font-black text-paytm-navy">₹{data.diwali_stockup_requirement.toLocaleString('en-IN')}</div>
          <p className="text-xs text-slate-500 mt-1">Estimated for 15 days of inventory buffer</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Upcoming Supplier Payables</span>
          <div className="text-2xl font-black text-slate-800">₹{data.upcoming_supplier_payables.toLocaleString('en-IN')}</div>
          <p className="text-xs text-slate-500 mt-1">Due within 48-72 hours to distributors</p>
        </div>

        <div className="p-5 bg-gradient-to-tr from-rose-50 to-white rounded-3xl border border-rose-200 shadow-xs">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wide block mb-1">Forecasted Cashflow Gap</span>
          <div className="text-2xl font-black text-rose-900">₹{data.estimated_cashflow_gap.toLocaleString('en-IN')}</div>
          <p className="text-xs text-rose-700 mt-1 font-medium">Potential shortage if stock not funded</p>
        </div>
      </div>

      {/* Authorized Partner Lender Offers */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-base text-paytm-navy">Pre-Qualified Partner Lender Products</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.eligible_lender_products.map((prod, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-extrabold text-sm sm:text-base text-paytm-navy">{prod.product_type}</h4>
                  <span className="text-xs font-black text-paytm-blue bg-blue-50 px-2.5 py-1 rounded-lg">
                    Up to ₹{prod.indicative_limit.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mb-3">Partner: {prod.lender_name}</p>

                <div className="space-y-1.5 text-xs text-slate-700 border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Repayment Mode:</span>
                    <span className="font-bold">{prod.daily_deduction_rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tenure:</span>
                    <span className="font-bold">{prod.tenure_months} Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Processing Fee:</span>
                    <span className="font-bold text-emerald-700">{prod.processing_fee}</span>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-white rounded-xl text-[11px] text-slate-600 border border-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{prod.eligibility_status}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 italic">Non-binding indicative terms</span>
                <button className="px-4 py-2 bg-paytm-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition">
                  Apply via Partner
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

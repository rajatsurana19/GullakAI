import React, { useState, useEffect } from 'react';
import { Truck, Phone, Star, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/client';
import { LoadingState } from '../components/common/EmptyState';

export default function SupplierManagementPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getSuppliers();
      setSuppliers(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Connecting to wholesale distributor network..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-paytm-navy">Wholesale Suppliers & ONDC Partners</h2>
          <p className="text-xs text-paytm-muted">Verified B2B distributors connected for automated reordering</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
          {suppliers.length} Verified Partners
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map((sup) => (
          <div key={sup.id} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-paytm-navy">{sup.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{sup.category} • Lead time: {sup.lead_time_days} days</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{sup.rating}</span>
                </div>
              </div>

              <div className="my-3 p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Contact: {sup.contact_person || 'Distributor Desk'}</span>
                  <span className="font-bold text-paytm-navy flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {sup.phone_number}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Channel:</span>
                  <span className="font-bold text-paytm-blue">{sup.platform.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected & Ready</span>
              </span>
              <button className="px-3.5 py-1.5 bg-paytm-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition">
                Create Order
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

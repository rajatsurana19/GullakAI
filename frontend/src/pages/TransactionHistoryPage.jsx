import React, { useState, useEffect } from 'react';
import { History, Search, Filter, IndianRupee, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { apiClient } from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import { LoadingState, EmptyState } from '../components/common/EmptyState';

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getTransactions({ limit: 50 });
      setTransactions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter(t => 
    t.payer_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.paytm_order_id?.toLowerCase().includes(search.toLowerCase()) ||
    t.payment_method?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-paytm-navy">Transaction History</h2>
          <p className="text-xs text-paytm-muted">Real-time ledger of Soundbox QR and UPI customer payments</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or Order ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-paytm-cyan focus:bg-white"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching transaction history..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No transactions match your search" description="Try a different customer name or order ID." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {t.payer_name || 'Walk-in Customer'}
                      <div className="text-[10px] text-slate-400 font-normal">{t.payer_vpa || 'Soundbox Scan'}</div>
                    </td>
                    <td className="py-3 px-4 font-black text-paytm-navy text-sm">
                      ₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {t.payment_method}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {t.paytm_order_id}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                        {t.provenance_source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (Mobile-First requirement) */}
          <div className="sm:hidden divide-y divide-slate-100">
            {filtered.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-sm">{t.payer_name || 'Customer'}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.payment_method} • {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="mt-1.5">
                    <StatusBadge status={t.status} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-paytm-navy text-base">₹{t.amount.toLocaleString('en-IN')}</div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                    {t.provenance_source}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

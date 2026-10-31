import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle2, ShoppingCart, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { apiClient } from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/EmptyState';
import WhyExplanationCard from '../components/common/WhyExplanationCard';

export default function InventoryManagementPage({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const [prodRes, alertRes] = await Promise.all([
        apiClient.getInventory(),
        apiClient.getInventoryAlerts()
      ]);
      setProducts(prodRes);
      setAlerts(alertRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReorder = async (product) => {
    try {
      const suppliers = await apiClient.getSuppliers();
      const supId = suppliers[0]?.id || "sup-default-1";
      const qty = Math.max(20, product.safety_stock * 3);
      
      await apiClient.createReorderDraft({
        supplier_id: supId,
        items: [
          {
            product_id: product.id,
            quantity: qty,
            unit_price: product.cost_price
          }
        ]
      });

      setSuccessMsg(`Draft reorder created for ${qty} ${product.unit} of ${product.name}! Check Approvals to confirm.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.message || "Failed to create reorder draft");
    }
  };

  if (loading) {
    return <LoadingState message="Checking warehouse stock levels and demand forecast..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-paytm-navy">Inventory & Stock Health</h2>
          <p className="text-xs text-paytm-muted">AI demand prediction and automated supplier replenishment</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('suppliers')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
          >
            Manage Suppliers
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => onNavigate('approvals')}
            className="underline hover:text-emerald-950 font-black ml-4"
          >
            Go to Approvals →
          </button>
        </div>
      )}

      {/* Urgent Low Stock Alerts Banner (Layman-Friendly) */}
      {alerts.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-sm sm:text-base text-amber-900">
              {alerts.length} Items at Risk of Running Out Before Diwali
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((alt, i) => (
              <div key={i} className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{alt.product_name}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                      {alt.days_left} Days Left
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{alt.human_message}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-paytm-blue">{alt.suggested_action}</span>
                  <button
                    onClick={() => {
                      const p = products.find(prod => prod.id === alt.product_id);
                      if (p) handleQuickReorder(p);
                    }}
                    className="px-2.5 py-1 bg-paytm-blue text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition"
                  >
                    Draft Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Catalogue Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-paytm-navy">Product Catalogue ({products.length} Items)</h3>
          <span className="text-xs text-paytm-muted">Sorted by sales velocity</span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Daily Sales</th>
                <th className="py-3 px-4">Coverage</th>
                <th className="py-3 px-4">Stockout Risk</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {p.is_festive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">Diwali</span>
                      )}
                    </div>
                    {p.name_marathi && <div className="text-[10px] text-slate-400 font-normal">{p.name_marathi}</div>}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{p.category}</td>
                  <td className="py-3 px-4 font-black text-paytm-navy">
                    {p.current_stock} {p.unit}
                    <div className="text-[10px] text-slate-400 font-normal">Min: {p.safety_stock} {p.unit}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{p.daily_sales_velocity || p.stock_coverage_days ? `${Math.round(p.current_stock / (p.stock_coverage_days || 1))} /day` : '2/day'}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{p.stock_coverage_days} days</td>
                  <td className="py-3 px-4">
                    {p.is_low_stock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Runs out in {p.predicted_stock_out_days}d
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Healthy
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleQuickReorder(p)}
                      className="px-3 py-1 bg-slate-100 hover:bg-paytm-blue hover:text-white text-slate-700 text-xs font-bold rounded-lg transition"
                    >
                      Reorder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden divide-y divide-slate-100">
          {products.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  <span>{p.name}</span>
                  {p.is_festive && <span className="text-[9px] font-bold px-1 bg-amber-100 text-amber-800 rounded">Diwali</span>}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Stock: <strong className="text-paytm-navy">{p.current_stock} {p.unit}</strong> • Coverage: {p.stock_coverage_days} days
                </div>
                <div className="mt-1">
                  {p.is_low_stock ? (
                    <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Runs out in {p.predicted_stock_out_days} days
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-600">Stock healthy</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleQuickReorder(p)}
                className="px-3 py-1.5 bg-paytm-blue text-white text-xs font-bold rounded-xl active:scale-95 transition flex-shrink-0"
              >
                Reorder
              </button>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

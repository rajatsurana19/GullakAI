import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Info,
  Sparkles,
  Lock
} from 'lucide-react';
import { apiClient } from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import { LoadingState, EmptyState } from '../components/common/EmptyState';

export default function ApprovalCentrePage({ onNavigate }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [filter, setFilter] = useState('PENDING'); // PENDING | ALL

  useEffect(() => {
    loadApprovals();
  }, [filter]);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getApprovals(filter === 'ALL' ? null : filter);
      setApprovals(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeAction = async (id, actionType) => {
    try {
      setActionLoadingId(id);
      await apiClient.takeApprovalAction(id, actionType);
      await loadApprovals();
    } catch (err) {
      alert(err.message || `Failed to ${actionType.toLowerCase()} action`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-paytm-warning text-white flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-paytm-navy">Merchant Approval Centre</h2>
            <p className="text-xs text-paytm-muted">Layer 5 Governance: The agent cannot spend money or message customers without your explicit consent</p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'PENDING' ? 'bg-white text-paytm-blue shadow-xs' : 'text-slate-600'
            }`}
          >
            Awaiting Approval
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'ALL' ? 'bg-white text-paytm-blue shadow-xs' : 'text-slate-600'
            }`}
          >
            All Action History
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Checking pending actions & merchant authorizations..." />
      ) : approvals.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All caught up! No actions awaiting approval"
          description="When Gullak AI drafts a supplier reorder or a marketing campaign, you will review and approve it here before execution."
        />
      ) : (
        <div className="space-y-4">
          {approvals.map((req) => {
            const isPending = req.status === 'PENDING';
            const isProcessing = actionLoadingId === req.id;

            return (
              <div 
                key={req.id} 
                className={`p-5 sm:p-6 rounded-3xl border shadow-xs transition-all ${
                  isPending 
                    ? 'bg-white border-amber-300 ring-2 ring-amber-100/50' 
                    : 'bg-white/80 border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                      {req.action_type.replace('_', ' ')}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="text-xs text-slate-400">
                    Created: {new Date(req.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Title & Estimated Amount */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-paytm-navy">{req.title}</h3>
                    <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">
                      <strong>Business Justification:</strong> {req.business_justification}
                    </p>
                  </div>
                  {req.estimated_amount > 0 && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-right flex-shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Amount</span>
                      <span className="text-lg font-black text-paytm-navy">₹{req.estimated_amount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Transparency Details: Data Used & Risks (Gap Add-on Requirement 1) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-slate-700">
                  <div>
                    <span className="font-bold text-paytm-blue block mb-0.5">Data Sources Verified:</span>
                    <span>{Array.isArray(req.data_sources_used) ? req.data_sources_used.join(', ') : 'Past sales & inventory'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-paytm-blue block mb-0.5">Risk Assessment:</span>
                    <span>{req.risk_assessment || 'Low risk. Action governed by DPDPA consent.'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {isPending && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-[11px] text-paytm-muted flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-paytm-success flex-shrink-0" />
                      <span>Idempotency-protected. Single-click execution via authorized adapter.</span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={() => handleTakeAction(req.id, 'REJECT')}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition active:scale-95"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleTakeAction(req.id, 'APPROVE')}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-paytm-cyan to-paytm-blue hover:from-cyan-400 hover:to-blue-600 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isProcessing ? 'Executing with Adapter...' : 'Authorize & Execute'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

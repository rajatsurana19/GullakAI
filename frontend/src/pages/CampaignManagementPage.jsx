import React, { useState, useEffect } from 'react';
import { Megaphone, MessageSquare, TrendingUp, CheckCircle2, ArrowRight, Sparkles, Send } from 'lucide-react';
import { apiClient } from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/EmptyState';
import WhyExplanationCard from '../components/common/WhyExplanationCard';

export default function CampaignManagementPage({ onNavigate }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getCampaigns();
      setCampaigns(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDiwaliCampaign = async () => {
    try {
      setIsGenerating(true);
      const camp = await apiClient.generateCampaign({
        target_segment: "At-Risk Customers",
        festival_context: "Diwali",
        discount_percent: 10.0
      });
      setCreatedCampaign(camp);
      loadCampaigns();
    } catch (err) {
      alert(err.message || "Failed to generate campaign");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading && campaigns.length === 0) {
    return <LoadingState message="Loading marketing campaigns and uplift forecasts..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-paytm-navy">Campaign Management & Uplift</h2>
          <p className="text-xs text-paytm-muted">Personalized WhatsApp Business campaigns with causal uplift estimates</p>
        </div>
        <button
          onClick={handleGenerateDiwaliCampaign}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-gradient-to-r from-paytm-cyan to-paytm-blue hover:from-cyan-400 hover:to-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-auto active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Generating with AI...' : 'Draft Diwali Campaign'}</span>
        </button>
      </div>

      {/* Generated Campaign Preview Card */}
      {createdCampaign && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-emerald-950">
                {createdCampaign.title} Drafted Successfully!
              </h3>
            </div>
            <button
              onClick={() => onNavigate('approvals')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <span>Review in Approvals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-2xl border border-emerald-100">
              <span className="text-slate-400 font-semibold block">Target Audience:</span>
              <span className="font-bold text-slate-800 text-sm">{createdCampaign.total_recipients} Inactive Customers</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-emerald-100">
              <span className="text-slate-400 font-semibold block">Expected Revenue Uplift:</span>
              <span className="font-bold text-emerald-700 text-sm">+{createdCampaign.estimated_uplift_percent}% (~₹{createdCampaign.estimated_revenue})</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-emerald-100">
              <span className="text-slate-400 font-semibold block">Campaign Dispatch Cost:</span>
              <span className="font-bold text-slate-800 text-sm">₹{createdCampaign.estimated_cost} (WhatsApp utility)</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-emerald-100 text-xs font-mono whitespace-pre-line text-slate-700 leading-relaxed">
            {createdCampaign.message_template}
          </div>
        </div>
      )}

      {/* Campaign List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-paytm-navy">Campaign History & Uplift Performance</h3>
          <span className="text-xs text-paytm-muted">{campaigns.length} Campaigns</span>
        </div>

        <div className="divide-y divide-slate-100">
          {campaigns.map((camp) => (
            <div key={camp.id} className="p-5 hover:bg-slate-50/50 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">{camp.title}</h4>
                    <StatusBadge status={camp.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Channel: {camp.channel} • Target: {camp.target_segment}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Recipients</span>
                    <strong className="text-paytm-navy">{camp.total_recipients}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Est. Uplift</span>
                    <strong className="text-emerald-600">+{camp.estimated_uplift_percent}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Est. Revenue</span>
                    <strong className="text-paytm-navy">₹{camp.estimated_revenue}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 whitespace-pre-line border border-slate-100 leading-relaxed font-sans">
                {camp.message_template}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

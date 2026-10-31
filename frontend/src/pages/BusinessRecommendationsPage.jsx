import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, ShoppingCart, Megaphone, Coins } from 'lucide-react';
import WhyExplanationCard from '../components/common/WhyExplanationCard';

export default function BusinessRecommendationsPage({ onNavigate }) {
  const recommendations = [
    {
      id: 1,
      title: "Diwali Desi Ghee & Dry Fruits Stockout Warning",
      category: "INVENTORY",
      priority: "CRITICAL",
      summary: "Current stock of Pure Desi Ghee (1L & 5L) and Dry Fruits Hampers will deplete in approximately 4 days.",
      why: "LightGBM forecasting model predicts a +180% festive demand surge in Dadar neighbourhood over the next 5 days. Current warehouse inventory is only 12 units against safety stock of 35 units.",
      action: "Reorder 50 units from Mahalaxmi Wholesale Distributors (Est. cost ₹18,500).",
      cta: "Draft Supplier Order",
      target: "inventory"
    },
    {
      id: 2,
      title: "Diwali WhatsApp Greeting & 10% Discount for Inactive Customers",
      category: "MARKETING",
      priority: "HIGH",
      summary: "24 regular customers haven't made a purchase in 30+ days.",
      why: "RFM recency analysis flagged these 24 shoppers as At-Risk. Causal uplift modeling estimates an 18.5% incremental conversion rate (~₹6,800 revenue) against a dispatch cost of only ₹9.60.",
      action: "Broadcast personalized Diwali greeting with 10% discount valid till Sunday.",
      cta: "Launch WhatsApp Campaign",
      target: "campaigns"
    },
    {
      id: 3,
      title: "Diwali Festive Inventory Working Capital Line",
      category: "WORKING_CAPITAL",
      priority: "MEDIUM",
      summary: "Estimated inventory funding gap of ₹45,000 for peak Diwali festive stock.",
      why: "Based on previous month Soundbox UPI collections of ₹7.4 Lakhs, you are pre-qualified for ₹50,000 quick credit with 1.2% daily settlement deduction through authorized partner lenders.",
      action: "Review lender terms and eligibility disclaimers.",
      cta: "View Working Capital Options",
      target: "capital"
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-paytm-cyan to-paytm-blue text-white flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-paytm-navy">AI Business Recommendations</h2>
            <p className="text-xs text-paytm-muted">Sense → Think → Act: Governed autonomous merchant growth actions</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-paytm-blue border border-blue-200 rounded-full">
          3 Actionable Opportunities
        </span>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  rec.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                  rec.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-paytm-blue'
                }`}>
                  {rec.priority} PRIORITY
                </span>
                <span className="text-xs font-bold text-slate-400">• {rec.category}</span>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-paytm-navy">{rec.title}</h3>
              <p className="text-sm text-slate-700 font-medium mt-1 leading-relaxed">{rec.summary}</p>
            </div>

            {/* Why Explanation Card */}
            <WhyExplanationCard
              title="Why does Gullak AI recommend this?"
              explanation={rec.why}
              suggestedAction={rec.action}
              dataSources={["Warehouse Inventory", "LightGBM Demand Model", "RFM Customer Scores"]}
            />

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => onNavigate(rec.target)}
                className="px-5 py-2.5 bg-paytm-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
              >
                <span>{rec.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

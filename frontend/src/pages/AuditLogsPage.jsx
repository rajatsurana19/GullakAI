import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, CheckCircle2, Lock, ArrowRight, UserCheck, Calendar, IndianRupee } from 'lucide-react';
import { apiClient } from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/EmptyState';

export default function AuditLogsPage({ currentLang = 'mr' }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const labels = {
    mr: {
      title: "सुरक्षित व्यवसाय नोंदी (Business Audit Records)",
      subtitle: "सर्व ऑर्डर्स, संदेश आणि मंजुरींची अधिकृत व फेरफार-संरक्षित नोंदणी",
      verifiedBadge: "Paytm अधिकृत व सुरक्षित नोंद",
      loading: "सुरक्षित नोंदींची पडताळणी करत आहे...",
      empty: "कोणतीही नोंद उपलब्ध नाही",
      actionBy: "कृती करणारे",
      aiAgent: "गुल्लक एआय असिस्टंट",
      verifiedProtected: "सुरक्षित नोंद",
      techDetails: "तांत्रिक पडताळणी तपशील (Auditor Reference)"
    },
    hi: {
      title: "सुरक्षित बिज़नेस एक्टिविटी रिकॉर्ड (Audit Logs)",
      subtitle: "सभी ऑर्डर्स, व्हाट्सएप संदेश और अप्रूवल की प्रामाणिक व सुरक्षित जानकारी",
      verifiedBadge: "Paytm प्रमाणित व सुरक्षित",
      loading: "सुरक्षित रिकॉर्ड्स की पुष्टि हो रही है...",
      empty: "कोई रिकॉर्ड उपलब्ध नहीं है",
      actionBy: "कार्रवाई कर्ता",
      aiAgent: "गुल्लक एआई असिस्टेंट",
      verifiedProtected: "सुरक्षित रिकॉर्ड",
      techDetails: "तकनीकी विवरण (Auditor Reference)"
    },
    en: {
      title: "Verified Business Activity Records",
      subtitle: "Official, tamper-evident log of all merchant actions, draft orders, and approvals",
      verifiedBadge: "Paytm Verified & Secure",
      loading: "Verifying secure audit records...",
      empty: "No activity records found",
      actionBy: "Initiated by",
      aiAgent: "Gullak AI Assistant",
      verifiedProtected: "Tamper-Proof Record",
      techDetails: "Technical Verification Details"
    }
  };

  const t = labels[currentLang] || labels.mr;

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAuditLogs();
      setLogs(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message={t.loading} />;
  }

  const formatFriendlyTitle = (log) => {
    if (log.input_payload?.title) {
      return log.input_payload.title;
    }
    if (log.action_type === 'MERCHANT_DEMO_INITIALIZED') {
      return currentLang === 'mr' 
        ? "शर्मा जनरल स्टोअर्स खाते व व्यवहार इतिहास सुरू करण्यात आला" 
        : (currentLang === 'hi' ? "शर्मा जनरल स्टोअर्स अकाउंट व लेन-देन शुरू हुआ" : "Sharma General Stores Initialized & Store Records Loaded");
    }
    if (log.action_type === 'APPROVAL_REQUEST_CREATED') {
      return currentLang === 'mr'
        ? "नवीन व्यावसायिक मंजुरी तयार करण्यात आली"
        : (currentLang === 'hi' ? "नई बिज़नेस अप्रूवल रिक्वेस्ट तैयार की गई" : "New Business Approval Request Created");
    }
    if (log.action_type === 'ORDER_PLACED') {
      return currentLang === 'mr' ? "पुरवठादाराला खरेदी ऑर्डर पाठवली" : "Supplier Order Placed";
    }
    if (log.action_type === 'CAMPAIGN_SENT') {
      return currentLang === 'mr' ? "ग्राहकांना व्हॉट्सॲप संदेश पाठवला" : "WhatsApp Broadcast Campaign Sent";
    }
    return log.action_type.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-paytm-navy">{t.title}</h2>
            <p className="text-xs text-paytm-muted mt-0.5">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t.verifiedBadge}</span>
        </div>
      </div>

      {/* Friendly Activity Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">{t.empty}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const friendlyTitle = formatFriendlyTitle(log);
              const amount = log.input_payload?.amount;
              const dateStr = new Date(log.timestamp).toLocaleString(
                currentLang === 'mr' ? 'mr-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN'), 
                { dateStyle: 'medium', timeStyle: 'short' }
              );

              return (
                <div key={log.id} className="p-5 hover:bg-slate-50/60 transition space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 leading-snug">
                          {friendlyTitle}
                        </span>
                        <StatusBadge status={log.status} />
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                        <div className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-paytm-blue" />
                          <span>{t.actionBy}: <strong className="text-slate-700">{t.aiAgent}</strong></span>
                        </div>

                        {amount !== undefined && (
                          <div className="flex items-center gap-1 font-bold text-paytm-navy bg-slate-100 px-2 py-0.5 rounded-md">
                            <span>₹{Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{dateStr}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 self-start">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.verifiedProtected}</span>
                    </div>
                  </div>

                  {/* Optional Collapsed Technical Details for IT/Auditors */}
                  <details className="text-[11px] text-slate-400 group pt-1">
                    <summary className="cursor-pointer select-none text-[10px] text-slate-400 hover:text-paytm-blue transition font-medium">
                      ▸ {t.techDetails}
                    </summary>
                    <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] text-slate-600 space-y-1">
                      <div><strong className="text-slate-500">Record ID:</strong> {log.id}</div>
                      <div><strong className="text-slate-500">Action Code:</strong> {log.action_type}</div>
                      <div className="truncate"><strong className="text-slate-500">Security Checksum:</strong> {log.current_hash}</div>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase();

  switch (normalized) {
    case 'SUCCESS':
    case 'COMPLETED':
    case 'GRANTED':
    case 'SETTLED':
    case 'DELIVERED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {status}
        </span>
      );

    case 'PENDING':
    case 'PENDING_APPROVAL':
    case 'DRAFT':
    case 'EXECUTING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600 animate-spin" />
          {status === 'PENDING_APPROVAL' ? 'Awaiting Approval' : status}
        </span>
      );

    case 'REJECTED':
    case 'FAILED':
    case 'WITHDRAWN':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          {status}
        </span>
      );

    case 'HIGH_RISK':
    case 'LOW_STOCK':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          <AlertTriangle className="w-3 h-3 text-orange-600" />
          {status}
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
}

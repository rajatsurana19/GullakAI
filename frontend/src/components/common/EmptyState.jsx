import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title = "No records found", description, actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-200 my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-paytm-navy mb-1">{title}</h3>
      {description && <p className="text-sm text-paytm-muted max-w-sm mb-5 leading-relaxed">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-paytm-blue text-white text-sm font-medium rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}

export function LoadingState({ message = "Checking your store data..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-paytm-cyan/20 animate-ping" />
        <div className="w-12 h-12 rounded-full border-4 border-paytm-cyan border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-medium text-paytm-navy">{message}</p>
      <p className="text-xs text-paytm-muted mt-1">Gullak AI is connecting to your business records...</p>
    </div>
  );
}

import React from 'react';
import { ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';

interface CurriculumAuditProps {
  data: any;
}

export const CurriculumAudit: React.FC<CurriculumAuditProps> = ({ data }) => {
  const isComplete = data.last_page_analysed;

  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm space-y-5 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <ShieldCheck className="text-indigo-600 w-5 h-5" />
          Curriculum Audit Report
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {isComplete ? 'VERIFIED' : 'UNVERIFIED'}
        </span>
      </div>
      
      {!isComplete && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            <strong>Warning: Last Page Not Detected.</strong> The system could not confirm that the final page of the curriculum was parsed. 
            Important exception rules or final credit summaries may be missing. Please verify manually.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg border">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Pages Analysed</p>
          <p className="text-2xl font-bold text-slate-800">{data.pages_analysed}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Target Credits</p>
          <p className="text-2xl font-bold text-indigo-600">{data.total_required_credits}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Categories Detected ({data.categories?.length || 0})</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {data.categories?.map((cat: any, i: number) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 border rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-slate-800">{cat.name}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 mr-2">Req. Credits:</span>
                <span className="font-bold text-indigo-600">{cat.required_credits}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

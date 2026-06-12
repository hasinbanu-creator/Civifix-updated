"use client";

import { useParams, useRouter } from "next/navigation";
import { useComplaint } from "@/hooks/use-complaints";
import {
  ArrowLeft,
  Activity,
  Check,
  X,
  ArrowRight,
  Clock,
  AlertCircle
} from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string, bg: string, border: string, label: string }> = {
  PENDING:     { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Pending" },
  OPEN:        { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "Open" },
  ASSIGNED:    { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", label: "Assigned" },
  WORKING:     { color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", label: "In Progress" },
  CLOSED:      { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Resolved" },
  REJECTED:    { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Rejected" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status.toUpperCase()] || STATUS_CONFIG.PENDING;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${cfg.border} ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function StatusTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data, isLoading: loading } = useComplaint(id);
  const complaint: any = data;

  // Default to empty array if no history
  const history = complaint?.history || [];


  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-slate-400">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-20 md:pb-8">
      
      {/* Header */}
      <div className="bg-blue-600 pt-8 pb-12 px-6 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Status Tracking</h1>
          <p className="text-white/80 font-medium text-xs mt-0.5">Timeline & Progress</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 min-h-[60vh]">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">Activity Timeline</h2>
              <p className="text-xs font-semibold text-slate-500">Updates will appear here as your complaint progresses.</p>
            </div>
          </div>

          {history.length > 0 ? (
            <div className="space-y-0 pb-4">
              {history.map((item: any, idx: number) => {
                const isLast = idx === history.length - 1;
                const isPositive = !["rejected", "closed"].includes((item.new_status || "").toLowerCase());
                const dotColorClass = isPositive ? "bg-emerald-500" : "bg-red-500";
                
                return (
                  <div key={item._id} className="flex gap-4">
                    {/* Timeline Line & Dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full ${dotColorClass} flex items-center justify-center shadow-lg shadow-slate-200 shrink-0 z-10`}>
                        {isPositive ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <X className="w-4 h-4 text-white" />
                        )}
                      </div>
                      {!isLast && (
                        <div className="w-1 bg-slate-100 flex-1 my-1 rounded-full"></div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className={`flex-1 pb-8 ${isLast ? '' : ''}`}>
                      <h3 className="text-base font-extrabold text-slate-800 mb-2">
                        {item.action || "Status updated"}
                      </h3>
                      
                      {(item.old_status || item.new_status) && (
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {item.old_status && <StatusBadge status={item.old_status} />}
                          {item.old_status && item.new_status && (
                            <ArrowRight className="w-4 h-4 text-slate-300" />
                          )}
                          {item.new_status && <StatusBadge status={item.new_status} />}
                        </div>
                      )}
                      
                      {item.remarks && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3">
                          <p className="text-sm font-medium text-slate-600 leading-relaxed">
                            {item.remarks}
                          </p>
                        </div>
                      )}
                      
                      {item.created_at && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(item.created_at).toLocaleDateString("en-IN", { 
                            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Activity className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-sm font-bold text-slate-500">No activity yet</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

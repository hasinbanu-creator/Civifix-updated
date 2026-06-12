"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useComplaints, useWardComplaints, useAssignedComplaints } from "@/hooks/use-complaints";
import {
  Search,
  Plus,
  ClipboardList,
  Clock,
  FolderOpen,
  Wrench,
  CheckCircle2,
  XCircle,
  Map,
  Activity,
  TreePine,
  AlertCircle,
  ChevronRight,
  Filter,
  Trash2,
  Lightbulb
} from "lucide-react";

// --- Types ---
type ComplaintStatus = "OPEN" | "WORKING" | "APPROVAL" | "CLOSED" | "REJECTED";
type ComplaintType = "ROAD_DAMAGE" | "POTHOLE" | "GARBAGE" | "STREETLIGHT" | "WATER_SUPPLY" | "DRAINAGE" | "SANITATION" | "TREE_CUTTING" | "CONSTRUCTION" | "OTHER";

// --- Design Tokens ---
const FILTERS = [
  { key: "ALL",         label: "All",         icon: ClipboardList },
  { key: "OPEN",        label: "Pending",      icon: FolderOpen },
  { key: "WORKING",     label: "In Progress",  icon: Wrench },
  { key: "APPROVAL",    label: "For Review",   icon: Clock },
  { key: "CLOSED",      label: "Resolved",     icon: CheckCircle2 },
];

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:     { label: "Pending",     color: "text-blue-600", bg: "bg-blue-100" },
  WORKING:  { label: "In Progress", color: "text-amber-600",  bg: "bg-amber-100" },
  APPROVAL: { label: "Review",      color: "text-cyan-600",  bg: "bg-cyan-100" },
  CLOSED:   { label: "Resolved",    color: "text-emerald-600", bg: "bg-emerald-100" },
  REJECTED: { label: "Rejected",    color: "text-red-600",   bg: "bg-red-100" },
};

const TYPE_META: Record<string, { icon: React.ElementType; color: string; bg: string; title: string }> = {
  ROAD_DAMAGE:  { icon: Map, color: "text-red-600", bg: "bg-red-50", title: "Road Damage" },
  POTHOLE:      { icon: Map, color: "text-red-600", bg: "bg-red-50", title: "Pothole" },
  GARBAGE:      { icon: Trash2, color: "text-cyan-600", bg: "bg-cyan-50", title: "Waste Collection" },
  STREETLIGHT:  { icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-50", title: "Street Light" },
  WATER_SUPPLY: { icon: Activity, color: "text-blue-600", bg: "bg-blue-50", title: "Water Supply" },
  DRAINAGE:     { icon: Wrench, color: "text-cyan-600", bg: "bg-cyan-50", title: "Drainage" },
  SANITATION:   { icon: ClipboardList, color: "text-emerald-600", bg: "bg-emerald-50", title: "Sanitation" },
  TREE_CUTTING: { icon: TreePine, color: "text-emerald-600", bg: "bg-emerald-50", title: "Tree Issue" },
  CONSTRUCTION: { icon: Wrench, color: "text-amber-600", bg: "bg-amber-50", title: "Construction" },
  OTHER:        { icon: AlertCircle, color: "text-slate-600", bg: "bg-slate-50", title: "Civic Issue" },
};

export default function ComplaintsListPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const role = user?.role || "CITIZEN";

  const isCitizen = role === "CITIZEN";
  const isInspector = role === "INSPECTOR";
  const isWorker = role === "WORKER";
  
  const queryParams = { limit: 50, ...(activeFilter !== "ALL" ? { status: activeFilter } : {}) };

  const citizenQuery = useComplaints(queryParams, { enabled: isCitizen || role === "SUPER_ADMIN" || role === "DISTRICT_ADMIN" });
  const inspectorQuery = useWardComplaints(queryParams, { enabled: isInspector });
  const workerQuery = useAssignedComplaints(queryParams, { enabled: isWorker });

  const activeQuery = isInspector ? inspectorQuery : isWorker ? workerQuery : citizenQuery;
  const loading = activeQuery.isLoading;
  const data: any = activeQuery.data;
  const complaints = data?.data || [];

  const filteredComplaints = complaints;

  const counts = useMemo(() => {
    const acc: Record<string, number> = {};
    complaints.forEach((c: any) => {
      const s = c.status || "OPEN";
      acc[s] = (acc[s] || 0) + 1;
    });
    return acc;
  }, [complaints]);

  const summaryChips = [
    { label: "Total", value: complaints.length, colorClass: "text-blue-600" },
    { label: "Active", value: (counts.OPEN || 0) + (counts.WORKING || 0) + (counts.APPROVAL || 0), colorClass: "text-cyan-600" },
    { label: "Resolved", value: counts.CLOSED || 0, colorClass: "text-emerald-600" },
    { label: "Rejected", value: counts.REJECTED || 0, colorClass: "text-red-600" },
  ];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-20 md:pb-8">
      
      {/* Header */}
      <div className="bg-blue-600 pt-8 pb-6 px-6 flex items-center justify-between sticky top-0 z-10 md:static">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Complaints</h1>
          <p className="text-white/80 font-medium mt-1">Track your civic issues</p>
        </div>
        <Link 
          href="/complaints/create"
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <Plus className="w-5 h-5 text-white" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        
        {/* Summary Chips */}
        {!loading && complaints.length > 0 && (
          <div className="mx-6 mt-6 bg-white rounded-2xl flex shadow-lg shadow-slate-200/50 py-3 divide-x divide-slate-100">
            {summaryChips.map(chip => (
              <div key={chip.label} className="flex-1 flex flex-col items-center justify-center">
                <span className={`text-xl font-black ${chip.colorClass}`}>{chip.value}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{chip.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && complaints.length > 0 && (
          <div className="mt-6 px-6 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 pb-2">
              {FILTERS.map(f => {
                const isSelected = activeFilter === f.key;
                const count = f.key === "ALL" ? complaints.length : (counts[f.key] || 0);
                const Icon = f.icon;
                
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border-2 ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
                      {f.label}
                    </span>
                    {count > 0 && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-blue-600/10 text-blue-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Result Count */}
        {!loading && complaints.length > 0 && (
          <div className="px-6 mt-4 mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {filteredComplaints.length} {activeFilter === "ALL" ? "total" : activeFilter.toLowerCase().replace("_", " ")} complaints
            </p>
          </div>
        )}

        {/* Complaint List */}
        <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 mt-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-400 mt-4">Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-2">No complaints yet</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">Raise your first civic issue and follow its status right here.</p>
              <Link 
                href="/complaints/create"
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
              >
                <Plus className="w-5 h-5" />
                Raise a Complaint
              </Link>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Filter className="w-10 h-10 text-slate-300 mb-4" />
              <p className="text-sm font-bold text-slate-500">No {activeFilter.toLowerCase().replace("_", " ")} complaints found.</p>
              <button 
                onClick={() => setActiveFilter("ALL")}
                className="text-blue-600 font-extrabold text-sm mt-2"
              >
                Show all
              </button>
            </div>
          ) : (
            filteredComplaints.map((complaint: any) => {
              const type = complaint.complaint_type || "OTHER";
              const meta = TYPE_META[type] || TYPE_META.OTHER;
              const status = STATUS_STYLES[complaint.status as string] || STATUS_STYLES.OPEN;
              const IconType = meta.icon;

              return (
                <Link
                  key={complaint._id}
                  href={`/complaints/${complaint._id || complaint.complaint_id}`}
                  className="block bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-all border border-slate-100 group relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
                      <IconType className={`w-6 h-6 ${meta.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-extrabold text-slate-800 truncate mb-1">
                          {complaint.title || meta.title}
                        </h4>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      {isInspector || isWorker ? (
                        <div className="mb-3 space-y-1">
                          <p className="text-sm font-semibold text-slate-600 line-clamp-1">{complaint.address || complaint.description}</p>
                          {complaint.ward?.ward_name && (
                            <p className="text-xs font-bold text-slate-500">Ward: {complaint.ward.ward_name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-500">
                              {complaint.citizen?.name || "Citizen"}
                            </span>
                            {complaint.citizen?.phone && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-xs font-semibold text-slate-400">{complaint.citizen.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-slate-500 line-clamp-2 mb-3">
                          {complaint.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                            {complaint.complaint_id || complaint._id}
                          </span>
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </span>
                          {complaint.priority && (isInspector || isWorker) && (
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${complaint.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                              {complaint.priority}
                            </span>
                          )}
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Floating Action Button (Mobile mostly) */}
        {!loading && complaints.length > 0 && (
          <Link
            href="/complaints/create"
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/40 text-white z-20 hover:scale-105 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </Link>
        )}

      </div>
    </div>
  );
}

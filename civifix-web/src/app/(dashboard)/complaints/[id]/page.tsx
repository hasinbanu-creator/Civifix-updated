"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useComplaint } from "@/hooks/use-complaints";
import {
  ArrowLeft,
  AlertCircle,
  Map,
  ClipboardList,
  Wrench,
  TreePine,
  Activity,
  Lightbulb,
  CheckCircle2,
  Clock,
  FolderOpen,
  XCircle,
  Info,
  MapPin,
  Navigation,
  FileText,
  User,
  ShieldCheck,
  HardHat,
  ChevronRight,
  Phone,
  Mail,
  Check,
  PenSquare,
  Play,
  X,
  History,
  MoreVertical
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { complaintsApi } from "@/services/api";

const STATUS_CONFIG: Record<string, { color: string, bg: string, border: string, icon: any, label: string }> = {
  PENDING:     { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: Clock, label: "Pending" },
  OPEN:        { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: FolderOpen, label: "Open" },
  ASSIGNED:    { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", icon: HardHat, label: "Assigned" },
  WORKING:     { color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", icon: Wrench, label: "In Progress" },
  CLOSED:      { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2, label: "Resolved" },
  REJECTED:    { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: XCircle, label: "Rejected" },
};

const PRIORITY_CONFIG: Record<string, { color: string, bg: string, label: string }> = {
  LOW:      { color: "text-emerald-600", bg: "bg-emerald-100", label: "Low" },
  MEDIUM:   { color: "text-amber-600", bg: "bg-amber-100", label: "Medium" },
  HIGH:     { color: "text-red-600", bg: "bg-red-100", label: "High" },
  CRITICAL: { color: "text-red-900", bg: "bg-red-200", label: "Critical" },
};

const TYPE_META: Record<string, { icon: any, color: string, bg: string, title: string }> = {
  ROAD_DAMAGE:  { icon: Map, color: "text-red-600", bg: "bg-red-100", title: "Road Damage" },
  GARBAGE:      { icon: ClipboardList, color: "text-cyan-600", bg: "bg-cyan-100", title: "Waste Collection" },
  POTHOLE:      { icon: Map, color: "text-red-600", bg: "bg-red-100", title: "Pothole" },
  STREETLIGHT:  { icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-100", title: "Street Light" },
  WATER_SUPPLY: { icon: Activity, color: "text-blue-600", bg: "bg-blue-100", title: "Water Supply" },
  DRAINAGE:     { icon: Wrench, color: "text-cyan-600", bg: "bg-cyan-100", title: "Drainage Issue" },
  SANITATION:   { icon: ClipboardList, color: "text-emerald-600", bg: "bg-emerald-100", title: "Sanitation" },
  TREE_CUTTING: { icon: TreePine, color: "text-emerald-600", bg: "bg-emerald-100", title: "Tree Issue" },
  CONSTRUCTION: { icon: Wrench, color: "text-amber-600", bg: "bg-amber-100", title: "Construction Block" },
  OTHER:        { icon: AlertCircle, color: "text-slate-600", bg: "bg-slate-100", title: "Civic Issue" },
};

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 mb-4">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-1">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-800 leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

function NoteCard({ icon: Icon, label, value, colorClass, borderClass, bgClass }: any) {
  if (!value) return null;
  return (
    <div className={`border-l-4 ${borderClass} bg-slate-50 rounded-xl p-4 mb-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <span className={`text-xs font-bold ${colorClass}`}>{label}</span>
      </div>
      <p className="text-sm font-medium text-slate-600 leading-relaxed">{value}</p>
    </div>
  );
}

export default function ComplaintDetailsPage() {
  const { user } = useAuth();
  const isPrivileged = user?.role === "INSPECTOR" || user?.role === "WORKER" || user?.role === "SUPER_ADMIN" || user?.role === "DISTRICT_ADMIN";
  const isInspectorOrWorker = user?.role === "INSPECTOR" || user?.role === "WORKER";
  
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data, isLoading: loading, refetch } = useComplaint(id);
  const complaint: any = data;

  const [updating, setUpdating] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [newNote, setNewNote] = useState("");

  const updateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      await complaintsApi.updateStatus(id, newStatus);
      refetch();
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    try {
      setUpdating(true);
      await complaintsApi.addNote(id, { text: newNote });
      setNewNote("");
      setShowNotesModal(false);
      refetch();
    } catch (e) {
      console.error(e);
      alert("Failed to add note");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-slate-400">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Complaint Not Found</h2>
          <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline">Go Back</button>
        </div>
      </div>
    );
  }

  const typeMeta = TYPE_META[complaint.complaint_type] || TYPE_META.OTHER;
  const statusCfg = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.PENDING;
  const priorityCfg = PRIORITY_CONFIG[complaint.priority] || PRIORITY_CONFIG.MEDIUM;
  const StatusIcon = statusCfg.icon;
  const TypeIcon = typeMeta.icon;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-20 md:pb-8">
      
      {/* Header */}
      <div className="bg-blue-600 pt-8 pb-12 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Complaint Details</h1>
            <p className="text-white/80 font-medium text-xs mt-0.5">{complaint.complaint_id}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusCfg.bg} border-2 border-white/50`}></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* Hero Card */}
        <div className={`bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 mb-6 border-t-4 ${statusCfg.border}`}>
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl ${typeMeta.bg} flex items-center justify-center shrink-0`}>
              <TypeIcon className={`w-7 h-7 ${typeMeta.color}`} />
            </div>
            <div className="flex-1 mt-1">
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-1">
                {complaint.title || typeMeta.title}
              </h2>
              <p className="text-xs font-bold text-slate-400 tracking-widest">{complaint.complaint_id}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusCfg.border} ${statusCfg.bg}`}>
              <StatusIcon className={`w-4 h-4 ${statusCfg.color}`} />
              <span className={`text-xs font-bold ${statusCfg.color}`}>{statusCfg.label}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${priorityCfg.bg}`}>
              <AlertCircle className={`w-4 h-4 ${priorityCfg.color}`} />
              <span className={`text-xs font-bold ${priorityCfg.color}`}>{priorityCfg.label} Priority</span>
            </div>
            <div className="ml-auto text-xs font-bold text-slate-400">
              {new Date(complaint.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">Complaint Info</h3>
          </div>

          <InfoRow icon={FileText} label="Description" value={complaint.description} />
          <InfoRow icon={MapPin} label="Address" value={complaint.address} />
          <InfoRow 
            icon={Navigation} 
            label="Coordinates" 
            value={complaint.latitude && complaint.longitude ? `${complaint.latitude}, ${complaint.longitude}` : null} 
          />

          {(complaint.citizen_note || complaint.worker_note || complaint.inspector_note || complaint.rejection_reason) && (
            <>
              <div className="h-px bg-slate-100 my-6"></div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">Notes</h3>
              </div>
              
              <NoteCard 
                icon={User} 
                label="Citizen Note" 
                value={complaint.citizen_note} 
                colorClass="text-blue-600" 
                borderClass="border-blue-500" 
              />
              <NoteCard 
                icon={HardHat} 
                label="Worker Note" 
                value={complaint.worker_note} 
                colorClass="text-purple-600" 
                borderClass="border-purple-500" 
              />
              <NoteCard 
                icon={ShieldCheck} 
                label="Inspector Note" 
                value={complaint.inspector_note} 
                colorClass="text-cyan-600" 
                borderClass="border-cyan-500" 
              />
              <NoteCard 
                icon={XCircle} 
                label="Rejection Reason" 
                value={complaint.rejection_reason} 
                colorClass="text-red-600" 
                borderClass="border-red-500" 
              />
            </>
          )}
        </div>

        {/* Citizen Information */}
        {isPrivileged && complaint.citizen && (
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">Citizen Information</h3>
            </div>
            <InfoRow icon={User} label="Name" value={complaint.citizen.name} />
            <InfoRow icon={Phone} label="Phone" value={complaint.citizen.phone} />
            <InfoRow icon={Mail} label="Email" value={complaint.citizen.email} />
          </div>
        )}

        {/* Activity Timeline */}
        {isPrivileged && complaint.history && complaint.history.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <History className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">Activity Timeline</h3>
            </div>
            <div className="relative pl-6 border-l-2 border-slate-100 ml-4 pb-2">
              {complaint.history.map((h: any, i: number) => {
                const s = STATUS_CONFIG[h.status] || STATUS_CONFIG.PENDING;
                return (
                  <div key={i} className="mb-6 relative">
                    <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white ${s.bg.replace('bg-', 'bg-').replace('50', '400')}`}></div>
                    <p className="text-xs font-bold text-slate-800">{s.label}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                      {new Date(h.timestamp || h.created_at).toLocaleString()}
                    </p>
                    {h.remarks && (
                      <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">{h.remarks}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Actions */}
        {isInspectorOrWorker && complaint.status !== "CLOSED" && (
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <MoreVertical className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">Update Status</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {complaint.status === "OPEN" && (
                <button disabled={updating} onClick={() => updateStatus("WORKING")} className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3 text-sm font-bold shadow-md hover:bg-blue-700 disabled:opacity-50">
                  <Play className="w-4 h-4" /> Start Work
                </button>
              )}
              {complaint.status === "WORKING" && (
                <button disabled={updating} onClick={() => updateStatus("APPROVAL")} className="flex items-center justify-center gap-2 bg-cyan-600 text-white rounded-xl py-3 text-sm font-bold shadow-md hover:bg-cyan-700 disabled:opacity-50">
                  <Clock className="w-4 h-4" /> Move to Review
                </button>
              )}
              {complaint.status === "APPROVAL" && user?.role === "INSPECTOR" && (
                <button disabled={updating} onClick={() => updateStatus("CLOSED")} className="flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold shadow-md hover:bg-emerald-700 disabled:opacity-50">
                  <Check className="w-4 h-4" /> Mark Resolved
                </button>
              )}
            </div>
            <button onClick={() => setShowNotesModal(true)} className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 rounded-xl py-3 text-sm font-bold hover:bg-slate-200">
              <PenSquare className="w-4 h-4" /> Add Note
            </button>
          </div>
        )}

        {/* Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-black text-slate-800 mb-4">Add Note</h3>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-semibold text-slate-700 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Type your observations..."
              />
              <div className="flex gap-3">
                <button onClick={() => setShowNotesModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200">Cancel</button>
                <button disabled={updating || !newNote} onClick={addNote} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50">Save Note</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

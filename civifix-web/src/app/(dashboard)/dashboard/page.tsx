"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { 
  FlaskConical, 
  Search, 
  MapPin, 
  Bell, 
  ChevronRight,
  ClipboardList,
  AlertCircle,
  Activity,
  CheckCircle2,
  Clock,
  Wrench,
  Eye,
  Settings,
  Users,
  Map,
  ShieldCheck,
  Building2,
  FileText
} from "lucide-react";

// --- Types ---
type ComplaintStatus = "OPEN" | "WORKING" | "APPROVAL" | "CLOSED" | "REJECTED";
type ComplaintType = "ROAD_DAMAGE" | "POTHOLE" | "GARBAGE" | "STREETLIGHT" | "WATER_SUPPLY" | "DRAINAGE" | "SANITATION" | "TREE_CUTTING" | "CONSTRUCTION" | "OTHER";

// Mock Data / Styles
const STATUS_STYLES: Record<ComplaintStatus, { label: string; color: string; bg: string }> = {
  OPEN:     { label: "Pending",     color: "text-amber-600", bg: "bg-amber-100" },
  WORKING:  { label: "In Progress", color: "text-blue-600",  bg: "bg-blue-100" },
  APPROVAL: { label: "Review",      color: "text-cyan-600",  bg: "bg-cyan-100" },
  CLOSED:   { label: "Resolved",    color: "text-emerald-600", bg: "bg-emerald-100" },
  REJECTED: { label: "Rejected",    color: "text-red-600",   bg: "bg-red-100" },
};

const TYPE_META: Record<ComplaintType, { icon: React.ElementType; color: string; bg: string; title: string }> = {
  ROAD_DAMAGE:  { icon: Map, color: "text-red-600", bg: "bg-red-50", title: "Road Damage" },
  POTHOLE:      { icon: Map, color: "text-red-600", bg: "bg-red-50", title: "Pothole" },
  GARBAGE:      { icon: ClipboardList, color: "text-cyan-600", bg: "bg-cyan-50", title: "Waste Collection" },
  STREETLIGHT:  { icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50", title: "Street Light" },
  WATER_SUPPLY: { icon: Activity, color: "text-blue-600", bg: "bg-blue-50", title: "Water Supply" },
  DRAINAGE:     { icon: Wrench, color: "text-cyan-600", bg: "bg-cyan-50", title: "Drainage" },
  SANITATION:   { icon: ClipboardList, color: "text-cyan-600", bg: "bg-cyan-50", title: "Sanitation" },
  TREE_CUTTING: { icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50", title: "Tree Issue" },
  CONSTRUCTION: { icon: Wrench, color: "text-amber-600", bg: "bg-amber-50", title: "Construction" },
  OTHER:        { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", title: "Civic Issue" },
};

const ROLE_META: Record<string, { label: string; color: string; bg: string; gradient: string }> = {
  SUPER_ADMIN:    { label: "Super Admin",    color: "text-blue-600", bg: "bg-blue-100", gradient: "from-blue-700 to-slate-900" },
  DISTRICT_ADMIN: { label: "District Admin", color: "text-purple-600", bg: "bg-purple-100", gradient: "from-purple-800 to-indigo-900" },
  INSPECTOR:      { label: "Inspector",      color: "text-cyan-600", bg: "bg-cyan-100", gradient: "from-cyan-700 to-slate-800" },
  WORKER:         { label: "Worker",         color: "text-emerald-600", bg: "bg-emerald-100", gradient: "from-emerald-800 to-slate-900" },
  CITIZEN:        { label: "Citizen",        color: "text-amber-600", bg: "bg-amber-100", gradient: "from-blue-700 to-slate-900" },
};

const ROLE_GREETING: Record<string, { title: string; sub: string }> = {
  SUPER_ADMIN:    { title: "Civifix", sub: "Super Admin Panel" },
  DISTRICT_ADMIN: { title: "Civifix", sub: "District Admin Panel" },
  INSPECTOR:      { title: "Civifix", sub: "Inspector Dashboard" },
  WORKER:         { title: "Civifix", sub: "Worker Dashboard" },
  CITIZEN:        { title: "Civifix", sub: "Citizen Platform" },
};

// --- Shared Components ---
function SectionTitle({ left, right, rightHref }: { left: string; right?: string; rightHref?: string }) {
  return (
    <div className="flex justify-between items-center mt-8 mb-4">
      <h3 className="text-sm font-extrabold text-slate-800">{left}</h3>
      {right && rightHref && (
        <Link href={rightHref} className="text-xs font-extrabold text-blue-600 hover:text-blue-700">
          {right}
        </Link>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, value, label, colorClass, bgClass }: any) {
  return (
    <div className="flex-1 bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg shadow-slate-200/50 min-h-[100px]">
      <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center mb-2`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <p className="text-xl font-black text-slate-800">{value}</p>
      <p className="text-[10px] font-bold text-slate-500 text-center mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ComplaintItem({ complaint, index, total }: any) {
  const { user } = useAuth();
  const isInspector = user?.role === "INSPECTOR" || user?.role === "WORKER";
  
  const type = (complaint.complaint_type as ComplaintType) || "OTHER";
  const meta = TYPE_META[type] || TYPE_META.OTHER;
  const status = STATUS_STYLES[complaint.status as ComplaintStatus] || STATUS_STYLES.OPEN;
  const title = complaint.title || complaint.type || meta.title;
  const desc = complaint.description || "No description provided";
  const Icon = meta.icon;

  return (
    <Link 
      href={`/complaints/${complaint._id || complaint.complaint_id}`}
      className={`flex items-start p-4 hover:bg-slate-50 transition-colors ${index !== total - 1 ? 'border-b border-slate-100' : ''}`}
    >
      <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center mr-4 shrink-0 mt-1`}>
        <Icon className={`w-5 h-5 ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0 mr-4">
        <h4 className="text-sm font-extrabold text-slate-800 truncate">{title}</h4>
        
        {isInspector ? (
          <div className="mt-1 space-y-1">
            <p className="text-xs font-semibold text-slate-600 truncate">{complaint.address || desc}</p>
            {complaint.ward?.ward_name && (
              <p className="text-[10px] font-bold text-slate-500">Ward: {complaint.ward.ward_name}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                {complaint.complaint_id || complaint._id || "#CIV-NEW"}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-[10px] font-bold text-slate-500">
                {complaint.citizen?.name || "Citizen"}
              </span>
            </div>
            {complaint.created_at && (
              <p className="text-[10px] font-semibold text-slate-400 mt-1">
                {new Date(complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">{desc}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              {complaint.complaint_id || complaint._id || "#CIV-NEW"}
            </p>
          </>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${status.bg} ${status.color}`}>
          {status.label}
        </span>
        {complaint.priority && isInspector && (
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${complaint.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            {complaint.priority}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-slate-400 mt-auto" />
      </div>
    </Link>
  );
}


function QuickActionBtn({ icon: Icon, title, colorClass, bgClass, href }: any) {
  return (
    <Link 
      href={href}
      className="flex-1 min-h-[90px] rounded-2xl bg-white flex flex-col items-center justify-center p-2 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform"
    >
      <div className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center mb-2`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <p className="text-[10px] leading-snug font-extrabold text-slate-800 text-center whitespace-pre-line">
        {title}
      </p>
    </Link>
  );
}

import { useComplaints } from "@/hooks/use-complaints";
import { useInspectorDashboard, useAdminDashboard } from "@/hooks/use-dashboard";

// --- Dashboards ---

function CitizenDashboard() {
  const { data: rawData, isLoading: loading } = useComplaints({ page: 1, limit: 10 });
  const data: any = rawData;
  const complaints = data?.data || [];

  const counts = useMemo(() => {
    if (data?.meta?.status_counts) {
      return {
        open: data.meta.status_counts.OPEN || 0,
        active: (data.meta.status_counts.WORKING || 0) + (data.meta.status_counts.APPROVAL || 0),
        closed: data.meta.status_counts.CLOSED || 0,
      };
    }
    return {
      open: complaints.filter((c: any) => c.status === "OPEN").length,
      active: complaints.filter((c: any) => ["WORKING", "APPROVAL"].includes(c.status)).length,
      closed: complaints.filter((c: any) => c.status === "CLOSED").length,
    };
  }, [complaints, data]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Stats Row */}
      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 mb-8 mt-[-3rem] relative z-10 mx-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center border-r border-slate-100">
            <p className="text-2xl font-black text-slate-800">{counts.open}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Pending</p>
          </div>
          <div className="flex-1 text-center border-r border-slate-100">
            <p className="text-2xl font-black text-slate-800">{counts.active}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-black text-slate-800">{counts.closed}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Resolved</p>
          </div>
        </div>
      </div>

      <div className="px-6">
        <SectionTitle left="Quick Actions" />
        <div className="flex gap-3">
          <QuickActionBtn icon={FlaskConical} title="Raise\nComplaint" colorClass="text-purple-600" bgClass="bg-purple-100" href="/complaints/create" />
          <QuickActionBtn icon={Search} title="Track\nStatus" colorClass="text-blue-600" bgClass="bg-blue-100" href="/complaints" />
          <QuickActionBtn icon={MapPin} title="Nearby\nOffices" colorClass="text-blue-600" bgClass="bg-blue-100" href="#" />
          <QuickActionBtn icon={Bell} title="Notifs" colorClass="text-slate-600" bgClass="bg-slate-100" href="/profile" />
        </div>

        <SectionTitle left="My Complaints" right="View All" rightHref="/complaints" />
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">No data available</p>
            </div>
          ) : (
            complaints.map((c: any, i: number) => (
              <ComplaintItem key={c._id || c.id} complaint={c} index={i} total={complaints.length} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function InspectorDashboard() {
  const { data, isLoading } = useInspectorDashboard();

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">No data available</p>
      </div>
    );
  }

  const complaints = data.recent_complaints || [];
  const stats = data.stats || {};

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Stats Row (Inspector specific) */}
      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 mb-8 mt-[-3rem] relative z-10 mx-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center border-r border-slate-100">
            <p className="text-2xl font-black text-slate-800">{stats.total_complaints || 0}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total</p>
          </div>
          <div className="flex-1 text-center border-r border-slate-100">
            <p className="text-2xl font-black text-slate-800">{stats.pending || 0}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Pending</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-black text-slate-800">{stats.resolved_complaints || stats.resolved || 0}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Resolved</p>
          </div>
        </div>
      </div>

      <div className="px-6">
        {data.ward_info && (
          <div className="mb-6 bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
            <h3 className="text-sm font-extrabold text-slate-800 mb-2">{data.ward_info.ward_name}</h3>
            <p className="text-xs font-semibold text-slate-500">Ward Number: <span className="font-bold text-slate-800">#{data.ward_info.ward_number}</span></p>
          </div>
        )}

        <SectionTitle left="Complaint Overview" />
        <div className="grid grid-cols-2 gap-4 mb-8">
          <MetricCard icon={AlertCircle} value={stats.pending || 0} label="Pending" colorClass="text-amber-600" bgClass="bg-amber-100" />
          <MetricCard icon={Wrench} value={stats.in_progress || 0} label="In Progress" colorClass="text-blue-600" bgClass="bg-blue-100" />
          <MetricCard icon={Eye} value={data.pending_approvals || stats.for_review || 0} label="For Review" colorClass="text-cyan-600" bgClass="bg-cyan-100" />
          <MetricCard icon={CheckCircle2} value={stats.resolved_complaints || stats.resolved || 0} label="Resolved" colorClass="text-emerald-600" bgClass="bg-emerald-100" />
        </div>

        <SectionTitle left="Recent Complaints" right="View All" rightHref="/complaints" />
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
          {complaints.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">No complaints in your ward.</p>
            </div>
          ) : (
            complaints.map((c: any, i: number) => (
              <ComplaintItem key={c._id || c.id} complaint={c} index={i} total={complaints.length} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-6">
      <SectionTitle left="District Overview" />
      <div className="grid grid-cols-2 gap-4 mb-8">
        <MetricCard icon={Map} value={data.stats?.total_wards || 0} label="Wards" colorClass="text-purple-600" bgClass="bg-purple-100" />
        <MetricCard icon={Users} value={data.stats?.total_inspectors || 0} label="Inspectors" colorClass="text-blue-600" bgClass="bg-blue-100" />
        <MetricCard icon={FileText} value={data.stats?.total_complaints || 0} label="Complaints" colorClass="text-amber-600" bgClass="bg-amber-100" />
        <MetricCard icon={CheckCircle2} value={data.stats?.resolved_complaints || 0} label="Resolved" colorClass="text-emerald-600" bgClass="bg-emerald-100" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || "CITIZEN";
  const roleMeta = ROLE_META[role] || ROLE_META.CITIZEN;
  const greeting = ROLE_GREETING[role] || ROLE_GREETING.CITIZEN;

  return (
    <div className="flex-1 bg-slate-50 relative pb-20 md:pb-8">
      {/* Dynamic Header Gradient */}
      <div className={`bg-gradient-to-br ${roleMeta.gradient} pt-8 pb-20 px-6 rounded-b-[40px]`}>
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">{greeting.title}</h1>
              <p className="text-xs font-semibold text-white/80">{greeting.sub}</p>
            </div>
          </div>
          <Link href="/profile" className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </Link>
        </div>

        {/* User Greeting (Desktop mostly, mobile handled by layout) */}
        <div className="mt-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
            <span className="text-xl font-black text-white">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">{user?.name || "Welcome Back"}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black ${roleMeta.bg} ${roleMeta.color}`}>
                {roleMeta.label}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* Role-based Dashboard Content */}
      <div className="max-w-7xl mx-auto w-full">
        {role === "CITIZEN" && <CitizenDashboard />}
        {(role === "INSPECTOR" || role === "WORKER") && <InspectorDashboard />}
        {(role === "SUPER_ADMIN" || role === "DISTRICT_ADMIN") && <AdminDashboard />}
      </div>
    </div>
  );
}

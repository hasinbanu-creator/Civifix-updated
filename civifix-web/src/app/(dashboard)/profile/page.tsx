"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useComplaints } from "@/hooks/use-complaints";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
  UserCog,
  Bell,
  Settings,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  ShieldAlert,
  HardHat,
  Map
} from "lucide-react";

const ROLE_META: Record<string, { label: string, color: string, bg: string, gradient: string }> = {
  SUPER_ADMIN:    { label: "Super Admin",     color: "text-blue-600",    bg: "bg-blue-100",    gradient: "from-blue-700 to-slate-900" },
  DISTRICT_ADMIN: { label: "District Admin",  color: "text-purple-600",  bg: "bg-purple-100",  gradient: "from-purple-800 to-indigo-950" },
  INSPECTOR:      { label: "Inspector",       color: "text-cyan-600",    bg: "bg-cyan-100",    gradient: "from-cyan-700 to-slate-900" },
  WORKER:         { label: "Worker",          color: "text-emerald-600", bg: "bg-emerald-100", gradient: "from-emerald-700 to-slate-900" },
  CITIZEN:        { label: "Citizen",         color: "text-amber-600",   bg: "bg-amber-100",   gradient: "from-blue-700 to-slate-900" },
};

function MenuItem({ icon: Icon, title, subtitle, colorClass, bgClass, danger, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center p-4 bg-white rounded-2xl mb-3 shadow-lg shadow-slate-200/50 hover:-translate-y-0.5 transition-all border ${danger ? 'border-red-100' : 'border-slate-50'}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mr-4 ${danger ? 'bg-red-50 text-red-500' : `${bgClass} ${colorClass}`}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 text-left">
        <h3 className={`text-sm font-bold ${danger ? 'text-red-500' : 'text-slate-800'}`}>{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>
      <ChevronRight className={`w-5 h-5 ${danger ? 'text-red-300' : 'text-slate-400'}`} />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] font-extrabold text-slate-400 tracking-widest uppercase mb-3 mt-6 px-2">
      {children}
    </h4>
  );
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const role = user?.role || "CITIZEN";
  const roleMeta = ROLE_META[role] || ROLE_META.CITIZEN;
  const displayName = user?.name || user?.full_name || "Welcome Back!";
  const displayEmail = user?.email || "";
  const displayPhone = user?.mobile_number || "";
  const district = user?.district || "";

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "?";
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      signOut();
      router.push("/login");
    }
  };

  // Stats
  const { data: rawComplaintsData } = useComplaints({ limit: 100 }, { enabled: role === "CITIZEN" });
  const complaintsData: any = rawComplaintsData;
  
  const stats = React.useMemo(() => {
    if (role !== "CITIZEN") {
      return [
        { value: "—", label: "Stat 1" },
        { value: "—", label: "Stat 2" },
        { value: "—", label: "Stat 3" },
      ];
    }
    
    if (complaintsData?.meta?.status_counts) {
      const counts = complaintsData.meta.status_counts;
      return [
        { value: complaintsData.meta.total_records?.toString() || "0", label: "Submitted" },
        { value: ((counts.WORKING || 0) + (counts.APPROVAL || 0)).toString(), label: "Active" },
        { value: (counts.CLOSED || 0).toString(), label: "Resolved" },
      ];
    }
    
    const complaints = complaintsData?.data || [];
    return [
      { value: complaints.length.toString(), label: "Submitted" },
      { value: complaints.filter((c: any) => ["WORKING", "APPROVAL"].includes(c.status)).length.toString(), label: "Active" },
      { value: complaints.filter((c: any) => c.status === "CLOSED").length.toString(), label: "Resolved" },
    ];
  }, [role, complaintsData]);

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-20 md:pb-8">
      
      {/* Hero Header Card */}
      <div className={`bg-gradient-to-br ${roleMeta.gradient} pt-12 pb-8 px-6 rounded-b-[2rem] shadow-2xl shadow-blue-900/20`}>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 max-w-3xl mx-auto">
          
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0 shadow-xl backdrop-blur-sm">
            <span className="text-3xl font-black text-white">{getInitials(displayName)}</span>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-black text-white mb-1">{displayName}</h1>
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-6 mt-3">
              {displayEmail && (
                <div className="flex items-center gap-2 text-white/80">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-sm font-medium">{displayEmail}</span>
                </div>
              )}
              {displayPhone && (
                <div className="flex items-center gap-2 text-white/80">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-sm font-medium">{displayPhone}</span>
                </div>
              )}
              {district && (
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-sm font-medium">{district}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white border border-white/10`}>
                {roleMeta.label}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="max-w-3xl mx-auto mt-8 bg-white/10 backdrop-blur-md rounded-2xl py-4 flex items-center justify-center divide-x divide-white/20 border border-white/10">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{stat.value}</span>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Role Specific Section */}
        {role === "CITIZEN" && (
          <>
            <SectionLabel>My Activity</SectionLabel>
            <MenuItem 
              icon={ClipboardList} 
              title="My Complaints" 
              subtitle="Track your submissions" 
              colorClass="text-blue-600" 
              bgClass="bg-blue-50" 
              onClick={() => router.push("/complaints")}
            />
          </>
        )}

        {/* Account Section */}
        <SectionLabel>Account</SectionLabel>
        <MenuItem 
          icon={UserCog} 
          title="Personal Information" 
          subtitle="Edit name, phone, address" 
          colorClass="text-blue-600" 
          bgClass="bg-blue-50" 
        />
        <MenuItem 
          icon={Bell} 
          title="Notifications" 
          subtitle="Manage your alerts" 
          colorClass="text-amber-600" 
          bgClass="bg-amber-50" 
        />
        <MenuItem 
          icon={Settings} 
          title="Settings" 
          subtitle="App preferences" 
          colorClass="text-slate-600" 
          bgClass="bg-slate-100" 
        />

        {/* Support Section */}
        <SectionLabel>Support</SectionLabel>
        <MenuItem 
          icon={HelpCircle} 
          title="Help & Support" 
          subtitle="FAQs, contact us" 
          colorClass="text-cyan-600" 
          bgClass="bg-cyan-50" 
        />
        <MenuItem 
          icon={Info} 
          title="About CiviFix" 
          subtitle="Version 1.0.0" 
          colorClass="text-blue-600" 
          bgClass="bg-blue-50" 
        />

        {/* Session Section */}
        <SectionLabel>Session</SectionLabel>
        <MenuItem 
          icon={LogOut} 
          title="Logout" 
          subtitle="You'll need to sign in again" 
          danger 
          onClick={handleLogout}
        />

        {/* Footer */}
        <div className="text-center mt-12 pb-6">
          <p className="text-xs font-bold text-slate-400">CiviFix Web v1.0.0</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-1">© 2026 CiviFix. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}

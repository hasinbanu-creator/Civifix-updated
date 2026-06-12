"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Building2,
  Map,
  Users
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const role = user?.role || "CITIZEN";

  // Define navigation based on role
  let navItems = [];
  if (role === "CITIZEN") {
    navItems = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Raise Complaint", href: "/complaints/create", icon: PlusCircle },
      { name: "My Complaints", href: "/complaints", icon: FileText },
      { name: "Profile", href: "/profile", icon: User },
    ];
  } else if (role === "INSPECTOR" || role === "WORKER") {
    navItems = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Complaints", href: "/complaints", icon: FileText },
      { name: "Profile", href: "/profile", icon: User },
    ];
  } else {
    // ADMIN roles
    navItems = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Complaints", href: "/complaints", icon: FileText },
      { name: "Wards", href: "/wards", icon: Map },
      { name: "Users", href: "/users", icon: Users },
      { name: "Profile", href: "/profile", icon: User },
    ];
  }

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-20">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
            <img src="/logo.png" alt="CiviFix" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 tracking-tight text-lg leading-tight">CiviFix</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-semibold text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER & MENU ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="CiviFix" className="w-full h-full object-cover" />
          </div>
          <h2 className="font-extrabold text-slate-800 tracking-tight">CiviFix</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-400">
            <Bell className="w-5 h-5" />
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-20 flex flex-col">
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all font-semibold text-base ${
                    isActive 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-4 w-full rounded-xl transition-all font-semibold text-base text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-6 h-6" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col relative">
        {children}
      </main>
    </div>
  );
}

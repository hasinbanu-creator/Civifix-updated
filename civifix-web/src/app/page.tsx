"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  Building2,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Activity,
  User,
  LogOut
} from "lucide-react";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="CiviFix" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                CiviFix
              </span>
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase block">
                Citizen Portal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link href="/complaints" className="hover:text-blue-600 transition-colors">My Complaints</Link>
            <Link href="/complaints/create" className="hover:text-blue-600 transition-colors">Raise Issue</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-bold"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline text-slate-700">{user.name}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 text-white py-20 sm:py-28">
        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full border-[60px] border-white/5 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full border-[40px] border-white/5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold tracking-wide text-blue-100 mb-6 uppercase">
              <Activity className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
              Empowering communities together
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6">
              India&apos;s #1 Civic <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                Issue Reporting Portal
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100/90 leading-relaxed mb-8 max-w-2xl font-medium">
              File complaints, track solutions, and coordinate with municipal officers to repair roads, fix streetlights, clean garbage, and rebuild your neighborhood.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/complaints/create"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-extrabold text-blue-700 bg-white hover:bg-blue-50 transition-all hover:shadow-xl hover:shadow-white/10 active:scale-95 text-center"
              >
                File a Complaint
                <ArrowRight className="w-5 h-5 text-blue-700" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all active:scale-95 text-center"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
            How CiviFix Helps Your City
          </h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Report issues in seconds, track actions, and coordinate with municipal officers to resolve public issues quickly and efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              title: "Report",
              desc: "Snap a photo, select the issue category (road damage, streetlights, garbage), choose the ward, and submit in seconds.",
              bg: "bg-blue-500/5",
              text: "text-blue-600",
              border: "border-blue-100"
            },
            {
              step: "02",
              title: "Assign",
              desc: "Municipal administrators inspect your report and automatically dispatch the designated inspector and field workers.",
              bg: "bg-purple-500/5",
              text: "text-purple-600",
              border: "border-purple-100"
            },
            {
              step: "03",
              title: "Resolve",
              desc: "Assigned field workers repair the issue, snap a resolution photo, and submit it for validation by the ward inspector.",
              bg: "bg-emerald-500/5",
              text: "text-emerald-600",
              border: "border-emerald-100"
            },
            {
              step: "04",
              title: "Track",
              desc: "Monitor progress in real-time through an interactive status timeline. Receive instant alerts on your portal.",
              bg: "bg-cyan-500/5",
              text: "text-cyan-600",
              border: "border-cyan-100"
            }
          ].map((item, i) => (
            <div
              key={i}
              className={`p-8 bg-white border ${item.border} rounded-[32px] hover:shadow-xl hover:shadow-slate-100 transition-all hover:-translate-y-1 duration-300 relative group`}
            >
              <span className={`inline-block px-4 py-1.5 rounded-full ${item.bg} ${item.text} text-xs font-black tracking-widest uppercase mb-6`}>
                Step {item.step}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors mb-3">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight block leading-tight">CiviFix</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Municipal Portal</span>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            © {new Date().getFullYear()} CiviFix India. All rights reserved. Secure government communication.
          </p>
          <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

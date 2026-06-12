"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import authService from "@/services/auth";
import { useWards } from "@/hooks/use-wards";
import { useCreateComplaint } from "@/hooks/use-complaints";
import {
  AlertCircle,
  Map,
  ClipboardList,
  Wrench,
  MapPin,
  Activity,
  Trash2,
  Lightbulb,
  TreePine,
  CheckCircle2,
  ChevronDown,
  Navigation,
  FileText,
  Send,
  X
} from "lucide-react";

const COMPLAINT_TYPES = [
  { value: "GARBAGE",      label: "Garbage / Waste",      icon: Trash2,    color: "text-cyan-600", bg: "bg-cyan-100" },
  { value: "ROAD_DAMAGE",  label: "Road Damage",          icon: Map,       color: "text-red-600",  bg: "bg-red-100" },
  { value: "POTHOLE",      label: "Pothole",              icon: Map,       color: "text-red-600",  bg: "bg-red-100" },
  { value: "STREETLIGHT",  label: "Street Light",         icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-100" },
  { value: "WATER_SUPPLY", label: "Water Supply",         icon: Activity,  color: "text-blue-600", bg: "bg-blue-100" },
  { value: "DRAINAGE",     label: "Drainage Issue",       icon: Wrench,    color: "text-cyan-600", bg: "bg-cyan-100" },
  { value: "SANITATION",   label: "Sanitation",           icon: ClipboardList, color: "text-emerald-600", bg: "bg-emerald-100" },
  { value: "TREE_CUTTING", label: "Tree / Fallen Branch", icon: TreePine,  color: "text-emerald-600", bg: "bg-emerald-100" },
  { value: "CONSTRUCTION", label: "Construction Block",   icon: Wrench,    color: "text-amber-600", bg: "bg-amber-100" },
  { value: "OTHER",        label: "Other Issue",          icon: AlertCircle, color: "text-slate-600", bg: "bg-slate-100" },
];

const PRIORITIES = [
  { value: "LOW",    label: "Low",    color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-500", icon: CheckCircle2 },
  { value: "MEDIUM", label: "Medium", color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-500", icon: AlertCircle },
  { value: "HIGH",   label: "High",   color: "text-red-600", bg: "bg-red-100", border: "border-red-500", icon: AlertCircle },
];

export default function CreateComplaintPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState({
    ward_id: "",
    complaint_type: "",
    description: "",
    latitude: "",
    longitude: "",
    address: "",
    citizen_note: "",
    priority: "MEDIUM",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState<any>(null);
  const { data: wardsData, isLoading: wardsLoading } = useWards(user?.district || user?.district_id);
  const wards = wardsData?.data || [];
  const createComplaint = useCreateComplaint();

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleGetLocation = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        updateField("latitude", lat);
        updateField("longitude", lon);
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          if (data && data.display_name) {
            updateField("address", data.display_name);
          }
        } catch (error) {
          console.error("Failed to reverse geocode:", error);
          // Fallback if nominatim fails
          updateField("address", `${lat}, ${lon}`);
        }
        setGpsLoading(false);
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location");
        setGpsLoading(false);
      }
    );
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.ward_id) next.ward_id = "Please select a ward";
    if (!form.complaint_type) next.complaint_type = "Please select a complaint type";
    if (form.description.trim().length < 10) next.description = "Description must be at least 10 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setServerError("");
    try {
      const result = await createComplaint.mutateAsync(form as any);
      setCreatedComplaint(result);
      setShowSuccess(true);
    } catch (err: any) {
      setServerError(err.message || "Unable to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess && createdComplaint) {
    const complaintId = createdComplaint.complaint_id || createdComplaint.id || "N/A";
    const status = createdComplaint.status || "OPEN";
    
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-emerald-500/10 border border-emerald-100">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Complaint Submitted!</h2>
          
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left border border-slate-100">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500">Complaint ID</span>
              <span className="text-sm font-extrabold text-slate-800">{complaintId}</span>
            </div>
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500">Status</span>
              <span className="text-xs font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">Est. Resolution</span>
              <span className="text-sm font-bold text-slate-800">48 hours</span>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Done
            </button>
            <button
              onClick={() => router.push(`/complaints/${createdComplaint._id || createdComplaint.id}`)}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
            >
              View Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50">
      <div className="bg-blue-600 pt-8 pb-12 px-6">
        <h1 className="text-2xl font-black text-white tracking-tight">Raise a Complaint</h1>
        <p className="text-white/80 font-medium mt-1">Help us fix your community</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: What's the issue */}
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">What&apos;s the issue?</h2>
                <p className="text-xs font-semibold text-slate-500">Type, description and priority</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">Complaint Type</label>
                <div className="relative">
                  <select
                    value={form.complaint_type}
                    onChange={(e) => updateField("complaint_type", e.target.value)}
                    className={`w-full appearance-none bg-slate-50 border-2 ${errors.complaint_type ? 'border-red-500' : 'border-slate-100'} rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 transition-colors`}
                  >
                    <option value="" disabled>Select a category</option>
                    {COMPLAINT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
                {errors.complaint_type && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.complaint_type}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the issue clearly (min 10 characters)"
                  rows={4}
                  className={`w-full bg-slate-50 border-2 ${errors.description ? 'border-red-500' : 'border-slate-100'} rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 transition-colors resize-none`}
                />
                {errors.description && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">Priority</label>
                <div className="flex gap-3">
                  {PRIORITIES.map(p => {
                    const isSelected = form.priority === p.value;
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => updateField("priority", p.value)}
                        className={`flex-1 flex flex-col items-center gap-2 py-3 border-2 rounded-xl transition-all ${
                          isSelected ? `${p.bg} ${p.border} ${p.color}` : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-extrabold">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Where is it */}
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">Where is it?</h2>
                <p className="text-xs font-semibold text-slate-500">Ward, address & GPS location</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">Ward</label>
                <div className="relative">
                  <select
                    value={form.ward_id}
                    onChange={(e) => updateField("ward_id", e.target.value)}
                    disabled={wardsLoading}
                    className={`w-full appearance-none bg-slate-50 border-2 ${errors.ward_id ? 'border-red-500' : 'border-slate-100'} rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 transition-colors disabled:opacity-50`}
                  >
                    <option value="" disabled>{wardsLoading ? "Loading wards..." : "Select your ward"}</option>
                    {wards.map((w: any) => (
                      <option key={w._id} value={w._id}>{w.ward_name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
                {errors.ward_id && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.ward_id}</p>}
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gpsLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-colors font-bold text-sm"
              >
                <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                {gpsLoading ? "Getting location..." : "Use my current location"}
              </button>

              {(form.latitude || form.longitude) && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="flex-1 text-xs font-bold text-emerald-800 truncate">
                    {form.latitude}, {form.longitude}
                  </span>
                  <button
                    type="button"
                    onClick={() => { updateField("latitude", ""); updateField("longitude", ""); }}
                    className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">Address / Landmark</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="e.g. Near post office, Main Road"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Additional info */}
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">Additional info</h2>
                <p className="text-xs font-semibold text-slate-500">Optional — any extra context</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">Citizen Note</label>
              <textarea
                value={form.citizen_note}
                onChange={(e) => updateField("citizen_note", e.target.value)}
                placeholder="Anything else we should know?"
                rows={3}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-xl font-black tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <span>Submitting...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Complaint
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

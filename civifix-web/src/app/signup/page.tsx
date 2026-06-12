"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import authService from "@/services/auth";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Building2,
  Mail,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const PRIMARY = "bg-blue-600";
const OTP_LENGTH = 6;

export default function SignupPage() {
  const router = useRouter();
  const { signUp, verifyRegister, error: authError, setError } = useAuth();

  // Multi-step state: 1 = Personal Info, 2 = Password, "OTP" = Verification
  const [step, setStep] = useState<1 | 2 | "OTP">(1);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    mobile_number: "",
    email: "",
    address: "",
    district_id: "",
    ward_id: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // District & Ward Data
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // OTP State
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Fetch districts on mount
    fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/districts?active_only=false")
      .then(res => res.json())
      .then(json => {
        setDistricts(json.data || []);
        setLoadingDistricts(false);
      })
      .catch(err => {
        console.error("Failed to fetch districts", err);
        setLoadingDistricts(false);
      });
  }, []);

  useEffect(() => {
    // Fetch wards when district changes
    if (!formData.district_id) {
      setWards([]);
      return;
    }
    setLoadingWards(true);
    authService.getWardsByDistrict(formData.district_id)
      .then(data => {
        setWards(Array.isArray(data) ? data : data?.data || []);
        setLoadingWards(false);
      })
      .catch(err => {
        console.error("Failed to fetch wards", err);
        setWards([]);
        setLoadingWards(false);
      });
  }, [formData.district_id]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
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
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          if (data && data.display_name) {
            updateField("address", data.display_name);
          } else {
            updateField("address", `${lat}, ${lon}`);
          }
        } catch (error) {
          updateField("address", `${lat}, ${lon}`);
        }
        setGpsLoading(false);
      },
      () => {
        alert("Unable to retrieve your location");
        setGpsLoading(false);
      }
    );
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.mobile_number.trim()) newErrors.mobile_number = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile_number.replace(/\D/g, ""))) {
      newErrors.mobile_number = "Enter a valid 10-digit number";
    }
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (formData.address.trim().length < 5) newErrors.address = "Address must be at least 5 characters";
    if (!formData.district_id) newErrors.district_id = "Please select a district";
    if (!formData.ward_id) newErrors.ward_id = "Please select a ward";
    if (!agreedToTerms) newErrors.terms = "You must agree to Terms & Conditions";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) setStep(2);
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    setError(null);
    try {
      await signUp({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile_number: formData.mobile_number.replace(/\D/g, ""),
        address: formData.address.trim(),
        district: formData.district_id,
        ward: formData.ward_id,
      });
      setStep("OTP");
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== "") {
      if (index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== OTP_LENGTH) {
      setOtpError(`Please enter a ${OTP_LENGTH}-digit OTP`);
      return;
    }
    setLoading(true);
    setOtpError("");
    setError(null);
    try {
      await verifyRegister(formData.email.trim().toLowerCase(), otpValue);
      router.push("/dashboard");
    } catch (err: any) {
      setOtpError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* ── LEFT/HEADER SECTION ── */}
      <div className={`${PRIMARY} flex flex-col justify-center px-6 py-12 md:p-12 lg:p-16 md:w-5/12 lg:w-4/12 relative overflow-hidden z-10`}>
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-black/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-10 shadow-lg border border-white/20">
            <img src="/logo.png" alt="CiviFix" className="w-8 h-8 object-cover" />
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            Create <br />
            <span className="text-blue-200">Account</span>
          </h1>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed font-medium max-w-sm">
            Join CiviFix today to report issues, track resolutions, and coordinate with municipal officers.
          </p>
        </div>
      </div>

      {/* ── RIGHT/FORM SECTION ── */}
      <div className="flex-1 bg-white flex flex-col px-6 py-8 md:p-12 lg:p-16 rounded-t-3xl md:rounded-t-none -mt-6 md:mt-0 z-20 overflow-y-auto">
        <div className="flex-1 max-w-xl mx-auto w-full">
          
          {step !== "OTP" && (
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => step === 1 ? router.push("/login") : setStep(1)}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800">
                  {step === 1 ? "Personal Info" : "Security Info"}
                </h2>
                <p className="text-xs font-semibold text-slate-400">Step {step} of 2</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2">FULL NAME</label>
                  <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 bg-slate-50 ${errors.name ? 'border-red-500' : 'border-slate-100 focus-within:border-blue-500'}`}>
                    <User className="w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Enter full name"
                      className="flex-1 bg-transparent border-none outline-none text-slate-800 text-sm"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2">MOBILE NUMBER</label>
                  <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 bg-slate-50 ${errors.mobile_number ? 'border-red-500' : 'border-slate-100 focus-within:border-blue-500'}`}>
                    <span className="text-slate-800 font-bold text-sm pr-2 border-r-2 border-slate-200">🇮🇳 +91</span>
                    <input
                      type="tel"
                      value={formData.mobile_number}
                      onChange={(e) => updateField("mobile_number", e.target.value)}
                      placeholder="10-digit number"
                      maxLength={10}
                      className="flex-1 bg-transparent border-none outline-none text-slate-800 text-sm"
                    />
                  </div>
                  {errors.mobile_number && <p className="text-red-500 text-xs mt-1 font-medium">{errors.mobile_number}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2">EMAIL ADDRESS</label>
                <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 bg-slate-50 ${errors.email ? 'border-red-500' : 'border-slate-100 focus-within:border-blue-500'}`}>
                  <Mail className="w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Enter email address"
                    autoCapitalize="none"
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 text-sm"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
              </div>



              <div className="pt-4">
                <button
                  onClick={handleNextStep}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25"
                >
                  <span className="tracking-widest">NEXT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-500 tracking-wider">ADDRESS</label>
                  <button onClick={handleGetLocation} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700">
                    <MapPin className="w-3 h-3" />
                    {gpsLoading ? "Loading..." : "Use Current Location"}
                  </button>
                </div>
                <div className={`border-2 rounded-xl px-4 py-3 bg-slate-50 ${errors.address ? 'border-red-500' : 'border-slate-100 focus-within:border-blue-500'}`}>
                  <textarea
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="House / Street / Locality"
                    rows={2}
                    className="w-full bg-transparent border-none outline-none text-slate-800 text-sm resize-none"
                  />
                </div>
                {errors.address && <p className="text-red-500 text-xs mt-1 font-medium">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2">DISTRICT</label>
                  <div className={`border-2 rounded-xl px-4 py-3 bg-slate-50 ${errors.district_id ? 'border-red-500' : 'border-slate-100 focus-within:border-blue-500'}`}>
                    <select
                      value={formData.district_id}
                      onChange={(e) => updateField("district_id", e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-slate-800 text-sm appearance-none"
                    >
                      <option value="">Select District</option>
                      {districts.map(d => (
                        <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.district_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.district_id}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2">WARD</label>
                  <div className={`border-2 rounded-xl px-4 py-3 bg-slate-50 ${errors.ward_id ? 'border-red-500' : 'border-slate-100 focus-within:border-blue-500'}`}>
                    <select
                      value={formData.ward_id}
                      onChange={(e) => updateField("ward_id", e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-slate-800 text-sm appearance-none"
                      disabled={!formData.district_id || loadingWards}
                    >
                      <option value="">{loadingWards ? "Loading..." : "Select Ward"}</option>
                      {wards.map(w => (
                        <option key={w._id || w.id} value={w._id || w.id}>{w.ward_name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.ward_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.ward_id}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setAgreedToTerms(!agreedToTerms);
                    if (errors.terms) updateField("terms", "");
                  }}
                  className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mt-0.5 border-2 transition-colors ${agreedToTerms ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}
                >
                  {agreedToTerms && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <p className="text-sm text-slate-600 font-medium leading-tight">
                  I agree to the <span className="text-blue-600 font-bold">Terms & Conditions</span> and <span className="text-blue-600 font-bold">Privacy Policy</span>
                </p>
              </div>
              {errors.terms && <p className="text-red-500 text-xs mt-1 font-medium">{errors.terms}</p>}

              {authError && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm font-medium text-red-600 flex-1">{authError}</p>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-extrabold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25"
                >
                  {loading ? (
                    <span className="tracking-widest">CREATING ACCOUNT...</span>
                  ) : (
                    <>
                      <span className="tracking-widest">CREATE ACCOUNT</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "OTP" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-500 font-medium mb-8">
                We sent a 6-digit verification code to <span className="text-slate-800 font-bold">{formData.email}</span>
              </p>

              <div className="flex justify-center gap-2 sm:gap-3 mb-8 w-full max-w-sm">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 transition-colors outline-none
                      ${digit ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-slate-200 text-slate-800 bg-white focus:border-blue-400'}
                      ${otpError ? 'border-red-500 bg-red-50 text-red-500' : ''}
                    `}
                  />
                ))}
              </div>

              {otpError && <p className="text-red-500 text-sm font-medium mb-6">{otpError}</p>}
              {authError && <p className="text-red-500 text-sm font-medium mb-6">{authError}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length !== OTP_LENGTH}
                className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-extrabold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25 mb-6"
              >
                {loading ? "VERIFYING..." : "VERIFY ACCOUNT"}
              </button>

              <button 
                onClick={() => setStep(1)}
                className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Back to Registration
              </button>
            </div>
          )}

          {step !== "OTP" && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-slate-500">Already have an account?</span>
              <button
                onClick={() => router.push("/login")}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

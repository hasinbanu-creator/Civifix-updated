"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center">
      <div className="w-32 h-32 rounded-3xl flex items-center justify-center overflow-hidden bg-white shadow-2xl shadow-blue-900/50 animate-pulse">
        <img src="/logo.png" alt="CiviFix Logo" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

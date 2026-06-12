"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import authService, { UserSession, UserProfile } from "@/services/auth";
import { getErrorMessage } from "@/lib/api";

interface AuthContextType {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  user: UserProfile | null;
  error: string | null;
  signIn: (email: string) => Promise<any>;
  signUp: (userData: any) => Promise<any>;
  verifyLogin: (email: string, otp: string) => Promise<UserSession>;
  verifyRegister: (email: string, otp: string) => Promise<UserSession>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setError: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSignout, setIsSignout] = useState<boolean>(false);
  const [error, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("authToken");
          if (token) {
            setUserToken(token);
            try {
              const profile = await authService.getProfile();
              setUser(profile);
            } catch (err) {
              console.warn("Restoring profile failed, clearing tokens", err);
              localStorage.removeItem("authToken");
              localStorage.removeItem("refreshToken");
              setUserToken(null);
            }
          }
        }
      } catch (e) {
        console.error("Auth restoration error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  const signIn = useCallback(async (email: string) => {
    try {
      setErrorState(null);
      const response = await authService.login(email);
      return response;
    } catch (err) {
      const errMsg = getErrorMessage(err);
      setErrorState(errMsg);
      throw err;
    }
  }, []);

  const signUp = useCallback(async (userData: any) => {
    try {
      setErrorState(null);
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      const errMsg = getErrorMessage(err);
      setErrorState(errMsg);
      throw err;
    }
  }, []);

  const verifyLogin = useCallback(async (email: string, otp: string) => {
    try {
      setErrorState(null);
      const session = await authService.verifyLogin(email, otp);
      setUserToken(session.access_token);
      const profile = await authService.getProfile();
      setUser(profile);
      setIsSignout(false);
      return session;
    } catch (err) {
      const errMsg = getErrorMessage(err);
      setErrorState(errMsg);
      throw err;
    }
  }, []);

  const verifyRegister = useCallback(async (email: string, otp: string) => {
    try {
      setErrorState(null);
      const session = await authService.verifyRegister(email, otp);
      setUserToken(session.access_token);
      const profile = await authService.getProfile();
      setUser(profile);
      setIsSignout(false);
      return session;
    } catch (err) {
      const errMsg = getErrorMessage(err);
      setErrorState(errMsg);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    setUserToken(null);
    setIsSignout(true);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const setError = useCallback((msg: string | null) => {
    setErrorState(msg);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userToken,
        isLoading,
        isSignout,
        error,
        signIn,
        signUp,
        verifyLogin,
        verifyRegister,
        signOut,
        clearError,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

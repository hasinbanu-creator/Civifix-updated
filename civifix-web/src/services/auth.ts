import api, { unwrapResponse } from "@/lib/api";
import { ENDPOINTS } from "@/constants/endpoints";

export interface UserSession {
  access_token: string;
  refresh_token?: string;
  user?: any;
}

export interface UserProfile {
  id: string | number;
  email: string;
  name: string;
  role: string;
  [key: string]: any;
}

export interface Complaint {
  id: string | number;
  title: string;
  description: string;
  status: string;
  [key: string]: any;
}

const storeSession = (session: UserSession) => {
  if (!session?.access_token) return;
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", session.access_token);
    if (session.refresh_token) {
      localStorage.setItem("refreshToken", session.refresh_token);
    }
  }
};

export const authService = {
  register: async (userData: any): Promise<any> => {
    const response = await api.post(ENDPOINTS.REGISTER, userData);
    return unwrapResponse(response);
  },

  login: async (email: string): Promise<any> => {
    const response = await api.post(ENDPOINTS.LOGIN, { email });
    return unwrapResponse(response);
  },

  verifyLogin: async (email: string, otp: string): Promise<UserSession> => {
    const response = await api.post(ENDPOINTS.VERIFY_LOGIN, { email, otp });
    const session = unwrapResponse<UserSession>(response);
    storeSession(session);
    return session;
  },

  verifyRegister: async (email: string, otp: string): Promise<UserSession> => {
    const response = await api.post(ENDPOINTS.VERIFY_REGISTER, { email, otp });
    const session = unwrapResponse<UserSession>(response);
    storeSession(session);
    return session;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn("Logout API failed, clearing local storage", error);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get(ENDPOINTS.GET_PROFILE);
    return unwrapResponse<UserProfile>(response);
  },

  updateProfile: async (userData: any): Promise<UserProfile> => {
    const response = await api.put(ENDPOINTS.UPDATE_PROFILE, userData);
    return unwrapResponse<UserProfile>(response);
  },

  getComplaints: async ({ page = 1, limit = 10, status }: { page?: number; limit?: number; status?: string } = {}): Promise<any> => {
    const response = await api.get(ENDPOINTS.GET_COMPLAINTS, {
      params: { page, limit, status },
    });
    return unwrapResponse(response);
  },

  getComplaint: async (id: string | number): Promise<Complaint> => {
    const response = await api.get(ENDPOINTS.GET_COMPLAINT(id));
    return unwrapResponse<Complaint>(response);
  },

  createComplaint: async (complaintData: any): Promise<Complaint> => {
    const response = await api.post(ENDPOINTS.CREATE_COMPLAINT, complaintData);
    return unwrapResponse<Complaint>(response);
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      return !!token;
    }
    return false;
  },

  getMe: async (): Promise<UserProfile> => {
    const res = await api.get(ENDPOINTS.GET_PROFILE);
    return unwrapResponse<UserProfile>(res);
  },

  // ─── SUPER ADMIN ─────────────────────────────────────────────────────────────
  getAdminStats: async (): Promise<any> => {
    const res = await api.get("/admin/stats");
    return unwrapResponse(res);
  },

  // ─── DISTRICT ADMIN ──────────────────────────────────────────────────────────
  getInspectors: async (): Promise<any[]> => {
    const res = await api.get("/admin/inspectors");
    return unwrapResponse<any[]>(res);
  },

  getWorkers: async (): Promise<any[]> => {
    const res = await api.get("/admin/workers");
    return unwrapResponse<any[]>(res);
  },

  getDistrictUsers: async (): Promise<any[]> => {
    const res = await api.get("/admin/users");
    return unwrapResponse<any[]>(res);
  },

  // ─── INSPECTOR ───────────────────────────────────────────────────────────────
  getWardComplaints: async ({ page = 1, limit = 20, status }: { page?: number; limit?: number; status?: string } = {}): Promise<any> => {
    const params: any = { page, limit };
    if (status) params.status = status;
    const res = await api.get("/inspector/complaints", { params });
    return unwrapResponse(res);
  },

  getWardWorkers: async (): Promise<any[]> => {
    const res = await api.get("/inspector/workers");
    return unwrapResponse<any[]>(res);
  },

  // ─── WORKER ──────────────────────────────────────────────────────────────────
  getAssignedComplaints: async ({ page = 1, limit = 20, status }: { page?: number; limit?: number; status?: string } = {}): Promise<any> => {
    const params: any = { page, limit };
    if (status) params.status = status;
    const res = await api.get("/worker/complaints", { params });
    return unwrapResponse(res);
  },

  getWardsByDistrict: async (districtId: string | number, { page = 1, is_active = true, limit = 60 }: { page?: number; is_active?: boolean; limit?: number } = {}): Promise<any> => {
    const res = await api.get(`/wards/district/${districtId}`, {
      params: { page, is_active, limit },
    });
    return unwrapResponse(res);
  },

  // ─── WARD MANAGEMENT ─────────────────────────────────────────────────────────
  getWards: async ({ page = 1, limit = 20, is_active = true }: { page?: number; limit?: number; is_active?: boolean } = {}): Promise<any> => {
    const res = await api.get("/wards/district", {
      params: { page, limit, is_active },
    });
    return unwrapResponse(res);
  },

  getWardDetail: async (wardId: string | number): Promise<any> => {
    const res = await api.get(`/wards/${wardId}`);
    return unwrapResponse(res);
  },

  getInspectorWard: async (): Promise<any> => {
    const res = await api.get("/wards/inspector/assigned");
    return unwrapResponse(res);
  },

  assignInspectorToWard: async (wardId: string | number, inspectorId: string | number): Promise<any> => {
    const res = await api.post(`/wards/${wardId}/assign-inspector`, {
      inspector_id: inspectorId,
    });
    return unwrapResponse(res);
  },

  // ─── DASHBOARD ROLE-SPECIFIC ────────────────────────────────────────────────
  getInspectorDashboard: async (): Promise<any> => {
    const res = await api.get("/dashboard/inspector/dashboard");
    return unwrapResponse(res);
  },

  getDistrictAdminDashboard: async (): Promise<any> => {
    const res = await api.get("/dashboard/district-admin/dashboard");
    return unwrapResponse(res);
  },

  getWorkerDashboard: async (): Promise<any> => {
    const res = await api.get("/dashboard/worker/dashboard");
    return unwrapResponse(res);
  },
};

export default authService;

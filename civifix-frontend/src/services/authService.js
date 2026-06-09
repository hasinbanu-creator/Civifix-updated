import api from "./api";
import { unwrapResponse } from "./api";
import { ENDPOINTS } from "../constants/endpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storeSession = async (session) => {
  if (!session?.access_token) return;
  await AsyncStorage.setItem("authToken", session.access_token);
  if (session.refresh_token) {
    await AsyncStorage.setItem("refreshToken", session.refresh_token);
  }
};

export const authService = {
  register: async (userData) => {
    const response = await api.post(ENDPOINTS.REGISTER, userData);
    return unwrapResponse(response);
  },

  login: async (email) => {
    const response = await api.post(ENDPOINTS.LOGIN, { email });
    return unwrapResponse(response);
  },

  verifyLogin: async (email, otp) => {
    const response = await api.post(ENDPOINTS.VERIFY_LOGIN, {
      email,
      otp,
    });
    const session = unwrapResponse(response);
    await storeSession(session);
    return session;
  },

  verifyRegister: async (email, otp) => {
    const response = await api.post(ENDPOINTS.VERIFY_REGISTER, {
      email,
      otp,
    });
    const session = unwrapResponse(response);
    await storeSession(session);
    return session;
  },

  logout: async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn("Logout API failed, clearing local storage");
    }
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("user");
  },

  getProfile: async () => {
    const response = await api.get(ENDPOINTS.GET_PROFILE);
    return unwrapResponse(response);
  },

  updateProfile: async (userData) => {
    const response = await api.put(ENDPOINTS.UPDATE_PROFILE, userData);
    return unwrapResponse(response);
  },

  getComplaints: async ({ page = 1, limit = 10, status } = {}) => {
    const response = await api.get(ENDPOINTS.GET_COMPLAINTS, {
      params: { page, limit, status },
    });
    return unwrapResponse(response);
  },

  getComplaint: async (id) => {
    const response = await api.get(ENDPOINTS.GET_COMPLAINT(id));
    return unwrapResponse(response);
  },

  createComplaint: async (complaintData) => {
    const response = await api.post(ENDPOINTS.CREATE_COMPLAINT, complaintData);
    return unwrapResponse(response);
  },

  getToken: async () => {
    return await AsyncStorage.getItem("authToken");
  },

  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem("authToken");
    return !!token;
  },

  // ─── /auth/me ───────────────────────────────────────────────────────────────
  getMe: async () => {
    const res = await api.get(ENDPOINTS.GET_PROFILE);
    return unwrapResponse(res);
  },

  // ─── SUPER ADMIN ─────────────────────────────────────────────────────────────
  getAdminStats: async () => {
    const res = await api.get("/api/v1/admin/stats");
    return unwrapResponse(res);
  },

  // ─── DISTRICT ADMIN ──────────────────────────────────────────────────────────
  getInspectors: async () => {
    const res = await api.get("/api/v1/admin/inspectors");
    return unwrapResponse(res);
  },

  getWorkers: async () => {
    const res = await api.get("/api/v1/admin/workers");
    return unwrapResponse(res);
  },

  getWards: async () => {
    const res = await api.get("/api/v1/admin/wards");
    return unwrapResponse(res);
  },

  getDistrictUsers: async () => {
    const res = await api.get("/api/v1/admin/users");
    return unwrapResponse(res);
  },

  // ─── INSPECTOR ───────────────────────────────────────────────────────────────
  getWardComplaints: async ({ page = 1, limit = 20, status } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const res = await api.get("/api/v1/inspector/complaints", { params });
    return unwrapResponse(res);
  },

  getWardWorkers: async () => {
    const res = await api.get("/api/v1/inspector/workers");
    return unwrapResponse(res);
  },

  // ─── WORKER ──────────────────────────────────────────────────────────────────
  getAssignedComplaints: async ({ page = 1, limit = 20, status } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const res = await api.get("/api/v1/worker/complaints", { params });
    return unwrapResponse(res);
  },

  getWardsByDistrict: async (districtId, { page = 1, is_active = true, limit = 60} = {}) => {
    const res = await api.get(`/wards/district/${districtId}`, {
      params: { page, is_active, limit }
    });
    return unwrapResponse(res);
  },

};



export default authService;

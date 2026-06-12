export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://34.14.168.135:8000/api/v1";

export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  VERIFY_LOGIN: "/auth/verify-login-otp",
  VERIFY_REGISTER: "/auth/verify-otp",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh-token",

  // User endpoints
  GET_PROFILE: "/auth/me",
  UPDATE_PROFILE: "/auth/me",

  // Complaints endpoints
  GET_COMPLAINTS: "/complaints/my/dashboard",
  CREATE_COMPLAINT: "/complaints",
  GET_COMPLAINT: (id: string | number) => `/complaints/${id}`,

  // Ward/admin endpoints
  GET_WARDS_BY_DISTRICT: (districtId: string | number) => `/wards/district/${districtId}`,
  SEARCH_WARDS: (districtId: string | number) => `/wards/search/${districtId}`,
  GET_DISTRICTS: "/admin/districts",

  // Ward endpoints
  GET_WARDS: "/wards/district",
  GET_WARD_DETAIL: (wardId: string | number) => `/wards/${wardId}`,
  GET_INSPECTOR_WARD: "/wards/inspector/assigned",
  ASSIGN_INSPECTOR_TO_WARD: (wardId: string | number) => `/wards/${wardId}/assign-inspector`,

  // Dashboard role-specific
  GET_INSPECTOR_DASHBOARD: "/dashboard/inspector/dashboard",
  GET_DISTRICT_ADMIN_DASHBOARD: "/dashboard/district-admin/dashboard",
  GET_WORKER_DASHBOARD: "/dashboard/worker/dashboard",
} as const;

export default ENDPOINTS;

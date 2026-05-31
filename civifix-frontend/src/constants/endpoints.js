import { Platform } from "react-native";
import Constants from "expo-constants";

const DEFAULT_API_URL = "http://34.14.168.135:8000/api/v1";

const getMetroHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  return hostUri?.split(":")?.[0];
};

const resolveApiUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
  const isLocalhost =
    configuredUrl.includes("localhost") || configuredUrl.includes("127.0.0.1");

  if (!isLocalhost || Platform.OS === "web") {
    return configuredUrl;
  }

  const metroHost = getMetroHost();
  if (metroHost) {
    return configuredUrl.replace(/localhost|127\.0\.0\.1/, metroHost);
  }

  if (Platform.OS === "android") {
    return configuredUrl.replace(/localhost|127\.0\.0\.1/, "10.0.2.2");
  }

  return configuredUrl;
};

export const API_URL = resolveApiUrl();

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
  GET_COMPLAINT: (id) => `/complaints/${id}`,

  // Ward/admin endpoints
  GET_WARDS_BY_DISTRICT: (districtId) => `/wards/district/${districtId}`,
  SEARCH_WARDS: (districtId) => `/wards/search/${districtId}`,
  GET_DISTRICTS: "/admin/districts",
};

export default ENDPOINTS;

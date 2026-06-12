import { useQuery } from "@tanstack/react-query";
import authService from "@/services/auth";

export function useInspectorDashboard() {
  return useQuery({
    queryKey: ["inspector-dashboard"],
    queryFn: () => authService.getInspectorDashboard(),
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => authService.getDistrictAdminDashboard(),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => authService.getAdminStats(),
  });
}

import { useQuery } from "@tanstack/react-query";
import authService from "@/services/auth";

export function useWards(districtId?: string | number, params: { page?: number; limit?: number; is_active?: boolean } = {}) {
  return useQuery({
    queryKey: ["wards", districtId, params],
    queryFn: () => {
      if (districtId) {
        return authService.getWardsByDistrict(districtId, params);
      }
      return authService.getWards(params);
    },
    enabled: !!districtId,
  });
}

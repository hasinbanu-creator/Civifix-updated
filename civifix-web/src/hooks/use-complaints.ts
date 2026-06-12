import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import authService from "@/services/auth";

export function useComplaints(params: { page?: number; limit?: number; status?: string } = {}, options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ["complaints", params],
    queryFn: () => authService.getComplaints(params),
    ...options,
  } as any);
}

export function useComplaint(id: string | number, options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ["complaint", id],
    queryFn: () => authService.getComplaint(id),
    enabled: !!id,
    ...options,
  } as any);
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (complaintData: any) => authService.createComplaint(complaintData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}

export function useWardComplaints(params: { page?: number; limit?: number; status?: string } = {}, options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ["ward-complaints", params],
    queryFn: () => authService.getWardComplaints(params),
    ...options,
  } as any);
}

export function useAssignedComplaints(params: { page?: number; limit?: number; status?: string } = {}, options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ["assigned-complaints", params],
    queryFn: () => authService.getAssignedComplaints(params),
    ...options,
  } as any);
}

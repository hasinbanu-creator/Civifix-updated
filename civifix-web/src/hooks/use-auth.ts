import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import authService, { UserSession, UserProfile } from "@/services/auth";

export function useLogin() {
  return useMutation({
    mutationFn: (email: string) => authService.login(email),
  });
}

export function useVerifyLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyLogin(email, otp),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data.user || null);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (userData: any) => authService.register(userData),
  });
}

export function useVerifyRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyRegister(email, otp),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data.user || null);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => authService.getProfile(),
    enabled: authService.isAuthenticated(),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["profile"], null);
      queryClient.removeQueries();
    },
  });
}

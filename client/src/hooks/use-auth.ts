import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi, logout as logoutApi, getCurrentUser } from "@/lib/auth";
import type { LoginCredentials, AuthUser } from "@/lib/types";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => getCurrentUser().then(res => res.user),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      queryClient.invalidateQueries();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
    },
  });

  return {
    user: user || null,
    isLoading,
    error,
    login: (credentials: LoginCredentials) => loginMutation.mutateAsync(credentials),
    logout: () => logoutMutation.mutateAsync(),
    isAuthenticated: !!user,
  };
}

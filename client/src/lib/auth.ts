import { apiRequest } from "./queryClient";
import type { AuthUser } from "./types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  return response.json();
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await apiRequest("GET", "/api/auth/me");
  return response.json();
}

export function hasRole(user: AuthUser | null, roles: string[]): boolean {
  return user ? roles.includes(user.role) : false;
}

export function canAccessBranch(user: AuthUser | null, branchId: number): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.branchId === branchId;
}

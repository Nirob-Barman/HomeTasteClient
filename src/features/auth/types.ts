import type { TRole } from "@/constants/roles";
import type { TUserProfile } from "@/types/user";

export interface AuthState {
  user: TUserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: TRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  email: string;
  role: string | null;
}

export interface RegisterResponse {
  id: string;
  email: string;
  role: string;
}

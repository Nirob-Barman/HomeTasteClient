import { jwtDecode } from "jwt-decode";
import type { TRole } from "@/constants/roles";

interface JwtPayload {
  sub: string;
  email: string;
  role: TRole | TRole[];
  exp: number;
  iat: number;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  return payload.exp * 1000 < Date.now();
}

export function getRolesFromToken(token: string): TRole[] {
  const payload = decodeToken(token);
  if (!payload) return [];
  return Array.isArray(payload.role) ? payload.role : [payload.role];
}

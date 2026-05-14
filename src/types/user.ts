import type { TRole } from "@/constants/roles";

export interface TUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
  isLocked: boolean;
  roles: TRole[];
}

export interface TAdminUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
  isLocked: boolean;
  roles: TRole[];
}

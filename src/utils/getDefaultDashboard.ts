import { USER_ROLES, type TRole } from "@/constants/roles";
import { PATHS } from "@/routes/paths";

export function getDefaultDashboard(roles: TRole[]): string {
  if (roles.includes(USER_ROLES.ADMIN)) return PATHS.ADMIN.DASHBOARD;
  if (roles.includes(USER_ROLES.CUSTOMER)) return PATHS.CUSTOMER.DASHBOARD;
  if (roles.includes(USER_ROLES.DELIVERY_PERSONNEL)) return PATHS.DELIVERY.DASHBOARD;
  return PATHS.HOME;
}

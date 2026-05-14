import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import type { TRole } from "@/constants/roles";
import { USER_ROLES } from "@/constants/roles";
import { PATHS } from "./paths";

interface RoleRouteProps {
  allowedRoles: TRole[];
}

function getDefaultDashboard(roles: TRole[]): string {
  if (roles.includes(USER_ROLES.ADMIN)) return PATHS.ADMIN.DASHBOARD;
  if (roles.includes(USER_ROLES.CUSTOMER)) return PATHS.CUSTOMER.DASHBOARD;
  if (roles.includes(USER_ROLES.DELIVERY_PERSONNEL))
    return PATHS.DELIVERY.DASHBOARD;
  return PATHS.LOGIN;
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAppSelector((s) => s.auth);
  const userRoles = user?.roles ?? [];

  const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasAccess) {
    return <Navigate to={getDefaultDashboard(userRoles)} replace />;
  }

  return <Outlet />;
}

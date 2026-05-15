import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  BarChart3,
  HeadphonesIcon,
  MapPin,
  Gift,
  ClipboardList,
  Tag,
  Star,
  type LucideIcon,
} from "lucide-react";
import { USER_ROLES, type TRole } from "@/constants/roles";
import { PATHS } from "@/routes/paths";

export interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

type MenuConfig = Record<TRole, MenuItem[]>;

export const menuConfig: MenuConfig = {
  [USER_ROLES.ADMIN]: [
    { label: "Dashboard", path: PATHS.ADMIN.DASHBOARD, icon: LayoutDashboard },
    { label: "Users", path: PATHS.ADMIN.USERS, icon: Users },
    { label: "Meals", path: PATHS.ADMIN.MEALS, icon: UtensilsCrossed },
    { label: "Orders", path: PATHS.ADMIN.ORDERS, icon: ShoppingBag },
    { label: "Deliveries", path: PATHS.ADMIN.DELIVERIES, icon: Truck },
    { label: "Analytics", path: PATHS.ADMIN.ANALYTICS, icon: BarChart3 },
    { label: "Support", path: PATHS.ADMIN.SUPPORT, icon: HeadphonesIcon },
    { label: "Categories", path: PATHS.ADMIN.CATEGORIES, icon: UtensilsCrossed },
    { label: "Inventory", path: PATHS.ADMIN.INVENTORY, icon: ShoppingBag },
    { label: "Coupons", path: PATHS.ADMIN.COUPONS, icon: Tag },
  ],
  [USER_ROLES.CUSTOMER]: [
    {
      label: "Dashboard",
      path: PATHS.CUSTOMER.DASHBOARD,
      icon: LayoutDashboard,
    },
    { label: "Browse Meals", path: PATHS.CUSTOMER.MEALS, icon: UtensilsCrossed },
    { label: "My Orders", path: PATHS.CUSTOMER.ORDERS, icon: ShoppingBag },
    { label: "Addresses", path: PATHS.CUSTOMER.ADDRESSES, icon: MapPin },
    { label: "Loyalty", path: PATHS.CUSTOMER.LOYALTY, icon: Gift },
    { label: "Support", path: PATHS.CUSTOMER.SUPPORT, icon: HeadphonesIcon },
    { label: "Reviews", path: PATHS.CUSTOMER.REVIEWS, icon: Star },
  ],
  [USER_ROLES.DELIVERY_PERSONNEL]: [
    {
      label: "Dashboard",
      path: PATHS.DELIVERY.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      label: "My Assignments",
      path: PATHS.DELIVERY.ASSIGNMENTS,
      icon: ClipboardList,
    },
  ],
};

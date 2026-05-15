import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import PublicLayout from "@/layouts/PublicLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { USER_ROLES } from "@/constants/roles";
import { PATHS } from "./paths";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const UsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const UserDetailPage = lazy(() => import("@/pages/admin/UserDetailPage"));
const MealsPage = lazy(() => import("@/pages/admin/MealsPage"));
const OrdersPage = lazy(() => import("@/pages/admin/OrdersPage"));
const DeliveriesPage = lazy(() => import("@/pages/admin/DeliveriesPage"));
const AnalyticsPage = lazy(() => import("@/pages/admin/AnalyticsPage"));
const SupportPage = lazy(() => import("@/pages/admin/SupportPage"));
const CategoriesPage = lazy(() => import("@/pages/admin/CategoriesPage"));
const InventoryPage = lazy(() => import("@/pages/admin/InventoryPage"));
const CouponsPage = lazy(() => import("@/pages/admin/CouponsPage"));
const CustomerDashboard = lazy(
  () => import("@/pages/customer/CustomerDashboard")
);
const CustomerMealsPage = lazy(() => import("@/pages/customer/MealsPage"));
const CheckoutPage = lazy(() => import("@/pages/customer/CheckoutPage"));
const CustomerOrdersPage = lazy(() => import("@/pages/customer/OrdersPage"));
const AddressesPage = lazy(() => import("@/pages/customer/AddressesPage"));
const LoyaltyPage = lazy(() => import("@/pages/customer/LoyaltyPage"));
const CustomerSupportPage = lazy(() => import("@/pages/customer/SupportPage"));
const ReviewsPage = lazy(() => import("@/pages/customer/ReviewsPage"));
const AssignmentsPage = lazy(() => import("@/pages/delivery/AssignmentsPage"));
const DeliveryDashboard = lazy(
  () => import("@/pages/delivery/DeliveryDashboard")
);
const ProfilePage = lazy(() => import("@/pages/shared/ProfilePage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: PATHS.LOGIN, element: <Wrap><LoginPage /></Wrap> },
      { path: PATHS.REGISTER, element: <Wrap><RegisterPage /></Wrap> },
    ],
  },

  // Protected dashboard routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // Admin routes
          {
            element: <RoleRoute allowedRoles={[USER_ROLES.ADMIN]} />,
            children: [
              {
                path: PATHS.ADMIN.DASHBOARD,
                element: <Wrap><AdminDashboard /></Wrap>,
              },
              {
                path: PATHS.ADMIN.USERS,
                element: <Wrap><UsersPage /></Wrap>,
              },
              {
                path: PATHS.ADMIN.USER_DETAIL,
                element: <Wrap><UserDetailPage /></Wrap>,
              },
              {
                path: PATHS.ADMIN.MEALS,
                element: <Wrap><MealsPage /></Wrap>,
              },
              {
                path: PATHS.ADMIN.ORDERS,
                element: <Wrap><OrdersPage /></Wrap>,
              },
              {
                path: PATHS.ADMIN.DELIVERIES,
                element: <Wrap><DeliveriesPage /></Wrap>,
              },
              {
                path: PATHS.ADMIN.ANALYTICS,
                element: <Wrap><AnalyticsPage /></Wrap>,
              },
              {
                path: PATHS.ADMIN.SUPPORT,
                element: <Wrap><SupportPage /></Wrap>,
              },
              {
                path: PATHS.ADMIN.CATEGORIES,
                element: <Wrap><CategoriesPage /></Wrap>,
              },
              {
                path: PATHS.ADMIN.INVENTORY,
                element: <Wrap><InventoryPage /></Wrap>,
              },
              {
                path: PATHS.ADMIN.COUPONS,
                element: <Wrap><CouponsPage /></Wrap>,
              },
            ],
          },

          // Customer routes
          {
            element: <RoleRoute allowedRoles={[USER_ROLES.CUSTOMER]} />,
            children: [
              {
                path: PATHS.CUSTOMER.DASHBOARD,
                element: <Wrap><CustomerDashboard /></Wrap>,
              },
              {
                path: PATHS.CUSTOMER.MEALS,
                element: <Wrap><CustomerMealsPage /></Wrap>,
              },
              {
                path: PATHS.CUSTOMER.CHECKOUT,
                element: <Wrap><CheckoutPage /></Wrap>,
              },
              {
                path: PATHS.CUSTOMER.ORDERS,
                element: <Wrap><CustomerOrdersPage /></Wrap>,
              },
              {
                path: PATHS.CUSTOMER.ADDRESSES,
                element: <Wrap><AddressesPage /></Wrap>,
              },
              {
                path: PATHS.CUSTOMER.LOYALTY,
                element: <Wrap><LoyaltyPage /></Wrap>,
              },
              {
                path: PATHS.CUSTOMER.SUPPORT,
                element: <Wrap><CustomerSupportPage /></Wrap>,
              },
              {
                path: PATHS.CUSTOMER.REVIEWS,
                element: <Wrap><ReviewsPage /></Wrap>,
              },
            ],
          },

          // Shared routes (all authenticated roles)
          {
            path: PATHS.PROFILE,
            element: <Wrap><ProfilePage /></Wrap>,
          },

          // Delivery routes
          {
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.DELIVERY_PERSONNEL]} />
            ),
            children: [
              {
                path: PATHS.DELIVERY.DASHBOARD,
                element: <Wrap><DeliveryDashboard /></Wrap>,
              },
              {
                path: PATHS.DELIVERY.ASSIGNMENTS,
                element: <Wrap><AssignmentsPage /></Wrap>,
              },
            ],
          },
        ],
      },
    ],
  },

  // Public layout
  {
    element: <PublicLayout />,
    children: [
      { path: PATHS.HOME, element: <Wrap><HomePage /></Wrap> },
      { path: PATHS.NOT_FOUND, element: <Wrap><NotFoundPage /></Wrap> },
    ],
  },
]);

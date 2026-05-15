import { Link, Outlet } from "react-router-dom";
import { Logo } from "@/components/shared/Logo";
import { PATHS } from "@/routes/paths";
import { useAppSelector } from "@/app/hooks";
import { USER_ROLES } from "@/constants/roles";

function dashboardPath(roles: string[]) {
  if (roles.includes(USER_ROLES.ADMIN)) return PATHS.ADMIN.DASHBOARD;
  if (roles.includes(USER_ROLES.DELIVERY_PERSONNEL)) return PATHS.DELIVERY.DASHBOARD;
  return PATHS.CUSTOMER.DASHBOARD;
}

export default function PublicLayout() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to={PATHS.HOME}>
            <Logo />
          </Link>
          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={dashboardPath(user?.roles ?? [])}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to={PATHS.LOGIN}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Sign In
                </Link>
                <Link
                  to={PATHS.REGISTER}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

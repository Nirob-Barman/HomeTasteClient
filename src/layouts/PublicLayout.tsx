import { Link, Outlet } from "react-router-dom";
import { UtensilsCrossed, Mail, HeadphonesIcon } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { PATHS } from "@/routes/paths";
import { useAppSelector } from "@/app/hooks";
import { USER_ROLES } from "@/constants/roles";

function dashboardPath(roles: string[]) {
  if (roles.includes(USER_ROLES.ADMIN)) return PATHS.ADMIN.DASHBOARD;
  if (roles.includes(USER_ROLES.DELIVERY_PERSONNEL)) return PATHS.DELIVERY.DASHBOARD;
  return PATHS.CUSTOMER.DASHBOARD;
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
                <UtensilsCrossed size={18} />
              </div>
              <span className="text-lg font-bold text-gray-800">HomeTaste</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-gray-500 leading-relaxed">
              Delicious home-cooked meals delivered fresh to your door. Real recipes, real ingredients, every day.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link to={PATHS.HOME} className="hover:text-orange-500 transition-colors">Home</Link></li>
              <li><Link to={PATHS.LOGIN} className="hover:text-orange-500 transition-colors">Sign In</Link></li>
              <li><Link to={PATHS.REGISTER} className="hover:text-orange-500 transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Support</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>
                <a href="mailto:support@hometaste.com" className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                  <Mail size={13} /> support@hometaste.com
                </a>
              </li>
              <li>
                <Link to={PATHS.LOGIN} className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                  <HeadphonesIcon size={13} /> Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} HomeTaste. All rights reserved.</p>
          <p className="text-xs text-gray-400">Made with ❤️ for home-cooked goodness</p>
        </div>
      </div>
    </footer>
  );
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
      <Footer />
    </div>
  );
}

import { Menu, LogOut, User, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useLogoutMutation } from "@/features/auth/authApi";
import { clearCredentials } from "@/features/auth/authSlice";
import { USER_ROLES } from "@/constants/roles";
import { PATHS } from "@/routes/paths";
import { toast } from "sonner";

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const isCustomer = user?.roles.includes(USER_ROLES.CUSTOMER);
  const [logout] = useLogoutMutation();

  async function handleLogout() {
    try {
      await logout().unwrap();
    } catch {
      dispatch(clearCredentials());
    }
    toast.success("Logged out");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
      <button
        onClick={onMenuToggle}
        className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-3">
        {isCustomer && (
          <button
            onClick={() => navigate(PATHS.CUSTOMER.CHECKOUT)}
            className="relative rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
            title="Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        )}
        <span className="text-sm text-gray-600">
          {user?.firstName} {user?.lastName}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="avatar"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <User size={16} />
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-red-500"
          title="Logout"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useLoginMutation } from "@/features/auth/authApi";
import { useAppSelector } from "@/app/hooks";
import { USER_ROLES } from "@/constants/roles";
import { PATHS } from "@/routes/paths";
import type { TRole } from "@/constants/roles";
import { usePageTitle } from "@/hooks/usePageTitle";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

function getDefaultDashboard(roles: TRole[]): string {
  if (roles.includes(USER_ROLES.ADMIN)) return PATHS.ADMIN.DASHBOARD;
  if (roles.includes(USER_ROLES.CUSTOMER)) return PATHS.CUSTOMER.DASHBOARD;
  if (roles.includes(USER_ROLES.DELIVERY_PERSONNEL))
    return PATHS.DELIVERY.DASHBOARD;
  return PATHS.HOME;
}

export default function LoginPage() {
  usePageTitle("Sign In");
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (isAuthenticated && user) {
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ??
        getDefaultDashboard(user.roles);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await login(values).unwrap();
      toast.success("Logged in successfully");
    } catch {
      toast.error("Invalid email or password");
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {isLoading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link to={PATHS.REGISTER} className="text-orange-500 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

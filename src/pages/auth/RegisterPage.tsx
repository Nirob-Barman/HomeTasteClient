import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRegisterMutation } from "@/features/auth/authApi";
import { useAppSelector } from "@/app/hooks";
import { USER_ROLES } from "@/constants/roles";
import { PATHS } from "@/routes/paths";
import { usePageTitle } from "@/hooks/usePageTitle";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.DELIVERY_PERSONNEL]),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  usePageTitle("Register");
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [register, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (isAuthenticated) navigate(PATHS.HOME, { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: USER_ROLES.CUSTOMER },
  });

  async function onSubmit(values: FormValues) {
    try {
      await register(values).unwrap();
      toast.success("Account created! Please sign in.");
      navigate(PATHS.LOGIN, { replace: true });
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Create account</h2>
        <p className="mt-1 text-sm text-gray-500">
          Join HomeTaste today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              First name
            </label>
            <input
              {...field("firstName")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              {...field("lastName")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...field("email")}
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
            {...field("password")}
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

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            I want to
          </label>
          <select
            {...field("role")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          >
            <option value={USER_ROLES.CUSTOMER}>Order food (Customer)</option>
            <option value={USER_ROLES.DELIVERY_PERSONNEL}>
              Deliver food (Delivery Personnel)
            </option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {isLoading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link to={PATHS.LOGIN} className="text-orange-500 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

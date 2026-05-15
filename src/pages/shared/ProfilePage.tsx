import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { updateUser } from "@/features/auth/authSlice";
import { useUpdateProfileMutation, useChangePasswordMutation } from "@/features/auth/authApi";
import { usePageTitle } from "@/hooks/usePageTitle";

const profileSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  usePageTitle("My Profile");
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: savingPassword }] = useChangePasswordMutation();

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    },
  });

  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  async function onProfileSave(values: ProfileForm) {
    try {
      await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
      }).unwrap();
      dispatch(
        updateUser({
          ...user!,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber || undefined,
          dateOfBirth: values.dateOfBirth || undefined,
        })
      );
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  }

  async function onPasswordSave(values: PasswordForm) {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      resetPassword();
      toast.success("Password changed");
    } catch {
      toast.error("Current password is incorrect");
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-800">My Profile</h1>

      {/* Identity summary */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="avatar"
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <User size={24} />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-800">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {user?.roles.map((r) => (
              <span
                key={r}
                className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Profile info form */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Account Information</h2>
        <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">First Name</label>
              <input
                {...regProfile("firstName")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              {profileErrors.firstName && (
                <p className="mt-1 text-xs text-red-500">{profileErrors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Last Name</label>
              <input
                {...regProfile("lastName")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              {profileErrors.lastName && (
                <p className="mt-1 text-xs text-red-500">{profileErrors.lastName.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Phone Number</label>
              <input
                {...regProfile("phoneNumber")}
                placeholder="Optional"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Date of Birth</label>
              <input
                type="date"
                {...regProfile("dateOfBirth")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-md bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Change password form */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Change Password</h2>
        <form onSubmit={handlePasswordSubmit(onPasswordSave)} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Current Password</label>
            <input
              type="password"
              {...regPassword("currentPassword")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">New Password</label>
              <input
                type="password"
                {...regPassword("newPassword")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Confirm New Password</label>
              <input
                type="password"
                {...regPassword("confirmPassword")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-md bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {savingPassword ? "Saving…" : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

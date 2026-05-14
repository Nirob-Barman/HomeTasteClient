import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Calendar, Shield, ShieldOff, Plus, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  useGetUserByIdQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useAssignRoleMutation,
  useRemoveRoleMutation,
} from "@/features/admin/adminApi";
import { USER_ROLES, type TRole } from "@/constants/roles";
import { PATHS } from "@/routes/paths";
import { cn } from "@/utils/cn";

const ALL_ROLES: TRole[] = [
  USER_ROLES.CUSTOMER,
  USER_ROLES.DELIVERY_PERSONNEL,
];

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700 border-purple-200",
  Customer: "bg-blue-100 text-blue-700 border-blue-200",
  DeliveryPersonnel: "bg-green-100 text-green-700 border-green-200",
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-gray-400">{icon}</span>
      <span className="w-24 shrink-0 text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value ?? "—"}</span>
    </div>
  );
}

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [pendingRole, setPendingRole] = useState<TRole | null>(null);

  const { data, isLoading } = useGetUserByIdQuery(userId!, { skip: !userId });
  const [banUser, { isLoading: banning }] = useBanUserMutation();
  const [unbanUser, { isLoading: unbanning }] = useUnbanUserMutation();
  const [assignRole, { isLoading: assigning }] = useAssignRoleMutation();
  const [removeRole, { isLoading: removing }] = useRemoveRoleMutation();

  const user = data?.data;
  const isAdmin = user?.roles.includes("Admin") ?? false;
  const hasExistingRole = (user?.roles.filter((r) => r !== "Admin").length ?? 0) > 0;
  const assignableRoles = ALL_ROLES.filter((r) => !user?.roles.includes(r));

  async function handleBanToggle() {
    if (!user) return;
    try {
      if (user.isLocked) {
        await unbanUser(user.id).unwrap();
        toast.success("User unbanned");
      } else {
        await banUser({ userId: user.id }).unwrap();
        toast.success("User banned");
      }
    } catch {
      toast.error("Action failed");
    }
  }

  function requestRoleAssign(role: TRole) {
    if (!user) return;
    if (hasExistingRole) {
      // Show replace confirmation
      setPendingRole(role);
      setShowRoleSelect(false);
    } else {
      doAssignRole(role);
    }
  }

  async function doAssignRole(role: TRole) {
    if (!user) return;
    try {
      // Remove all existing roles first (replace, not add)
      for (const existing of user.roles) {
        await removeRole({ userId: user.id, roleName: existing }).unwrap();
      }
      await assignRole({ userId: user.id, roleName: role }).unwrap();
      toast.success(`Role changed to "${role}"`);
      setPendingRole(null);
      setShowRoleSelect(false);
    } catch {
      toast.error("Failed to change role");
      setPendingRole(null);
    }
  }

  async function handleRemoveRole(role: TRole) {
    if (!user) return;
    try {
      await removeRole({ userId: user.id, roleName: role }).unwrap();
      toast.success(`Role "${role}" removed`);
    } catch {
      toast.error("Failed to remove role");
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-gray-100" />
        <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-400">
        User not found.{" "}
        <Link to={PATHS.ADMIN.USERS} className="text-orange-500 hover:underline">
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      {/* Back */}
      <button
        onClick={() => navigate(PATHS.ADMIN.USERS)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={15} /> Back to Users
      </button>

      {/* Profile card */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <User size={24} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {user.firstName} {user.lastName}
              </h2>
              <span className={cn(
                "mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                user.isLocked ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
              )}>
                {user.isLocked ? "Banned" : "Active"}
              </span>
            </div>
          </div>

          {!isAdmin && (
            <button
              onClick={handleBanToggle}
              disabled={banning || unbanning}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
                user.isLocked
                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              )}
            >
              {user.isLocked ? <><ShieldOff size={14} /> Unban</> : <><Shield size={14} /> Ban</>}
            </button>
          )}
        </div>

        <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
          <InfoRow icon={<Mail size={15} />} label="Email" value={user.email} />
          <InfoRow icon={<Phone size={15} />} label="Phone" value={user.phoneNumber} />
          <InfoRow
            icon={<Calendar size={15} />}
            label="Date of Birth"
            value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : null}
          />
        </div>
      </div>

      {/* Roles card */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Role</h3>
          {assignableRoles.length > 0 && (
            <button
              onClick={() => { setShowRoleSelect((v) => !v); setPendingRole(null); }}
              className="flex items-center gap-1 rounded-md bg-orange-50 px-2.5 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-100"
            >
              <Plus size={13} />
              {hasExistingRole ? "Change Role" : "Assign Role"}
            </button>
          )}
        </div>

        {/* Role picker */}
        {showRoleSelect && (
          <div className="mb-4 flex flex-wrap gap-2">
            {assignableRoles.map((role) => (
              <button
                key={role}
                onClick={() => requestRoleAssign(role)}
                disabled={assigning || removing}
                className="rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:border-orange-400 hover:text-orange-600 disabled:opacity-50"
              >
                {hasExistingRole ? `→ ${role}` : `+ ${role}`}
              </button>
            ))}
          </div>
        )}

        {/* Replace confirmation */}
        {pendingRole && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-amber-800">Replace role?</p>
                <p className="mt-0.5 text-amber-700">
                  This user already has the role{" "}
                  <strong>{user.roles.filter((r) => r !== "Admin").join(", ")}</strong>.
                  Assigning <strong>{pendingRole}</strong> will replace it.
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <button
                onClick={() => setPendingRole(null)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => doAssignRole(pendingRole)}
                disabled={assigning || removing}
                className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {assigning || removing ? "Replacing…" : "Replace Role"}
              </button>
            </div>
          </div>
        )}

        {/* Current roles */}
        <div className="flex flex-wrap gap-2">
          {user.roles.filter((r) => r !== "Admin").length === 0 ? (
            <span className="text-sm text-gray-400">No role assigned</span>
          ) : (
            user.roles.filter((r) => r !== "Admin").map((role) => (
              <span
                key={role}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                  ROLE_COLORS[role] ?? "bg-gray-100 text-gray-600 border-gray-200"
                )}
              >
                {role}
                <button
                  onClick={() => handleRemoveRole(role as TRole)}
                  disabled={removing}
                  className="rounded-full hover:text-red-500 disabled:opacity-50"
                  title={`Remove ${role}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

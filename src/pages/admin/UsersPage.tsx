import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Shield, ShieldOff, User, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  useGetUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
} from "@/features/admin/adminApi";
import { PATHS } from "@/routes/paths";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700",
  Customer: "bg-blue-100 text-blue-700",
  DeliveryPersonnel: "bg-green-100 text-green-700",
};

export default function UsersPage() {
  usePageTitle("Users");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isFetching } = useGetUsersQuery({
    pageNumber: page,
    pageSize: 20,
    search: search || undefined,
  });

  const [banUser, { isLoading: banning }] = useBanUserMutation();
  const [unbanUser, { isLoading: unbanning }] = useUnbanUserMutation();

  const users = (data?.data?.data ?? []).filter(
    (u) => !(u.roles ?? []).some((r) => r.toLowerCase() === "admin")
  );
  const meta = data?.data?.metaData;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function handleBan(userId: string, isLocked: boolean) {
    try {
      if (isLocked) {
        await unbanUser(userId).unwrap();
        toast.success("User unbanned");
      } else {
        await banUser({ userId }).unwrap();
        toast.success("User banned");
      }
    } catch {
      toast.error("Action failed. Please try again.");
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Users</h1>
          {meta && (
            <p className="mt-0.5 text-sm text-gray-500">
              {meta.totalCount} total users
            </p>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email…"
              className="w-64 rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={cn(
                    "transition-colors hover:bg-gray-50",
                    isFetching && "opacity-60"
                  )}
                >
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <User size={15} />
                        )}
                      </div>
                      <span className="font-medium text-gray-800">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>

                  {/* Roles */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span
                            key={role}
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              ROLE_COLORS[role] ?? "bg-gray-100 text-gray-600"
                            )}
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        user.isLocked
                          ? "bg-red-100 text-red-600"
                          : "bg-emerald-100 text-emerald-600"
                      )}
                    >
                      {user.isLocked ? "Banned" : "Active"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={PATHS.ADMIN.USER_DETAIL.replace(":userId", user.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        <Eye size={13} /> View
                      </Link>
                    {user.roles.includes("Admin") ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <button
                        onClick={() => handleBan(user.id, user.isLocked)}
                        disabled={banning || unbanning}
                        title={user.isLocked ? "Unban user" : "Ban user"}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                          user.isLocked
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        )}
                      >
                        {user.isLocked ? (
                          <><ShieldOff size={13} /> Unban</>
                        ) : (
                          <><Shield size={13} /> Ban</>
                        )}
                      </button>
                    )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Page {meta.pageNumber} of {meta.totalPages} — {meta.currentPageCount} of {meta.totalCount} users
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={meta.isFirstPage}
              className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - meta.pageNumber) <= 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "min-w-[32px] rounded-md border px-2 py-1 text-xs",
                    p === meta.pageNumber
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={meta.isLastPage}
              className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { Outlet } from "react-router-dom";
import { Logo } from "@/components/shared/Logo";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}

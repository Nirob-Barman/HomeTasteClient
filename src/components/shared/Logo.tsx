import { UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed, className }: LogoProps) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
        <UtensilsCrossed size={18} />
      </div>
      {!collapsed && (
        <span className="text-lg font-bold text-gray-800">HomeTaste</span>
      )}
    </Link>
  );
}

import { Link } from "react-router-dom";
import { PATHS } from "@/routes/paths";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-lg text-gray-500">Page not found</p>
      <Link
        to={PATHS.HOME}
        className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
      >
        Back to Home
      </Link>
    </div>
  );
}

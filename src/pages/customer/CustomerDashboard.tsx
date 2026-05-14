import { usePageTitle } from "@/utils/usePageTitle";

export default function CustomerDashboard() {
  usePageTitle("Dashboard");
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800">
        Customer Dashboard
      </h1>
      <p className="mt-2 text-gray-500">Explore meals and track your orders.</p>
    </div>
  );
}

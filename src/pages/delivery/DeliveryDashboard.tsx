import { usePageTitle } from "@/utils/usePageTitle";

export default function DeliveryDashboard() {
  usePageTitle("Dashboard");
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800">
        Delivery Dashboard
      </h1>
      <p className="mt-2 text-gray-500">View and manage your assignments.</p>
    </div>
  );
}

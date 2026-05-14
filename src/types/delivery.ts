export type TDeliveryStatus = 1 | 2 | 3 | 4;

export const DELIVERY_STATUS = {
  Assigned: 1,
  PickedUp: 2,
  Delivered: 3,
  Failed: 4,
} as const;

export const DELIVERY_STATUS_LABEL: Record<TDeliveryStatus, string> = {
  1: "Assigned",
  2: "Picked Up",
  3: "Delivered",
  4: "Failed",
};

export const DELIVERY_STATUS_COLOR: Record<TDeliveryStatus, string> = {
  1: "bg-blue-100 text-blue-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-emerald-100 text-emerald-700",
  4: "bg-red-100 text-red-600",
};

export interface TDeliveryPersonnel {
  id: string;
  userId: string | null;
  fullName: string | null;
  phone: string | null;
  vehicleType: string | null;
  vehicleNumber: string | null;
  isAvailable: boolean;
  currentLatitude: number | null;
  currentLongitude: number | null;
  rating: number;
  totalDeliveries: number;
  createdAt: string | null;
}

export interface TDeliveryAssignment {
  id: string;
  orderId: string;
  deliveryPersonnelId: string;
  deliveryPersonnelName: string | null;
  status: TDeliveryStatus;
  statusLabel: string | null;
  assignedAt: string;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  notes: string | null;
}

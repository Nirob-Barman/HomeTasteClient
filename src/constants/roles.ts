export const USER_ROLES = {
  ADMIN: "Admin",
  CUSTOMER: "Customer",
  DELIVERY_PERSONNEL: "DeliveryPersonnel",
} as const;

export type TRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

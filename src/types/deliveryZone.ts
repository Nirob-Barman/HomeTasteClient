export interface TDeliveryZone {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  allowedCities: string[];
  allowedPostalCodes: string[];
}

export interface TServiceability {
  isServiceable: boolean;
  zoneName: string | null;
  message: string | null;
}

export interface TInventoryItem {
  id: string;
  name: string | null;
  stockCount: number;
  price: number;
}

export interface TAddInventoryItemRequest {
  name: string;
  stockCount: number;
  price: number;
}

export interface TUpdateInventoryItemRequest {
  stockCount: number;
  price?: number;
}

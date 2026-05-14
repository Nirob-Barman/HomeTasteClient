export interface TMeal {
  id: string;
  name: string | null;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string | null;
}

export interface TMealCategory {
  id: string;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
}

export interface CreateMealRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  image?: File;
}

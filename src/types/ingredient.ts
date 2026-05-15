export interface TIngredient {
  id: string;
  name: string | null;
  description: string | null;
  isAllergen: boolean;
  imageUrl: string | null;
}

export interface TCreateIngredientRequest {
  name: string;
  description?: string;
  isAllergen: boolean;
}

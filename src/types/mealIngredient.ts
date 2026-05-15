export interface TMealIngredient {
  id: string;
  mealId: string;
  mealName: string | null;
  ingredientId: string;
  ingredientName: string | null;
  quantity: number;
  unitId: string;
  unitName: string | null;
}

export interface TCreateMealIngredientRequest {
  mealId: string;
  ingredientId: string;
  quantity: number;
  unitId: string;
}

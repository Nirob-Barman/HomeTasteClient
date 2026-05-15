export type TCustomizationOptionType = 1 | 2 | 3;

export const CUSTOMIZATION_TYPE_LABEL: Record<TCustomizationOptionType, string> = {
  1: "Add-On",
  2: "Removal",
  3: "Substitution",
};

export interface TMealCustomization {
  id: string;
  mealId: string;
  mealName: string | null;
  name: string | null;
  additionalPrice: number;
  isAvailable: boolean;
  optionType: TCustomizationOptionType;
  createdAt: string | null;
}

export interface TCreateMealCustomizationRequest {
  mealId: string;
  name: string;
  additionalPrice: number;
  isAvailable: boolean;
  optionType: TCustomizationOptionType;
}

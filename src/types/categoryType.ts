export interface TCategoryType {
  id: string;
  name: string | null;
  description: string | null;
}

export interface TCreateCategoryTypeRequest {
  name: string;
  description?: string;
}

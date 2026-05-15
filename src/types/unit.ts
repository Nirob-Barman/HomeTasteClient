export interface TUnit {
  id: string;
  name: string | null;
  abbreviation: string | null;
}

export interface TCreateUnitRequest {
  name: string;
  abbreviation: string;
}

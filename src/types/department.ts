export interface TDepartment {
  id: string;
  name: string | null;
  description: string | null;
}

export interface TCreateDepartmentRequest {
  name: string;
  description?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

export interface PaginationMeta {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  currentPageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T;
  metaData: PaginationMeta;
}

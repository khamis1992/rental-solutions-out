
// Generic API response structure
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  timestamp: string;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

// Error response
export interface ErrorResponse {
  message: string;
  code: string;
  details?: any;
  timestamp: string;
}

// Query parameters for API requests
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

// Filter options for data fetching
export interface FilterOptions {
  [key: string]: string | number | boolean | string[] | number[] | undefined;
}

// Sort options
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// API request options
export interface RequestOptions {
  filters?: FilterOptions;
  sort?: SortOption[];
  pagination?: {
    page: number;
    pageSize: number;
  };
  includes?: string[];
  select?: string[];
}

// API mutation response
export interface MutationResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  timestamp: string;
  affected_rows?: number;
}

// API batch operation response
export interface BatchOperationResponse {
  success: boolean;
  failed: number;
  succeeded: number;
  errors: ErrorResponse[];
}

// Webhook payload type
export interface WebhookPayload<T> {
  event: string;
  timestamp: string;
  data: T;
  signature: string;
}

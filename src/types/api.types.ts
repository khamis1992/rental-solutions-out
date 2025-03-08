
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

// Vehicle API Endpoints
export interface VehicleEndpoints {
  getAll: () => Promise<ApiResponse<Vehicle[]>>;
  getById: (id: string) => Promise<ApiResponse<Vehicle>>;
  create: (vehicle: Partial<Vehicle>) => Promise<ApiResponse<Vehicle>>;
  update: (id: string, updates: Partial<Vehicle>) => Promise<ApiResponse<Vehicle>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  batchDelete: (ids: string[]) => Promise<BatchOperationResponse>;
  getDocuments: (vehicleId: string) => Promise<ApiResponse<VehicleDocument[]>>;
  uploadDocument: (vehicleId: string, document: FormData) => Promise<ApiResponse<VehicleDocument>>;
}

// Vehicle Filter Request
export interface VehicleFilterRequest {
  status?: string[];
  make?: string[];
  model?: string[];
  year?: number[];
  location?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

import { Vehicle, VehicleDocument } from './vehicle';

// Hook types for the vehicle endpoints
export interface UseVehicleQueryResult {
  vehicle?: Vehicle | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseVehicleListQueryResult {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  pagination?: PaginationMeta;
}

export interface UseVehicleStatusQueryResult {
  statusCounts: Record<string, number>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseVehicleMutationResult {
  mutate: (vehicle: Partial<Vehicle>) => Promise<ApiResponse<Vehicle>>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseVehicleDeleteMutationResult {
  mutate: (id: string) => Promise<ApiResponse<void>>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseBatchDeleteMutationResult {
  mutate: (ids: string[]) => Promise<BatchOperationResponse>;
  isLoading: boolean;
  error: Error | null;
}

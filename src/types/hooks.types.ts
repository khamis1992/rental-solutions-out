
import { DashboardConfig, DashboardStats } from './dashboard.types';
import { Vehicle, VehicleStatus } from './vehicle';
import { ApiResponse, PaginatedResponse, RequestOptions } from './api.types';

// Fetch hooks return types
export interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

// Dashboard stats hook
export interface UseDashboardStatsResult extends UseFetchResult<DashboardStats> {
  config: DashboardConfig;
  updateConfig: (config: Partial<DashboardConfig>) => void;
}

// Vehicle hooks
export interface UseVehiclesResult extends UseFetchResult<Vehicle[]> {
  vehicles: Vehicle[];
  filterByStatus: (status: VehicleStatus) => Vehicle[];
  countByStatus: Record<VehicleStatus, number>;
  findById: (id: string) => Vehicle | undefined;
}

export interface UseVehicleDetailsResult extends UseFetchResult<Vehicle> {
  vehicle: Vehicle | null;
  updateVehicle: (updates: Partial<Vehicle>) => Promise<Vehicle | null>;
}

// Subscription hooks
export interface UseDashboardSubscriptionsResult {
  lastUpdate: Date | null;
}

// Notifications hooks
export interface UseNotificationsResult {
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
}

// Activity hooks
export interface UseRecentActivityResult {
  activities: any[];
  isLoading: boolean;
  error: Error | null;
  fetchMore: () => Promise<void>;
  hasMore: boolean;
}

// Mobile detection hook
export interface UseIsMobileResult {
  isMobile: boolean;
}

// Theme hook
export interface UseThemeResult {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  systemTheme: 'light' | 'dark';
}

// API request hooks
export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<ApiResponse<TData>>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export interface UseInfiniteQueryResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<void>;
  isFetchingNextPage: boolean;
}

export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UsePaginatedQueryResult<T> extends UseQueryResult<T[]> {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  previousPage: () => void;
  nextPage: () => void;
}

// Vehicle form hook
export interface UseVehicleFormResult {
  open: boolean;
  setOpen: (open: boolean) => void;
  form: any; // Replace with proper react-hook-form type
  onSubmit: () => void;
}

// Vehicle table hooks
export interface UseVehicleTableResult {
  selectedVehicles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Vehicle status and location cell hooks
export interface UseEditableCellResult {
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  value: string;
  setValue: (value: string) => void;
  handleSave: () => Promise<void>;
}

// Form field hook
export interface UseFormFieldsResult<T> {
  register: any; // react-hook-form register function
  errors: Record<keyof T, { message: string }>;
  setValue: (name: keyof T, value: any) => void;
  watch: (name?: keyof T) => any;
  handleSubmit: (onSubmit: (data: T) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
}

// Debounce hook
export interface UseDebounceResult<T> {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  debouncedValue: T;
}

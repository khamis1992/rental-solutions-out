
// Date formatting types
export type DateFormat = 
  | 'short' // MM/DD/YYYY
  | 'medium' // MMM DD, YYYY
  | 'long' // MMMM DD, YYYY
  | 'iso' // YYYY-MM-DD
  | 'relative' // X days ago, today, etc.
  | 'time' // HH:MM AM/PM
  | 'datetime' // MMM DD, YYYY HH:MM AM/PM
  | 'custom'; // Custom format

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Event handler types
export type EventHandler<T = void> = () => T;
export type EventHandlerWithParam<P, T = void> = (param: P) => T;

// Modal/dialog props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Filter and sorting
export interface SortableColumn<T = string> {
  id: T;
  label: string;
  isSortable?: boolean;
}

export type SortDirection = 'asc' | 'desc';
export type SortState<T = string> = {
  column: T;
  direction: SortDirection;
} | null;

// Pagination types
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationHandlers {
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// Toast/notification types
export type ToastType = 'info' | 'success' | 'warning' | 'error';
export interface ToastOptions {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  }
}

// Theme and style types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'primary' | 'secondary' | 'accent' | 'neutral' | 'success' | 'warning' | 'error' | 'info';

// Form utility types
export type ValidationRule = {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
};

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'date' | 'textarea';
  placeholder?: string;
  options?: Array<{value: string; label: string}>;
  validation?: ValidationRule[];
  defaultValue?: any;
}

// Common component props
export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithDisabled {
  disabled?: boolean;
}

export interface WithLoading {
  isLoading?: boolean;
}

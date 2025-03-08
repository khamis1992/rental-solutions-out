
import { ReactNode } from 'react';

// Common props for all components
export interface BaseComponentProps {
  className?: string;
  id?: string;
  "data-testid"?: string;
}

// Toast/Notification
export interface ToastProps extends BaseComponentProps {
  title?: string;
  description: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: ReactNode;
  onClose?: () => void;
}

// Modal/Dialog
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  closeOnClickOutside?: boolean;
  maxWidth?: string;
  position?: 'center' | 'top';
}

// Card
export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  hoverable?: boolean;
  compact?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  onClick?: () => void;
}

// Tooltip
export interface TooltipProps extends BaseComponentProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Button
export interface ButtonProps extends BaseComponentProps {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

// Badge
export interface BadgeProps extends BaseComponentProps {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'destructive' | 'success' | 'warning' | 'info';
  size?: 'default' | 'sm' | 'lg';
}

// Loading/Skeleton
export interface SkeletonProps extends BaseComponentProps {
  variant?: 'default' | 'circular' | 'rectangular' | 'text';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

// Error boundary
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, info: { componentStack: string }) => void;
}

// Loading state
export interface LoadingStateProps extends BaseComponentProps {
  children?: ReactNode;
  spinner?: ReactNode;
  text?: string;
  size?: 'sm' | 'default' | 'lg';
  fullScreen?: boolean;
  transparent?: boolean;
}

// Empty state
export interface EmptyStateProps extends BaseComponentProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

// Avatar
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  fallback?: ReactNode;
}

// Tab
export interface TabProps extends BaseComponentProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

// Tabs
export interface TabsProps extends BaseComponentProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'outline' | 'pills';
}

// Pagination
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblings?: number;
  boundaries?: number;
  size?: 'sm' | 'default' | 'lg';
}

// Theme
export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}


import { toast } from "sonner";
import { ApiResponse } from "../services/apiService";

// Helper function to handle API responses
export function handleApiResponse<T>(
  response: ApiResponse<T>,
  {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true,
  }: {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    successMessage?: string;
    errorMessage?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
  } = {}
): ApiResponse<T> {
  if (response.success && response.data) {
    if (showSuccessToast && successMessage) {
      toast.success(successMessage);
    }
    if (onSuccess) {
      onSuccess(response.data);
    }
  } else if (!response.success) {
    if (showErrorToast) {
      toast.error(errorMessage || response.error?.message || "An error occurred");
    }
    if (onError) {
      onError(response.error);
    }
  }
  return response;
}

// Helper function to format error messages
export function formatErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.error?.message) {
    return error.error.message;
  }

  return "An unexpected error occurred";
}

// Helper function to convert pagination params from URL query
export function parsePaginationFromQuery(query: URLSearchParams) {
  return {
    page: query.has("page") ? Number(query.get("page")) : 1,
    pageSize: query.has("pageSize") ? Number(query.get("pageSize")) : 20,
  };
}

// Helper function to convert filter params from URL query
export function parseFiltersFromQuery(query: URLSearchParams, allowedFilters: string[]) {
  const filters: Record<string, any> = {};
  
  allowedFilters.forEach(filter => {
    if (query.has(filter)) {
      filters[filter] = query.get(filter);
    }
  });
  
  return filters;
}

// Helper function for updating query parameters
export function updateQueryParams(
  currentQuery: URLSearchParams,
  updates: Record<string, string | number | null>
): URLSearchParams {
  const newQuery = new URLSearchParams(currentQuery.toString());
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      newQuery.delete(key);
    } else {
      newQuery.set(key, String(value));
    }
  });
  
  return newQuery;
}

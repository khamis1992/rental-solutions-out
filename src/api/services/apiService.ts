
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types for pagination and filtering
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface FilterParams {
  searchQuery?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Base API service class
class ApiService {
  private handleError(error: any): ApiResponse<null> {
    console.error("API Error:", error);
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: {
        code: "server_error",
        message: "An unexpected error occurred"
      }
    };

    // Check for specific error types from Supabase
    if (error.code) {
      switch (error.code) {
        case "PGRST116":
          errorResponse.error = {
            code: "resource_not_found",
            message: "The requested resource does not exist"
          };
          break;
        case "42501":
          errorResponse.error = {
            code: "insufficient_permissions",
            message: "You don't have permission to access this resource"
          };
          break;
        case "23505":
          errorResponse.error = {
            code: "duplicate_entry",
            message: "A record with this information already exists"
          };
          break;
        default:
          errorResponse.error = {
            code: "server_error",
            message: error.message || "An unexpected error occurred",
            details: error.details || undefined
          };
      }
    }

    toast.error(errorResponse.error.message);
    return errorResponse;
  }

  // Generic GET method with pagination and filtering
  protected async get<T>(
    endpoint: string,
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    try {
      let query = supabase.from(endpoint).select("*", { count: "exact" });

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (key === "searchQuery" && value) {
              // Implement search logic based on the endpoint
              // Example for customers
              if (endpoint === "profiles") {
                query = query.or(
                  `full_name.ilike.%${value}%,phone_number.ilike.%${value}%,email.ilike.%${value}%`
                );
              }
              // Example for vehicles
              else if (endpoint === "vehicles") {
                query = query.or(
                  `make.ilike.%${value}%,model.ilike.%${value}%,license_plate.ilike.%${value}%`
                );
              }
            } else if (key === "startDate" && value) {
              query = query.gte("created_at", value);
            } else if (key === "endDate" && value) {
              query = query.lte("created_at", value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply pagination
      if (pagination) {
        const { page = 1, pageSize = 20 } = pagination;
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        query = query.range(start, end);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const { page = 1, pageSize = 20 } = pagination || {};
      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / pageSize);

      return {
        success: true,
        data: {
          items: data as T[],
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          }
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // GET a single item by ID
  protected async getById<T>(endpoint: string, id: string): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(endpoint)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // POST method for creating resources
  protected async post<T, R>(endpoint: string, payload: T): Promise<ApiResponse<R>> {
    try {
      const { data, error } = await supabase
        .from(endpoint)
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as R
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // PUT method for updating resources
  protected async put<T, R>(
    endpoint: string,
    id: string,
    payload: Partial<T>
  ): Promise<ApiResponse<R>> {
    try {
      const { data, error } = await supabase
        .from(endpoint)
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as R
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // DELETE method
  protected async delete(endpoint: string, id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.from(endpoint).delete().eq("id", id);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Call Supabase Edge Function
  protected async callFunction<T, R>(
    functionName: string,
    payload?: T
  ): Promise<ApiResponse<R>> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) throw error;

      return {
        success: true,
        data: data as R
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default ApiService;

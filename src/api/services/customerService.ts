
import ApiService, { PaginationParams, FilterParams, ApiResponse, PaginatedResponse } from "./apiService";
import type { Customer } from "@/components/customers/types/customer";

class CustomerService extends ApiService {
  // Get a paginated list of customers
  async getCustomers(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    return this.get<Customer>("profiles", pagination, {
      ...filters,
      role: "customer" // Only fetch profiles with role='customer'
    });
  }

  // Get a single customer by ID
  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    return this.getById<Customer>("profiles", id);
  }

  // Create a new customer
  async createCustomer(customer: Omit<Customer, "id" | "created_at">): Promise<ApiResponse<Customer>> {
    return this.post<Omit<Customer, "id" | "created_at">, Customer>("profiles", {
      ...customer,
      role: "customer"
    });
  }

  // Update an existing customer
  async updateCustomer(id: string, customer: Partial<Customer>): Promise<ApiResponse<Customer>> {
    return this.put<Partial<Customer>, Customer>("profiles", id, customer);
  }

  // Delete a customer
  async deleteCustomer(id: string): Promise<ApiResponse<null>> {
    // First check if customer can be deleted using the database function
    const { data, error } = await this.callFunction<{ customer_id: string }, boolean>(
      "can-delete-customer",
      { customer_id: id }
    );

    if (!data) {
      return {
        success: false,
        error: {
          code: "operation_not_allowed",
          message: "Cannot delete customer with active agreements"
        }
      };
    }

    return this.delete("profiles", id);
  }
}

export default new CustomerService();

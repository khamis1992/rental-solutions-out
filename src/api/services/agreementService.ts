
import ApiService, { PaginationParams, FilterParams, ApiResponse, PaginatedResponse } from "./apiService";
import { Agreement } from "@/types/agreement.types";

class AgreementService extends ApiService {
  // Get a paginated list of agreements
  async getAgreements(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<Agreement>>> {
    return this.get<Agreement>("leases", pagination, filters);
  }

  // Get a single agreement by ID
  async getAgreementById(id: string): Promise<ApiResponse<Agreement>> {
    return this.getById<Agreement>("leases", id);
  }

  // Create a new agreement
  async createAgreement(agreement: Omit<Agreement, "id" | "created_at">): Promise<ApiResponse<Agreement>> {
    return this.post<Omit<Agreement, "id" | "created_at">, Agreement>("leases", agreement);
  }

  // Update an existing agreement
  async updateAgreement(id: string, agreement: Partial<Agreement>): Promise<ApiResponse<Agreement>> {
    return this.put<Partial<Agreement>, Agreement>("leases", id, agreement);
  }

  // Delete an agreement
  async deleteAgreement(id: string): Promise<ApiResponse<null>> {
    return this.delete("leases", id);
  }

  // Get agreements for a specific customer
  async getCustomerAgreements(
    customerId: string,
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<Agreement>>> {
    return this.get<Agreement>("leases", pagination, {
      ...filters,
      customer_id: customerId
    });
  }

  // Get agreements for a specific vehicle
  async getVehicleAgreements(
    vehicleId: string,
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<Agreement>>> {
    return this.get<Agreement>("leases", pagination, {
      ...filters,
      vehicle_id: vehicleId
    });
  }

  // Generate a PDF contract for an agreement
  async generateAgreementPDF(agreementId: string): Promise<ApiResponse<{ url: string }>> {
    return this.callFunction<{ agreement_id: string }, { url: string }>(
      "generate-agreement-pdf",
      { agreement_id: agreementId }
    );
  }

  // Process agreement templates
  async processAgreementTemplates(): Promise<ApiResponse<{ processed: number, failed: number }>> {
    return this.callFunction<null, { processed: number, failed: number }>(
      "process-agreement-templates",
      null
    );
  }
}

export default new AgreementService();

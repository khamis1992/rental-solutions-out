
import ApiService, { PaginationParams, FilterParams, ApiResponse, PaginatedResponse } from "./apiService";
import { Vehicle } from "@/types/vehicle.types";

class VehicleService extends ApiService {
  // Get a paginated list of vehicles
  async getVehicles(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<Vehicle>>> {
    return this.get<Vehicle>("vehicles", pagination, filters);
  }

  // Get a single vehicle by ID
  async getVehicleById(id: string): Promise<ApiResponse<Vehicle>> {
    return this.getById<Vehicle>("vehicles", id);
  }

  // Create a new vehicle
  async createVehicle(vehicle: Omit<Vehicle, "id" | "created_at">): Promise<ApiResponse<Vehicle>> {
    return this.post<Omit<Vehicle, "id" | "created_at">, Vehicle>("vehicles", vehicle);
  }

  // Update an existing vehicle
  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    return this.put<Partial<Vehicle>, Vehicle>("vehicles", id, vehicle);
  }

  // Delete a vehicle
  async deleteVehicle(id: string): Promise<ApiResponse<null>> {
    // First check if vehicle can be deleted (not in use)
    const { data: vehicleInUse } = await this.callFunction<{ vehicle_id: string }, boolean>(
      "is-vehicle-in-use",
      { vehicle_id: id }
    );

    if (vehicleInUse) {
      return {
        success: false,
        error: {
          code: "operation_not_allowed",
          message: "Cannot delete vehicle that is currently in use"
        }
      };
    }

    return this.delete("vehicles", id);
  }

  // Get available vehicles for rental
  async getAvailableVehicles(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<Vehicle>>> {
    return this.get<Vehicle>("vehicles", pagination, {
      ...filters,
      status: "available"
    });
  }
}

export default new VehicleService();

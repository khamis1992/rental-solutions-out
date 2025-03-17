
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { toast } from "sonner";

/**
 * Updates the location of a vehicle
 * @param vehicleId - The ID of the vehicle to update
 * @param location - The new location
 * @returns The updated vehicle or null if the update failed
 */
export async function updateVehicleLocation(vehicleId: string, location: string): Promise<Vehicle | null> {
  try {
    // Validate inputs
    if (!vehicleId) throw new Error("Vehicle ID is required");
    if (!location.trim()) throw new Error("Location cannot be empty");
    
    console.log(`Updating location for vehicle ${vehicleId} to "${location}"`);
    
    // First check if vehicle exists
    const { data: existingVehicle, error: checkError } = await supabase
      .from("vehicles")
      .select("id, license_plate, location")
      .eq("id", vehicleId)
      .single();
      
    if (checkError) {
      console.error("Error verifying vehicle:", checkError);
      throw new Error(`Vehicle verification failed: ${checkError.message}`);
    }
    
    console.log("Current vehicle data:", existingVehicle);
    
    // Update the location
    const { data, error } = await supabase
      .from("vehicles")
      .update({ 
        location: location.trim(),
        updated_at: new Date().toISOString()
      })
      .eq("id", vehicleId)
      .select();

    if (error) {
      console.error("Error updating vehicle location:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned from update operation");
    }
    
    console.log("Location update success:", data[0]);
    return data[0] as Vehicle;
  } catch (error: any) {
    console.error("Failed to update vehicle location:", error);
    toast.error(`Failed to update location: ${error.message || "Unknown error"}`);
    return null;
  }
}

/**
 * Updates the status of a vehicle
 * @param vehicleId - The ID of the vehicle to update
 * @param status - The new status
 * @returns The updated vehicle or null if the update failed
 */
export async function updateVehicleStatus(vehicleId: string, status: VehicleStatus): Promise<Vehicle | null> {
  try {
    // Validate inputs
    if (!vehicleId) throw new Error("Vehicle ID is required");
    if (!status) throw new Error("Status is required");
    
    // Update the status
    const { data, error } = await supabase
      .from("vehicles")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", vehicleId)
      .select();

    if (error) {
      console.error("Error updating vehicle status:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned from update operation");
    }
    
    return data[0] as Vehicle;
  } catch (error: any) {
    console.error("Failed to update vehicle status:", error);
    toast.error(`Failed to update status: ${error.message || "Unknown error"}`);
    return null;
  }
}

/**
 * Gets a vehicle by ID
 * @param vehicleId - The ID of the vehicle to fetch
 * @returns The vehicle or null if not found
 */
export async function getVehicleById(vehicleId: string): Promise<Vehicle | null> {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", vehicleId)
      .single();

    if (error) {
      console.error("Error fetching vehicle:", error);
      throw error;
    }
    
    return data as Vehicle;
  } catch (error) {
    console.error("Failed to fetch vehicle:", error);
    return null;
  }
}

/**
 * Gets a vehicle by license plate
 * @param licensePlate - The license plate to search for
 * @returns The vehicle or null if not found
 */
export async function getVehicleByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("license_plate", licensePlate)
      .single();

    if (error) {
      console.error("Error fetching vehicle by license plate:", error);
      throw error;
    }
    
    return data as Vehicle;
  } catch (error) {
    console.error("Failed to fetch vehicle by license plate:", error);
    return null;
  }
}

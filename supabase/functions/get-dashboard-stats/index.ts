
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Edge function: get-dashboard-stats called");
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      throw new Error("Supabase credentials are not configured correctly");
    }

    // Data object to store our results
    const results = {
      total_vehicles: 0,
      available_vehicles: 0,
      rented_vehicles: 0,
      maintenance_vehicles: 0,
      total_customers: 0,
      active_rentals: 0,
      monthly_revenue: 0
    };

    // Get total vehicles
    const { count: totalVehicles, error: totalVehiclesError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true });

    if (totalVehiclesError) {
      console.error("Error fetching total vehicles:", totalVehiclesError);
    } else {
      results.total_vehicles = totalVehicles || 0;
    }

    // Get available vehicles
    const { count: availableVehicles, error: availableVehiclesError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available');

    if (availableVehiclesError) {
      console.error("Error fetching available vehicles:", availableVehiclesError);
    } else {
      results.available_vehicles = availableVehicles || 0;
    }

    // Get rented vehicles
    const { count: rentedVehicles, error: rentedVehiclesError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rented');

    if (rentedVehiclesError) {
      console.error("Error fetching rented vehicles:", rentedVehiclesError);
    } else {
      results.rented_vehicles = rentedVehicles || 0;
    }

    // Get maintenance vehicles
    const { count: maintenanceVehicles, error: maintenanceVehiclesError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'maintenance');

    if (maintenanceVehiclesError) {
      console.error("Error fetching maintenance vehicles:", maintenanceVehiclesError);
    } else {
      results.maintenance_vehicles = maintenanceVehicles || 0;
    }

    // Get total customers
    const { count: totalCustomers, error: totalCustomersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    if (totalCustomersError) {
      console.error("Error fetching total customers:", totalCustomersError);
    } else {
      results.total_customers = totalCustomers || 0;
    }

    // Get active rentals
    const { count: activeRentals, error: activeRentalsError } = await supabase
      .from('leases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (activeRentalsError) {
      console.error("Error fetching active rentals:", activeRentalsError);
    } else {
      results.active_rentals = activeRentals || 0;
    }

    // Get monthly revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('unified_payments')
      .select('amount')
      .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .eq('status', 'completed');

    if (revenueError) {
      console.error("Error fetching monthly revenue:", revenueError);
    } else {
      results.monthly_revenue = revenueData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    }

    console.log("Edge function: get-dashboard-stats completed successfully", results);

    return new Response(
      JSON.stringify(results),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in get-dashboard-stats:', error);
    // Return a valid data structure with zeros to prevent client-side errors
    return new Response(
      JSON.stringify({
        total_vehicles: 0,
        available_vehicles: 0,
        rented_vehicles: 0,
        maintenance_vehicles: 0,
        total_customers: 0,
        active_rentals: 0,
        monthly_revenue: 0,
        error: error.message
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});


import { useQuery } from "@tanstack/react-query";
import { PreregisteredForm } from "@/components/sales/PreregisteredForm";
import { LeadList } from "@/components/sales/LeadList";
import { OnboardingList } from "@/components/sales/OnboardingList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { VehicleType } from "@/types/sales.types";

export default function Sales() {
  const { data: vehicleTypes = [] } = useQuery<VehicleType[]>({
    queryKey: ["vehicle-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_vehicle_types")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as VehicleType[];
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Management</h1>
      </div>

      <Tabs defaultValue="preregistered" className="w-full">
        <TabsList>
          <TabsTrigger value="preregistered">Preregistered</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="preregistered" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Create New Lead</h2>
              <PreregisteredForm vehicleTypes={vehicleTypes} />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Lead List</h2>
              <LeadList />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="onboarding">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Onboarding</h2>
            <OnboardingList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

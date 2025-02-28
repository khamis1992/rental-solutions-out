import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceCard } from "@/components/maintenance/MaintenanceCard";
import { MaintenanceTable } from "@/components/maintenance/MaintenanceTable";
import { ViewSwitcher } from "@/components/maintenance/ViewSwitcher";
import { MaintenanceRecord } from "@/types/maintenance";

const Maintenance = () => {
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select(`
          *,
          maintenance_categories (name),
          vehicle_parts (
            part_name,
            part_number,
            quantity,
            unit_cost
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance data:', error);
        throw error;
      }

      return data || [];
    }
  });

  useEffect(() => {
    const savedView = localStorage.getItem('maintenance-view');
    if (savedView === 'grid' || savedView === 'table') {
      setView(savedView);
    }
  }, []);

  const handleViewChange = (newView: 'grid' | 'table') => {
    setView(newView);
    localStorage.setItem('maintenance-view', newView);
  };

  const renderContent = () => {
    if (view === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {maintenanceData?.map((maintenance: MaintenanceRecord) => (
            <MaintenanceCard key={maintenance.id} maintenance={maintenance} />
          ))}
        </div>
      );
    } else {
      return (
        <MaintenanceTable maintenanceData={maintenanceData || []} isLoading={isLoading} />
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold">Maintenance</h1>
          <ViewSwitcher view={view} onChange={handleViewChange} />
        </div>
        
        <div className="hidden">
          <MaintenanceList />
        </div>
        
        {isLoading ? (
          <div className="py-10 text-center">Loading maintenance data...</div>
        ) : (
          renderContent()
        )}
      </div>
    </DashboardLayout>
  );
};

export default Maintenance;

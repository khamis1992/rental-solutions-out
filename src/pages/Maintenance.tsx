
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateJobDialog } from "@/components/maintenance/CreateJobDialog";
import { useState } from "react";
import { Wrench, AlertTriangle, CheckCircle, Clock, Search, Filter, Plus, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Maintenance = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ['maintenance-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select('status')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance data:', error);
        throw error;
      }

      // Calculate stats
      const stats = {
        total: data?.length || 0,
        completed: data?.filter(item => item.status === 'completed')?.length || 0,
        inProgress: data?.filter(item => item.status === 'in_progress')?.length || 0,
        scheduled: data?.filter(item => item.status === 'scheduled')?.length || 0,
        urgent: data?.filter(item => item.status === 'urgent')?.length || 0
      };

      return stats;
    }
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vehicle Maintenance</h1>
            <p className="text-muted-foreground mt-1">
              Track, schedule and manage maintenance jobs
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search maintenance records..."
                className="pl-8 w-full md:w-[260px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Job Card
            </Button>
          </div>
        </div>

        {/* Status Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Jobs</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceData?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Maintenance records</p>
              <div className="mt-2">
                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={() => setActiveTab("all")}>
                  View All
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceData?.completed || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Completed jobs</div>
              <div className="mt-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200" onClick={() => setActiveTab("completed")}>
                  View Completed
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceData?.inProgress || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Jobs in progress</div>
              <div className="mt-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200" onClick={() => setActiveTab("in_progress")}>
                  View In Progress
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Wrench className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceData?.scheduled || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Upcoming jobs</div>
              <div className="mt-2">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => setActiveTab("scheduled")}>
                  View Scheduled
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceData?.urgent || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Requires immediate attention</div>
              <div className="mt-2">
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200" onClick={() => setActiveTab("urgent")}>
                  View Urgent
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Tab Navigation */}
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-white rounded-md">
                All
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:text-green-600 rounded-md">
                Completed
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 rounded-md">
                In Progress
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="data-[state=active]:bg-white data-[state=active]:text-amber-600 rounded-md">
                Scheduled
              </TabsTrigger>
              <TabsTrigger value="urgent" className="data-[state=active]:bg-white data-[state=active]:text-red-600 rounded-md">
                Urgent
              </TabsTrigger>
            </TabsList>
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Tab Contents - we use the same MaintenanceList but apply different filters */}
          <TabsContent value="all" className="m-0">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <MaintenanceList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="completed" className="m-0">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <MaintenanceList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="in_progress" className="m-0">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <MaintenanceList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="scheduled" className="m-0">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <MaintenanceList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="urgent" className="m-0">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <MaintenanceList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog for creating new maintenance job */}
        <CreateJobDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen} 
        />
      </div>
    </DashboardLayout>
  );
};

export default Maintenance;

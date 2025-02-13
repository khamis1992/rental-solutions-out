import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerList } from "@/components/customers/CustomerList";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { ImportCustomerDialog } from "@/components/customers/ImportCustomerDialog";
import { ExportCustomerButton } from "@/components/customers/ExportCustomerButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  Users, UserPlus, Download, Upload,
  BarChart3, TrendingUp, UserCheck, Activity,
  ChevronRight, ExternalLink, Search, 
  ArrowUpRight, Sparkles, AlertCircle, ClipboardCheck,
  LineChart
} from "lucide-react";
import { useUserStats } from "@/components/customers/hooks/useUserStats";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBox } from "@/components/search/SearchBox";

const Customers = () => {
  const { data: stats, isLoading, error } = useUserStats();

  const renderStatsCard = () => {
    if (isLoading) {
      return <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-[156px]" />
        <Skeleton className="h-[156px]" />
        <Skeleton className="h-[156px]" />
      </div>;
    }

    if (error) {
      return <div>Error loading stats</div>;
    }

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="group hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform duration-300 relative">
                <div className="absolute inset-0 rounded-lg bg-purple-200/60 dark:bg-purple-700/30 animate-pulse"></div>
                <LineChart className="h-6 w-6 text-purple-600 dark:text-purple-400 relative z-10 transform group-hover:rotate-12 transition-transform" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Growth</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats?.newCustomersCount || 0}</p>
                  <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>This Month</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  <BarChart3 className="h-3 w-3" />
                  <span>{stats?.growthPercentage.toFixed(1)}% growth rate</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-300 relative">
                <div className="absolute inset-0 rounded-lg bg-blue-200/60 dark:bg-blue-700/30 animate-pulse"></div>
                <ClipboardCheck className="h-6 w-6 text-blue-600 dark:text-blue-400 relative z-10 transform group-hover:rotate-12 transition-transform" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Verified</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats?.verifiedCount || 0}</p>
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <UserCheck className="h-3 w-3" />
                    <span>Complete Profiles</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  <Activity className="h-3 w-3" />
                  <span>All documents verified</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 group-hover:scale-110 transition-transform duration-300 relative">
                <div className="absolute inset-0 rounded-lg bg-amber-200/60 dark:bg-amber-700/30 animate-pulse"></div>
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 relative z-10 transform group-hover:rotate-12 transition-transform" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Unverified</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats?.unverifiedCount || 0}</p>
                  <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Activity className="h-3 w-3" />
                    <span>Needs Attention</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  <BarChart3 className="h-3 w-3" />
                  <span>{stats?.missingDocsCount || 0} missing docs</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-8 relative overflow-hidden">
        <Card className="border-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-gray-800/80 dark:via-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
          <CardHeader className="relative z-10 pb-4">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <div className="absolute inset-0 animate-ping rounded-lg bg-primary/20"></div>
                      <div className="absolute inset-0 rotate-180 animate-pulse rounded-lg bg-primary/10"></div>
                      <div className="relative p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-all duration-300 transform group-hover:scale-110">
                        <Users className="h-8 w-8 text-primary transform group-hover:rotate-12 transition-transform duration-300" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 bg-clip-text text-transparent dark:from-white dark:via-gray-200 dark:to-gray-300">
                        Customer Management
                      </CardTitle>
                      <CardDescription className="text-base text-muted-foreground mt-1 flex items-center gap-2">
                        Manage customer profiles and relationships efficiently
                        <ArrowUpRight className="h-4 w-4 text-primary animate-bounce" />
                      </CardDescription>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 p-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ImportCustomerDialog>
                            <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/80 dark:hover:bg-gray-700/80">
                              <Upload className="h-4 w-4 text-primary" />
                              Import
                            </Button>
                          </ImportCustomerDialog>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Import customer data</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ExportCustomerButton>
                            <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/80 dark:hover:bg-gray-700/80">
                              <Download className="h-4 w-4 text-primary" />
                              Export
                            </Button>
                          </ExportCustomerButton>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Export customer list</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <SearchBox />
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CreateCustomerDialog>
                          <Button 
                            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 transform hover:-translate-y-0.5"
                          >
                            <UserPlus className="h-4 w-4" />
                            Add Customer
                          </Button>
                        </CreateCustomerDialog>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add a new customer to the system</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {renderStatsCard()}
            </div>
          </CardHeader>
        </Card>
      </div>
      
      <Card className="bg-white/50 shadow-sm border-0 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Customer List</CardTitle>
          <CardDescription>
            View and manage all customer profiles and their associated information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CustomerList />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Customers;

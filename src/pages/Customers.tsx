
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  Users, UserPlus, Download, Upload, Filter,
  BarChart3, Wallet, TrendingUp, UserCheck, Activity,
  ChevronRight, ExternalLink, Search, CircleDollarSign,
  LineChart, UserCog, Trophy, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const Customers = () => {
  return (
    <DashboardLayout>
      {/* Enhanced 3D Layered Header with Animation */}
      <div className="mb-8 relative overflow-hidden rounded-xl">
        <Card className="border-0 bg-gradient-to-br from-[#9b87f5] via-[#7E69AB] to-[#6E59A5] dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
          
          <CardHeader className="relative z-10 pb-4">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <div className="absolute inset-0 animate-ping rounded-lg bg-white/20"></div>
                      <div className="absolute inset-0 animate-pulse rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-500"></div>
                      <div className="relative p-4 backdrop-blur-sm bg-white/10 rounded-lg border border-white/20 transform group-hover:scale-110 transition-all duration-500">
                        <Users className="h-8 w-8 text-white animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-4xl font-bold text-white">
                        Customer Management
                      </CardTitle>
                      <CardDescription className="text-base text-white/80 mt-1">
                        Manage customer profiles, track relationships, and monitor activity efficiently
                      </CardDescription>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Data Actions Group */}
                  <div className="flex items-center gap-2 p-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2 text-white hover:bg-white/20 hover:text-white transition-all duration-300"
                          >
                            <Upload className="h-4 w-4" />
                            Import
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Import customer data</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2 text-white hover:bg-white/20 hover:text-white transition-all duration-300"
                          >
                            <Download className="h-4 w-4" />
                            Export
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Export customer list</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* View Actions Group */}
                  <div className="flex items-center gap-2 p-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2 text-white hover:bg-white/20 hover:text-white transition-all duration-300"
                          >
                            <Search className="h-4 w-4" />
                            Search
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Search customers</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2 text-white hover:bg-white/20 hover:text-white transition-all duration-300"
                          >
                            <Filter className="h-4 w-4" />
                            Filter
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Filter customer view</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Primary Action */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CreateCustomerDialog>
                          <Button 
                            className={cn(
                              "bg-white text-primary hover:bg-white/90 flex items-center gap-2",
                              "shadow-lg hover:shadow-white/25 transition-all duration-300",
                              "border border-white/20 backdrop-blur-sm"
                            )}
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

              {/* Enhanced Stats Cards with 3D Effects */}
              <div className="grid grid-cols-3 gap-4">
                {/* Revenue Card */}
                <Card className={cn(
                  "group hover:shadow-lg transition-all duration-500 hover:translate-y-[-2px]",
                  "bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30",
                  "backdrop-blur-sm border border-white/20 overflow-hidden"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-emerald-400/20 group-hover:scale-110 transition-transform duration-500 relative">
                        <div className="absolute inset-0 rounded-lg bg-emerald-400/20 animate-pulse"></div>
                        <CircleDollarSign className="h-6 w-6 text-emerald-500 dark:text-emerald-400 relative z-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/80">Total Revenue</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-white">$124.5k</p>
                          <div className="flex items-center gap-1 text-xs text-emerald-400">
                            <TrendingUp className="h-3 w-3" />
                            <span>+12.5%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/60">
                          <LineChart className="h-3 w-3" />
                          <span>Monthly growth</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Customers Card */}
                <Card className={cn(
                  "group hover:shadow-lg transition-all duration-500 hover:translate-y-[-2px]",
                  "bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30",
                  "backdrop-blur-sm border border-white/20 overflow-hidden"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-blue-400/20 group-hover:scale-110 transition-transform duration-500 relative">
                        <div className="absolute inset-0 rounded-lg bg-blue-400/20 animate-pulse"></div>
                        <UserCog className="h-6 w-6 text-blue-500 dark:text-blue-400 relative z-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/80">Active Customers</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-white">1,245</p>
                          <div className="flex items-center gap-1 text-xs text-blue-400">
                            <Activity className="h-3 w-3" />
                            <span>Active now</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/60">
                          <Trophy className="h-3 w-3" />
                          <span>45 new this month</span>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Customers Card */}
                <Card className={cn(
                  "group hover:shadow-lg transition-all duration-500 hover:translate-y-[-2px]",
                  "bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30",
                  "backdrop-blur-sm border border-white/20 overflow-hidden"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-purple-400/20 group-hover:scale-110 transition-transform duration-500 relative">
                        <div className="absolute inset-0 rounded-lg bg-purple-400/20 animate-pulse"></div>
                        <Target className="h-6 w-6 text-purple-500 dark:text-purple-400 relative z-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/80">Total Customers</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-white">2,450</p>
                          <div className="flex items-center gap-1 text-xs text-purple-400">
                            <TrendingUp className="h-3 w-3" />
                            <span>+8.3%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/60">
                          <BarChart3 className="h-3 w-3" />
                          <span>All time</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <CustomerStats />
      </div>
      
      {/* Customer List Section */}
      <Card className="bg-white shadow-sm border-0">
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


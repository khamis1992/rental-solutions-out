
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  Users, UserPlus, Download, Upload, Filter,
  BarChart3, Wallet, TrendingUp, UserCheck, Activity
} from "lucide-react";

const Customers = () => {
  return (
    <DashboardLayout>
      {/* Enhanced Header Section with Gradient */}
      <div className="mb-8">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-purple-50 via-purple-100/50 to-white">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg animate-pulse">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Customer Management
                      </CardTitle>
                      <CardDescription className="text-base text-muted-foreground">
                        Manage customer profiles, track relationships, and monitor activity
                      </CardDescription>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="gap-2 hover:bg-primary/5 transition-colors">
                          <Upload className="h-4 w-4 text-primary" />
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
                        <Button variant="outline" className="gap-2 hover:bg-primary/5 transition-colors">
                          <Download className="h-4 w-4 text-primary" />
                          Export
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Export customer list</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="gap-2 hover:bg-primary/5 transition-colors">
                          <Filter className="h-4 w-4 text-primary" />
                          Filter
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Filter customer view</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CreateCustomerDialog>
                          <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
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

              {/* Quick Stats Strip with Enhanced Design */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-white/50 hover:bg-white/80 transition-all duration-300 hover:shadow-md border border-purple-100 group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                        <Wallet className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">$124.5k</p>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          <span>+12.5%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 hover:bg-white/80 transition-all duration-300 hover:shadow-md border border-purple-100 group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                        <p className="text-2xl font-bold">1,245</p>
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Activity className="h-3 w-3" />
                          <span>Active now</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 hover:bg-white/80 transition-all duration-300 hover:shadow-md border border-purple-100 group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:scale-110 transition-transform">
                        <UserPlus className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                        <p className="text-2xl font-bold">45</p>
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <TrendingUp className="h-3 w-3" />
                          <span>+8.3%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 hover:bg-white/80 transition-all duration-300 hover:shadow-md border border-purple-100 group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                        <p className="text-2xl font-bold">2,450</p>
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <BarChart3 className="h-3 w-3" />
                          <span>All time</span>
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

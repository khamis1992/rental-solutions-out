
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  Users, UserPlus, Download, Upload, Filter,
  BarChart3, Search, ChevronRight, Grid, ListFilter,
  Table as TableIcon
} from "lucide-react";

const Customers = () => {
  return (
    <DashboardLayout>
      {/* Enhanced Header Section with Interactive Gradient */}
      <div className="mb-8 relative overflow-hidden">
        <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
          <CardHeader className="relative z-10 pb-4">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-lg bg-primary/20"></div>
                      <div className="relative p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <div className="absolute inset-0 rotate-180 animate-pulse rounded-lg bg-primary/10"></div>
                    </div>
                    <div>
                      <CardTitle className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 bg-clip-text text-transparent dark:from-white dark:via-gray-200 dark:to-gray-300">
                        Customer Management
                      </CardTitle>
                      <CardDescription className="text-base text-muted-foreground mt-1">
                        Manage customer profiles, track relationships, and monitor activity efficiently
                      </CardDescription>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Data Management Actions */}
                  <div className="flex items-center gap-2 p-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/80 dark:hover:bg-gray-700/80">
                            <Upload className="h-4 w-4 text-blue-600" />
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
                          <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/80 dark:hover:bg-gray-700/80">
                            <Download className="h-4 w-4 text-green-600" />
                            Export
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Export customer list</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* View Options */}
                  <div className="flex items-center gap-2 p-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/80 dark:hover:bg-gray-700/80">
                            <TableIcon className="h-4 w-4 text-indigo-600" />
                            Table
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Table view</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/80 dark:hover:bg-gray-700/80">
                            <Grid className="h-4 w-4 text-purple-600" />
                            Grid
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Grid view</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex items-center gap-2 p-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/80 dark:hover:bg-gray-700/80">
                            <Search className="h-4 w-4 text-orange-600" />
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
                          <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/80 dark:hover:bg-gray-700/80">
                            <ListFilter className="h-4 w-4 text-rose-600" />
                            Filter
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Filter customer view</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Add Customer Button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CreateCustomerDialog>
                          <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 shadow-lg hover:shadow-primary/25 transition-all duration-300">
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

              {/* Enhanced Stats Strip */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="group hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 group-hover:scale-110 transition-transform duration-300 relative">
                        <div className="absolute inset-0 rounded-lg bg-emerald-200/60 dark:bg-emerald-700/30 animate-pulse"></div>
                        <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400 relative z-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold">2,450</p>
                          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <BarChart3 className="h-3 w-3" />
                            <span>+8.3%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
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


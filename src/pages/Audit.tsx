
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { format } from "date-fns";
import { 
  Loader2, PlusCircle, Pencil, Trash2, User, Copy, ChevronDown, ChevronUp,
  Activity, Clock, Filter, Search, FileText, CreditCard, Car, Users, 
  Calendar, Download, LayoutList, Pipeline 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Audit = () => {
  const [entityFilter, setEntityFilter] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"table" | "timeline">("table");

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["audit-logs", entityFilter],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs_with_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (entityFilter) {
        query = query.eq("entity_type", entityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredLogs = auditLogs?.filter((log) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.entity_type?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.performed_by_name?.toLowerCase().includes(searchLower)
    );
  });

  const uniqueEntityTypes = Array.from(
    new Set(auditLogs?.map((log) => log.entity_type).filter(Boolean) || [])
  );

  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    toast.success("Copied to clipboard");
  };

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'create':
      case 'insert':
        return <PlusCircle className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Pencil className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'user':
        return <Users className="h-4 w-4 text-[#9b87f5]" />;
      case 'document':
        return <FileText className="h-4 w-4 text-[#9b87f5]" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-[#9b87f5]" />;
      case 'vehicle':
        return <Car className="h-4 w-4 text-[#9b87f5]" />;
      default:
        return <Activity className="h-4 w-4 text-[#9b87f5]" />;
    }
  };

  const stats = {
    total: filteredLogs?.length || 0,
    creates: filteredLogs?.filter(log => log.action?.toLowerCase() === 'create' || log.action?.toLowerCase() === 'insert').length || 0,
    updates: filteredLogs?.filter(log => log.action?.toLowerCase() === 'update').length || 0,
    deletes: filteredLogs?.filter(log => log.action?.toLowerCase() === 'delete').length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Enhanced Header with Stats */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#9b87f5]/10 to-[#E5DEFF]/50 p-8 shadow-lg border border-[#9b87f5]/20">
          <div className="absolute inset-0 bg-grid-[#9b87f5]/[0.03] bg-[size:20px_20px]" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#9b87f5]/10 p-2">
                <Activity className="h-6 w-6 text-[#9b87f5]" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1A1F2C] to-[#9b87f5] bg-clip-text text-transparent">
                Audit Logs
              </h1>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-white/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#9b87f5]" />
                    <p className="text-sm text-muted-foreground">Total Logs</p>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stats.total}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-muted-foreground">Creates</p>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stats.creates}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Pencil className="h-4 w-4 text-blue-500" />
                    <p className="text-sm text-muted-foreground">Updates</p>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stats.updates}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-muted-foreground">Deletes</p>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stats.deletes}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#9b87f5]" />
              Filters & Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 border-[#9b87f5]/20 focus:border-[#9b87f5]"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-[200px]">
                  <Select 
                    value={entityFilter} 
                    onValueChange={setEntityFilter}
                  >
                    <SelectTrigger className="border-[#9b87f5]/20 focus:border-[#9b87f5]">
                      <SelectValue placeholder="Filter by entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          All Types
                        </div>
                      </SelectItem>
                      {uniqueEntityTypes.map((type) => (
                        <SelectItem key={type} value={type || "unknown"}>
                          <div className="flex items-center gap-2">
                            {getEntityIcon(type || "")}
                            {type?.replace(/_/g, " ").toLowerCase() || "Unknown"}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-auto flex gap-2">
                  <Button
                    variant="outline"
                    className="border-[#9b87f5]/20 hover:bg-[#9b87f5]/10"
                    onClick={() => setView("table")}
                  >
                    <LayoutList className={`h-4 w-4 ${view === "table" ? "text-[#9b87f5]" : "text-muted-foreground"}`} />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#9b87f5]/20 hover:bg-[#9b87f5]/10"
                    onClick={() => setView("timeline")}
                  >
                    <Pipeline className={`h-4 w-4 ${view === "timeline" ? "text-[#9b87f5]" : "text-muted-foreground"}`} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#9b87f5]" />
              </div>
            ) : view === "table" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#9b87f5]" />
                        Date
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#9b87f5]" />
                        Entity Type
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#9b87f5]" />
                        Action
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#9b87f5]" />
                        Performed By
                      </div>
                    </TableHead>
                    <TableHead className="w-[300px]">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#9b87f5]" />
                        Changes
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs?.map((log) => (
                    <TableRow 
                      key={log.id}
                      className="group hover:bg-[#9b87f5]/5 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {format(new Date(log.created_at), "PPpp")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEntityIcon(log.entity_type || "")}
                          <span className="capitalize">
                            {log.entity_type?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action || "")}
                          <span className="capitalize">
                            {log.action?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#9b87f5]" />
                          {log.performed_by_name || "System"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <div className={`${expandedRows.has(log.id) ? '' : 'max-h-20 overflow-hidden'}`}>
                            {log.changes ? (
                              <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded-md border border-[#9b87f5]/10">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            ) : (
                              "No changes recorded"
                            )}
                          </div>
                          {log.changes && (
                            <div className="absolute bottom-0 right-0 flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRowExpansion(log.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#9b87f5]/10"
                              >
                                {expandedRows.has(log.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.changes && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(log.changes)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#9b87f5]/10"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 space-y-6">
                {filteredLogs?.map((log) => (
                  <div 
                    key={log.id}
                    className="flex gap-4 group hover:bg-[#9b87f5]/5 p-4 rounded-lg transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-[#9b87f5]/10 flex items-center justify-center">
                        {getActionIcon(log.action || "")}
                      </div>
                      <div className="flex-1 w-px bg-[#9b87f5]/20 my-2"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(log.created_at), "PPpp")}
                      </div>
                      <div className="flex items-center gap-2">
                        {getEntityIcon(log.entity_type || "")}
                        <span className="font-medium capitalize">
                          {log.entity_type?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-[#9b87f5]" />
                        {log.performed_by_name || "System"}
                      </div>
                      {log.changes && (
                        <div className="relative mt-2">
                          <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded-md border border-[#9b87f5]/10">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(log.changes)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#9b87f5]/10"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Audit;

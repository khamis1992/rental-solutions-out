
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Trash2, Search, Download, Upload } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export const EmailOptOutManager = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [isAddingOptOut, setIsAddingOptOut] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [newOptOutEmail, setNewOptOutEmail] = useState("");
  const [newOptOutReason, setNewOptOutReason] = useState("user_request");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch opt-out list
  const { data: optOuts, isLoading, refetch } = useQuery({
    queryKey: ['email-opt-outs', searchEmail],
    queryFn: async () => {
      let query = supabase
        .from('email_opt_outs')
        .select('*')
        .order('opt_out_date', { ascending: false });
        
      if (searchEmail) {
        query = query.ilike('email', `%${searchEmail}%`);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) {
        console.error('Error fetching opt-outs:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  const handleAddOptOut = async () => {
    if (!newOptOutEmail) {
      toast.error("Please enter an email address");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('email_opt_outs')
        .insert({
          email: newOptOutEmail.toLowerCase(),
          reason: newOptOutReason,
          source: 'admin'
        });
        
      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.warning("This email is already opted out");
        } else {
          throw error;
        }
      } else {
        toast.success("Email added to opt-out list");
        setNewOptOutEmail("");
        setIsAddingOptOut(false);
        refetch();
      }
    } catch (error) {
      console.error('Error adding opt-out:', error);
      toast.error("Failed to add email to opt-out list");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveOptOut = async (email: string) => {
    try {
      const { error } = await supabase
        .from('email_opt_outs')
        .delete()
        .eq('email', email);
        
      if (error) throw error;
      
      toast.success("Email removed from opt-out list");
      refetch();
    } catch (error) {
      console.error('Error removing opt-out:', error);
      toast.error("Failed to remove email from opt-out list");
    }
  };

  const handleImportOptOuts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    try {
      const text = await file.text();
      const emails = text.split(/[\r\n]+/).map(email => email.trim()).filter(Boolean);
      
      if (emails.length === 0) {
        toast.error("No valid emails found in file");
        return;
      }
      
      // Create a batch of inserts
      let success = 0;
      let duplicates = 0;
      let errors = 0;
      
      // Process in smaller batches to avoid payload limits
      const batchSize = 100;
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        
        // Create an array of objects for insertion
        const insertData = batch.map(email => ({
          email: email.toLowerCase(),
          reason: 'bulk_import',
          source: 'import'
        }));
        
        const { data, error } = await supabase
          .from('email_opt_outs')
          .insert(insertData)
          .select();
          
        if (error) {
          console.error('Batch insert error:', error);
          errors += batch.length;
        } else {
          success += data?.length || 0;
          duplicates += batch.length - (data?.length || 0);
        }
      }
      
      toast.success(`Imported ${success} email(s) to opt-out list. ${duplicates} duplicates skipped.`);
      refetch();
    } catch (error) {
      console.error('Error importing opt-outs:', error);
      toast.error("Failed to import opt-out list");
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleExportOptOuts = async () => {
    try {
      const { data, error } = await supabase
        .from('email_opt_outs')
        .select('email')
        .order('email');
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.info("No emails to export");
        return;
      }
      
      const emailText = data.map(row => row.email).join('\n');
      const blob = new Blob([emailText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `email-opt-outs-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${data.length} email(s)`);
    } catch (error) {
      console.error('Error exporting opt-outs:', error);
      toast.error("Failed to export opt-out list");
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Opt-Out Management</CardTitle>
          <CardDescription>
            Manage recipients who have opted out of email communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 gap-4 flex-col sm:flex-row">
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by email..."
                className="pl-8"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsAddingOptOut(true)}
                className="whitespace-nowrap"
              >
                Add Opt-Out
              </Button>
              <Button
                variant="outline"
                onClick={handleExportOptOuts}
                className="whitespace-nowrap"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('import-opt-outs')?.click()}
                  disabled={isImporting}
                  className="whitespace-nowrap"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </>
                  )}
                </Button>
                <input
                  id="import-opt-outs"
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleImportOptOuts}
                  className="hidden"
                />
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {optOuts && optOuts.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email Address</TableHead>
                        <TableHead>Opt-Out Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {optOuts.map((optOut) => (
                        <TableRow key={optOut.id}>
                          <TableCell>{optOut.email}</TableCell>
                          <TableCell>
                            {format(new Date(optOut.opt_out_date), 'PPP')}
                          </TableCell>
                          <TableCell>
                            {optOut.reason || 'Not specified'}
                          </TableCell>
                          <TableCell>
                            {optOut.source || 'user'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOptOut(optOut.email)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  {searchEmail ? 'No matching opt-outs found' : 'No opt-outs found'}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isAddingOptOut} onOpenChange={setIsAddingOptOut}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Email to Opt-Out List</DialogTitle>
            <DialogDescription>
              Add an email address to prevent sending any future communications.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="email@example.com"
                value={newOptOutEmail}
                onChange={(e) => setNewOptOutEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select
                value={newOptOutReason}
                onValueChange={setNewOptOutReason}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user_request">User Request</SelectItem>
                  <SelectItem value="bounce">Bounced Email</SelectItem>
                  <SelectItem value="spam_complaint">Spam Complaint</SelectItem>
                  <SelectItem value="unsubscribe_link">Unsubscribe Link</SelectItem>
                  <SelectItem value="admin_action">Admin Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAddOptOut}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Opt-Out List'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

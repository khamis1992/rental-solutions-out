
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, FileText, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface WordTemplate {
  id: string;
  name: string;
  original_file_url: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export function WordTemplateManagement() {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['word-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('word_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WordTemplate[];
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.name.endsWith('.docx')) {
        toast.error('Please upload a Word document (.docx)');
        return;
      }

      // Upload file to storage
      const filename = `${crypto.randomUUID()}.docx`;
      const { error: uploadError } = await supabase.storage
        .from('word_templates')
        .upload(filename, file);

      if (uploadError) throw uploadError;

      // Create template record
      const { error: dbError } = await supabase
        .from('word_templates')
        .insert({
          name: file.name.replace('.docx', ''),
          original_file_url: filename,
          is_active: true
        });

      if (dbError) throw dbError;

      toast.success('Template uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['word-templates'] });
    } catch (error) {
      console.error('Error uploading template:', error);
      toast.error('Failed to upload template');
    } finally {
      setUploading(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { data: template } = await supabase
        .from('word_templates')
        .select('original_file_url')
        .eq('id', templateId)
        .single();

      if (template) {
        // Delete file from storage
        await supabase.storage
          .from('word_templates')
          .remove([template.original_file_url]);
      }

      // Delete template record
      const { error } = await supabase
        .from('word_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['word-templates'] });
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Word Templates</CardTitle>
        <CardDescription>
          Upload and manage Word document templates for agreements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input
            type="file"
            accept=".docx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="max-w-sm"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Upload a Word document (.docx) with variable placeholders
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates?.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {template.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={template.is_active ? "success" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(template.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(template.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && templates?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No templates found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, FileText, Trash, Eye, Edit2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TemplatePreview } from "./TemplatePreview";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface WordTemplate {
  id: string;
  name: string;
  content?: string;
  original_file_url: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export function WordTemplateManagement() {
  const [uploading, setUploading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WordTemplate | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [editingTemplate, setEditingTemplate] = useState<WordTemplate | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedName, setEditedName] = useState("");
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

      // Read file content
      const content = await file.text();

      // Create template record
      const { error: dbError } = await supabase
        .from('word_templates')
        .insert({
          name: file.name.replace('.docx', ''),
          original_file_url: filename,
          content: content,
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

  const handlePreview = async (template: WordTemplate) => {
    try {
      setSelectedTemplate(template);
      
      if (template.content) {
        setPreviewContent(template.content);
      } else {
        // Download the template file if content is not available
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('word_templates')
          .download(template.original_file_url);

        if (downloadError) throw downloadError;

        // Convert to text for preview
        const text = await fileData.text();
        setPreviewContent(text);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to load preview');
    }
  };

  const handleEdit = async (template: WordTemplate) => {
    try {
      setEditingTemplate(template);
      setEditedName(template.name);
      
      if (template.content) {
        setEditedContent(template.content);
      } else {
        // Download the template file if content is not available
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('word_templates')
          .download(template.original_file_url);

        if (downloadError) throw downloadError;

        // Convert to text for editing
        const text = await fileData.text();
        setEditedContent(text);
      }
    } catch (error) {
      console.error('Error loading template for editing:', error);
      toast.error('Failed to load template');
    }
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, content }: { id: string, name: string, content: string }) => {
      const { error } = await supabase
        .from('word_templates')
        .update({ name, content })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Template updated successfully');
      queryClient.invalidateQueries({ queryKey: ['word-templates'] });
      setEditingTemplate(null);
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  });

  const handleSave = () => {
    if (!editingTemplate) return;
    
    updateMutation.mutate({
      id: editingTemplate.id,
      name: editedName,
      content: editedContent
    });
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
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl h-[90vh]">
                        <TemplatePreview content={previewContent} />
                      </DialogContent>
                    </Dialog>
                    
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[800px] sm:w-[600px]" side="right">
                        <SheetHeader>
                          <SheetTitle>Edit Template</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Template Name</Label>
                            <Input
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              placeholder="Enter template name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Content</Label>
                            <Textarea
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              placeholder="Enter template content"
                              className="min-h-[500px] font-mono"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setEditingTemplate(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(template.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
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

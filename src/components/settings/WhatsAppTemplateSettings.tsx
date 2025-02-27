
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Edit, Trash, Plus } from "lucide-react";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  templateId: z.string().min(1, "Template ID is required"),
  content: z.string().min(1, "Template content is required"),
  category: z.string().optional(),
  language: z.string().default("en"),
  status: z.string().default("active"),
});

export function WhatsAppTemplateSettings() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      templateId: "",
      content: "",
      category: "general",
      language: "en",
      status: "active",
    },
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof templateSchema>) => {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from("whatsapp_templates")
          .update({
            name: values.name,
            template_id: values.templateId,
            content: values.content,
            category: values.category,
            language: values.language,
            status: values.status,
          })
          .eq("id", editingTemplate.id);

        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase.from("whatsapp_templates").insert([
          {
            name: values.name,
            template_id: values.templateId,
            content: values.content,
            category: values.category,
            language: values.language,
            status: values.status,
          },
        ]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      form.reset();
      toast.success(
        editingTemplate
          ? "Template updated successfully"
          : "Template created successfully"
      );
    },
    onError: (error) => {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("whatsapp_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast.success("Template deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    },
  });

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    form.reset({
      name: template.name,
      templateId: template.template_id,
      content: template.content,
      category: template.category || "general",
      language: template.language || "en",
      status: template.status,
    });
    setIsDialogOpen(true);
  };

  const handleAddNewTemplate = () => {
    setEditingTemplate(null);
    form.reset({
      name: "",
      templateId: "",
      content: "",
      category: "general",
      language: "en",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading WhatsApp templates...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>WhatsApp Templates</CardTitle>
          <CardDescription>
            Manage your WhatsApp message templates for ManyChat
          </CardDescription>
        </div>
        <Button
          onClick={handleAddNewTemplate}
          variant="default"
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Template ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No templates found. Add your first WhatsApp template.
                </TableCell>
              </TableRow>
            )}
            {templates?.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>{template.template_id}</TableCell>
                <TableCell>{template.category || "general"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      template.status === "active" ? "default" : "secondary"
                    }
                    className={
                      template.status === "active" ? "bg-green-600" : ""
                    }
                  >
                    {template.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(template.updated_at), "PP")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Add New Template"}
              </DialogTitle>
              <DialogDescription>
                WhatsApp templates must be approved in your ManyChat account before
                they can be used.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  saveTemplateMutation.mutate(values)
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Welcome Message" />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for the template
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="welcome_message" />
                      </FormControl>
                      <FormDescription>
                        The ID of the template in ManyChat
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Content</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Hello {{1}}, welcome to our service!"
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        The content of the template with placeholders
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="general"
                          defaultValue="general"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="active"
                          defaultValue="active"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={saveTemplateMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {editingTemplate ? "Update Template" : "Save Template"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

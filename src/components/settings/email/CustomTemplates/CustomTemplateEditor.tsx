
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface TemplateFormData {
  name: string;
  subject: string;
  content: string;
  category_id?: string;
  is_active: boolean;
}

const AVAILABLE_VARIABLES = {
  customer: ['full_name', 'email', 'phone_number', 'address'],
  agreement: ['agreement_number', 'start_date', 'end_date', 'rent_amount', 'total_amount'],
  vehicle: ['make', 'model', 'year', 'license_plate'],
};

export const CustomTemplateEditor = ({ 
  templateId,
  onSave
}: { 
  templateId: string | null;
  onSave: () => void;
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<TemplateFormData>({
    defaultValues: {
      is_active: true,
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('email_template_categories')
        .select('*');
      setCategories(data || []);
    };

    const fetchTemplate = async () => {
      if (!templateId) return;

      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (template) {
        setValue('name', template.name);
        setValue('subject', template.subject);
        setValue('content', template.content);
        setValue('category_id', template.category_id);
        setValue('is_active', template.is_active);
      }
    };

    fetchCategories();
    fetchTemplate();
  }, [templateId, setValue]);

  const validateVariables = (content: string) => {
    const variableRegex = /{{([^}]+)}}/g;
    const matches = content.match(variableRegex) || [];
    const invalidVariables = [];

    for (const match of matches) {
      const variable = match.slice(2, -2); // Remove {{ and }}
      const [category, field] = variable.split('.');
      
      if (!category || !field) {
        invalidVariables.push(match);
        continue;
      }

      if (!AVAILABLE_VARIABLES[category as keyof typeof AVAILABLE_VARIABLES]?.includes(field)) {
        invalidVariables.push(match);
      }
    }

    return invalidVariables;
  };

  const onSubmit = async (data: TemplateFormData) => {
    try {
      setIsLoading(true);

      // Validate variables in content
      const invalidVariables = validateVariables(data.content);
      if (invalidVariables.length > 0) {
        toast.error(`Invalid variables found: ${invalidVariables.join(', ')}`);
        return;
      }

      const variableMappings = {
        customer: AVAILABLE_VARIABLES.customer.reduce((acc, field) => ({
          ...acc,
          [field]: `{{customer.${field}}}`
        }), {}),
        agreement: AVAILABLE_VARIABLES.agreement.reduce((acc, field) => ({
          ...acc,
          [field]: `{{agreement.${field}}}`
        }), {}),
        vehicle: AVAILABLE_VARIABLES.vehicle.reduce((acc, field) => ({
          ...acc,
          [field]: `{{vehicle.${field}}}`
        }), {})
      };

      if (templateId) {
        await supabase
          .from('email_templates')
          .update({
            ...data,
            variable_mappings: variableMappings,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId);
      } else {
        await supabase
          .from('email_templates')
          .insert({
            ...data,
            variable_mappings: variableMappings
          });
      }

      toast.success('Template saved successfully');
      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name</Label>
          <Input id="name" {...register('name', { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject</Label>
          <Input id="subject" {...register('subject', { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select 
            {...register('category_id')}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Email Content</Label>
          <Textarea 
            id="content" 
            {...register('content', { required: true })}
            className="min-h-[300px] font-mono"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            id="is_active" 
            checked={watch('is_active')}
            onCheckedChange={(checked) => setValue('is_active', checked)}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Available Variables</h3>
          <div className="space-y-4">
            {Object.entries(AVAILABLE_VARIABLES).map(([category, fields]) => (
              <div key={category}>
                <h4 className="text-sm font-medium mb-1">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {fields.map((field) => (
                    <code key={field} className="px-2 py-1 bg-muted rounded text-sm">
                      {`{{${category}.${field}}}`}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
    </form>
  );
};


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UseFormSetValue } from "react-hook-form";
import { AgreementFormData } from "../hooks/useAgreementForm";
import { Template } from "@/types/agreement.types";
import { useEffect } from "react";

interface AgreementTemplateSelectProps {
  setValue: UseFormSetValue<AgreementFormData>;
}

export const AgreementTemplateSelect = ({ setValue }: AgreementTemplateSelectProps) => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["agreement-templates"],
    queryFn: async () => {
      console.log("Fetching templates...");
      const { data, error } = await supabase
        .from("agreement_templates")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching templates:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No templates found in database");
        return [];
      }

      // Transform the data to match the Template interface
      const transformedTemplates: Template[] = data.map(template => ({
        ...template,
        template_structure: typeof template.template_structure === 'string' ? 
          JSON.parse(template.template_structure) : 
          template.template_structure,
        variable_mappings: typeof template.variable_mappings === 'string' ? 
          JSON.parse(template.variable_mappings) : 
          template.variable_mappings,
      }));

      console.log("Fetched templates:", transformedTemplates);
      return transformedTemplates;
    },
  });

  // Auto-select Standard Rental Agreement template
  useEffect(() => {
    if (templates && templates.length > 0) {
      const standardTemplate = templates.find(t => t.name === "Standard Rental Agreement");
      if (standardTemplate) {
        console.log("Auto-selecting Standard Rental Agreement template");
        handleTemplateSelect(standardTemplate.id);
      } else {
        // If standard template not found, select the first available template
        console.log("Standard template not found, selecting first available template");
        handleTemplateSelect(templates[0].id);
      }
    }
  }, [templates]);

  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplate = templates?.find((t) => t.id === templateId);
    if (!selectedTemplate) {
      console.log("No template found with ID:", templateId);
      return;
    }

    // Set the template ID
    setValue("templateId", templateId);

    // Parse duration from agreement_duration string
    let durationMonths = 12; // Default value
    try {
      const durationStr = selectedTemplate.agreement_duration;
      if (durationStr.includes("months") || durationStr.includes("month")) {
        const match = durationStr.match(/(\d+)/);
        if (match) {
          const months = parseInt(match[1]);
          if (!isNaN(months)) {
            durationMonths = months;
          }
        }
      }
    } catch (error) {
      console.error("Error parsing duration:", error);
    }

    // Only set values if they exist in the template
    setValue("agreementType", selectedTemplate.agreement_type);
    if (selectedTemplate.rent_amount) {
      setValue("rentAmount", selectedTemplate.rent_amount);
    }
    if (selectedTemplate.final_price) {
      setValue("finalPrice", selectedTemplate.final_price);
    }
    setValue("agreementDuration", durationMonths);
    if (selectedTemplate.daily_late_fee) {
      setValue("dailyLateFee", selectedTemplate.daily_late_fee);
    }

    console.log("Applied template values:", selectedTemplate);
  };

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  if (!templates?.length) {
    console.log("No templates available to display");
    return (
      <div className="space-y-2">
        <Label htmlFor="template">Agreement Template</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="No templates available" />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="template">Agreement Template</Label>
      <Select onValueChange={handleTemplateSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

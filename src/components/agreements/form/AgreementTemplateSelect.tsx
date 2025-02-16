
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
import { Template, TextStyle, Table } from "@/types/agreement.types";

interface AgreementTemplateSelectProps {
  setValue: UseFormSetValue<AgreementFormData>;
}

interface TemplateResponse {
  id: string;
  name: string;
  description: string;
  content: string;
  language: string;
  agreement_type: "lease_to_own" | "short_term";
  rent_amount: number;
  final_price: number;
  agreement_duration: string;
  template_structure: string;
  text_style: string;
}

const defaultTextStyle: TextStyle = {
  bold: false,
  italic: false,
  underline: false,
  fontSize: 14,
  alignment: 'left'
};

export const AgreementTemplateSelect = ({ setValue }: AgreementTemplateSelectProps) => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["agreement-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agreement_templates")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      // Safely parse the JSON fields
      return (data || []).map(template => {
        let templateStructure;
        let textStyle;

        try {
          templateStructure = JSON.parse(template.template_structure as string);
        } catch (e) {
          templateStructure = { textStyle: defaultTextStyle, tables: [] };
        }

        try {
          textStyle = JSON.parse(template.text_style as string);
        } catch (e) {
          textStyle = defaultTextStyle;
        }

        return {
          ...template,
          template_structure: templateStructure,
          text_style: textStyle
        } as Template;
      });
    }
  });

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

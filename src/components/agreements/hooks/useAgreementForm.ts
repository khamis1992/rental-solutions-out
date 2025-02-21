
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { addMonths } from "date-fns";
import { toast } from "sonner";
import { AgreementType, LeaseStatus } from "@/types/agreement.types";

export interface AgreementFormData {
  agreementType: AgreementType;
  customerId: string;
  vehicleId: string;
  rentAmount: number;
  agreementDuration: number;
  startDate: string;
  endDate: string;
  dailyLateFee: number;
  notes?: string;
  downPayment?: number;
  // Additional customer fields
  nationality?: string;
  drivingLicense?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  // Template fields
  finalPrice?: number;
  agreementNumber?: string;
  templateId?: string;
}

interface LeaseInsertData {
  agreement_type: AgreementType;
  customer_id: string;
  vehicle_id: string;
  rent_amount: number;
  total_amount: number;
  start_date: string;
  end_date: string;
  daily_late_fee: number;
  notes?: string;
  down_payment?: number;
  status: LeaseStatus;
  initial_mileage: number;
  agreement_duration: string;
  template_id?: string;
  processed_content?: string;
}

export const useAgreementForm = (onSuccess: (agreementId: string) => void) => {
  const [open, setOpen] = useState(false);
  const [agreementType, setAgreementType] = useState<AgreementType>("short_term");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AgreementFormData>({
    defaultValues: {
      agreementType: "short_term",
      startDate: new Date().toISOString().split('T')[0],
      agreementDuration: 12,
      dailyLateFee: 120,
    }
  });

  // Watch for changes in start date and duration
  const startDate = watch('startDate');
  const duration = watch('agreementDuration');

  // Update end date when start date or duration changes
  const updateEndDate = () => {
    if (startDate && duration) {
      try {
        const endDate = addMonths(new Date(startDate), duration);
        setValue('endDate', endDate.toISOString().split('T')[0]);
      } catch (error) {
        console.error('Error calculating end date:', error);
      }
    }
  };

  // Use watch callback to update end date
  watch((data, { name }) => {
    if (name === 'startDate' || name === 'agreementDuration') {
      updateEndDate();
    }
  });

  const processTemplateVariables = async (templateId: string, agreementData: any) => {
    try {
      console.log("Processing template variables for template:", templateId);
      console.log("Agreement data:", agreementData);

      // First get the template content
      const { data: template, error: templateError } = await supabase
        .from('agreement_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) {
        console.error("Template fetch error:", templateError);
        throw templateError;
      }
      console.log("Fetched template:", template);

      // Get customer details
      const { data: customer, error: customerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', agreementData.customer_id)
        .single();

      if (customerError) {
        console.error("Customer fetch error:", customerError);
        throw customerError;
      }
      console.log("Fetched customer:", customer);

      // Get vehicle details
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', agreementData.vehicle_id)
        .single();

      if (vehicleError) {
        console.error("Vehicle fetch error:", vehicleError);
        throw vehicleError;
      }
      console.log("Fetched vehicle:", vehicle);

      let content = template.content;
      console.log("Original template content:", content);

      // Use the standardize_template_variables function
      const { data: standardizedContent, error: standardizeError } = await supabase
        .rpc('standardize_template_variables', {
          content: content
        });

      if (standardizeError) {
        console.error("Standardization error:", standardizeError);
        throw standardizeError;
      }
      console.log("Standardized content:", standardizedContent);

      content = standardizedContent;

      // Replace customer variables
      content = content.replace(/{{customer\.([^}]+)}}/g, (match, field) => {
        const value = customer[field]?.toString();
        console.log(`Replacing customer.${field} with:`, value);
        return value || match;
      });

      // Replace vehicle variables
      content = content.replace(/{{vehicle\.([^}]+)}}/g, (match, field) => {
        const value = vehicle[field]?.toString();
        console.log(`Replacing vehicle.${field} with:`, value);
        return value || match;
      });

      // Replace agreement variables
      content = content.replace(/{{agreement\.([^}]+)}}/g, (match, field) => {
        let value;
        if (field === 'agreement_duration') {
          value = `${agreementData.agreement_duration} months`;
        } else {
          value = agreementData[field]?.toString();
        }
        console.log(`Replacing agreement.${field} with:`, value);
        return value || match;
      });

      console.log("Final processed content:", content);
      return content;

    } catch (error) {
      console.error('Error processing template variables:', error);
      throw error;
    }
  };

  const onSubmit = async (data: AgreementFormData) => {
    try {
      console.log("Form data before submission:", data);

      if (!data.customerId || data.customerId === "") {
        toast.error("Please select a customer");
        return;
      }

      if (!data.vehicleId || data.vehicleId === "") {
        toast.error("Please select a vehicle");
        return;
      }

      const leaseData: LeaseInsertData = {
        agreement_type: data.agreementType,
        customer_id: data.customerId,
        vehicle_id: data.vehicleId,
        rent_amount: data.rentAmount,
        total_amount: data.rentAmount * data.agreementDuration,
        start_date: data.startDate,
        end_date: data.endDate,
        daily_late_fee: data.dailyLateFee,
        notes: data.notes,
        down_payment: data.downPayment,
        status: 'pending_payment',
        initial_mileage: 0,
        agreement_duration: `${data.agreementDuration} months`,
        template_id: data.templateId
      };

      // Process template variables if template is selected
      if (data.templateId) {
        const processedContent = await processTemplateVariables(data.templateId, {
          ...leaseData,
          id: 'temp' // Temporary ID for processing
        });
        leaseData.processed_content = processedContent;
      }

      const { data: agreement, error } = await supabase
        .from('leases')
        .insert(leaseData)
        .select()
        .single();

      if (error) {
        console.error('Error creating agreement:', error);
        toast.error(error.message);
        throw error;
      }

      onSuccess(agreement.id);
      toast.success("Agreement created successfully");
    } catch (error) {
      console.error('Error creating agreement:', error);
      toast.error("Failed to create agreement");
      throw error;
    }
  };

  return {
    open,
    setOpen,
    register,
    handleSubmit,
    onSubmit,
    agreementType,
    watch,
    setValue,
    errors,
  };
};

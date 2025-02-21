
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
      // First get the template content
      const { data: template, error: templateError } = await supabase
        .from('agreement_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Get customer details
      const { data: customer, error: customerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', agreementData.customer_id)
        .single();

      if (customerError) throw customerError;

      // Get vehicle details
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', agreementData.vehicle_id)
        .single();

      if (vehicleError) throw vehicleError;

      // Get security deposit if exists
      const { data: securityDeposit } = await supabase
        .from('security_deposits')
        .select('amount')
        .eq('lease_id', agreementData.id)
        .single();

      let content = template.content;

      // Use the standardize_template_variables function
      const { data: standardizedContent, error: standardizeError } = await supabase
        .rpc('standardize_template_variables', {
          content: content
        });

      if (standardizeError) throw standardizeError;
      content = standardizedContent;

      // Replace customer variables
      content = content.replace(/{{customer\.([^}]+)}}/g, (match, field) => {
        return customer[field] || match;
      });

      // Replace vehicle variables
      content = content.replace(/{{vehicle\.([^}]+)}}/g, (match, field) => {
        return vehicle[field] || match;
      });

      // Replace agreement variables
      content = content.replace(/{{agreement\.([^}]+)}}/g, (match, field) => {
        if (field === 'agreement_duration') {
          return `${agreementData.agreement_duration} months`;
        }
        return agreementData[field] || match;
      });

      // Replace payment variables
      content = content.replace(/{{payment\.([^}]+)}}/g, (match, field) => {
        if (field === 'down_payment' && securityDeposit) {
          return securityDeposit.amount.toString();
        }
        return match;
      });

      // Update the agreement with processed content
      const { error: updateError } = await supabase
        .from('leases')
        .update({ processed_content: content })
        .eq('id', agreementData.id);

      if (updateError) throw updateError;

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

      const { data: agreement, error } = await supabase
        .from('leases')
        .insert({
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
          status: 'pending_payment' as LeaseStatus,
          initial_mileage: 0,
          agreement_duration: `${data.agreementDuration} months`,
          template_id: data.templateId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating agreement:', error);
        toast.error(error.message);
        throw error;
      }

      // Process template variables if template is selected
      if (data.templateId && agreement) {
        await processTemplateVariables(data.templateId, agreement);
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

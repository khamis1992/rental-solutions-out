import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ContractDocumentUpload } from "./ContractDocumentUpload";
import { parsePhoneNumber, AsYouType } from 'libphonenumber-js';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import debounce from "lodash/debounce";
import { findPotentialDuplicates } from "./utils/duplicateDetection";
import { DuplicateWarning } from "./DuplicateWarning";
import type { DuplicateMatch } from "./utils/duplicateDetection";

interface CustomerFormFieldsProps {
  form: UseFormReturn<any>;
  profileScore?: number;
  customerId?: string;
}

export const CustomerFormFields = ({ form, profileScore = 0, customerId }: CustomerFormFieldsProps) => {
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(true);

  const formatPhoneNumber = (value: string) => {
    const formatter = new AsYouType('QA');
    return formatter.input(value);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    form.setValue('phone_number', formatted);
  };

  // Check for duplicates when relevant fields change
  useEffect(() => {
    const checkDuplicates = async () => {
      const formValues = form.getValues();
      if (!formValues.full_name && !formValues.phone_number && !formValues.email) {
        setDuplicates([]);
        return;
      }

      const matches = await findPotentialDuplicates({
        id: customerId,
        full_name: formValues.full_name,
        phone_number: formValues.phone_number,
        email: formValues.email
      });

      setDuplicates(matches);
      setShowDuplicateWarning(matches.length > 0);
    };

    const debouncedCheck = debounce(checkDuplicates, 500);
    
    const subscription = form.watch((value, { name }) => {
      if (['full_name', 'phone_number', 'email'].includes(name || '')) {
        debouncedCheck();
      }
    });

    return () => {
      subscription.unsubscribe();
      debouncedCheck.cancel();
    };
  }, [form, customerId]);

  const saveFormData = async (data: any) => {
    if (!customerId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          form_data: data,
          last_form_save: new Date().toISOString()
        })
        .eq('id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  const debouncedSave = debounce((data) => {
    saveFormData(data);
  }, 1000);

  useEffect(() => {
    const subscription = form.watch((data) => {
      debouncedSave(data);
    });

    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };
  }, [form, debouncedSave]);

  useEffect(() => {
    const loadSavedFormData = async () => {
      if (!customerId) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('form_data')
          .eq('id', customerId)
          .single();

        if (error) throw error;
        if (data?.form_data) {
          Object.entries(data.form_data).forEach(([key, value]) => {
            form.setValue(key, value);
          });
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    };

    loadSavedFormData();
  }, [customerId]);

  return (
    <div className="space-y-6">
      {showDuplicateWarning && (
        <DuplicateWarning 
          duplicates={duplicates} 
          onDismiss={() => setShowDuplicateWarning(false)} 
        />
      )}

      {/* Profile Completion Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Profile Completion</span>
          <Badge variant={profileScore >= 80 ? "success" : "warning"}>
            {profileScore}%
          </Badge>
        </div>
        <Progress value={profileScore} className="h-2" />
      </div>

      <FormField
        control={form.control}
        name="full_name"
        rules={{ required: "Full name is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter full name" 
                {...field} 
                onChange={(e) => {
                  const words = e.target.value.split(' ');
                  const capitalized = words.map(word => 
                    word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                  ).join(' ');
                  field.onChange(capitalized);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nationality"
        rules={{ required: "Nationality is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nationality</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter nationality" 
                {...field}
                onChange={(e) => {
                  const capitalized = e.target.value.charAt(0).toUpperCase() + 
                                    e.target.value.slice(1).toLowerCase();
                  field.onChange(capitalized);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="driver_license"
        rules={{ required: "Driver license is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Driver License</FormLabel>
            <FormControl>
              <Input placeholder="Enter driver license number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="license_document_expiry"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>License Expiry Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date < new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        rules={{ 
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address"
          }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Enter email address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone_number"
        rules={{ 
          required: "Phone number is required",
          pattern: {
            value: /^(\+974|974)?[0-9]{8}$/,
            message: "Please enter a valid Qatar phone number"
          }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter phone number" 
                {...field}
                onChange={handlePhoneNumberChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        rules={{ required: "Address is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter full address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="id_document_expiry"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>ID Document Expiry Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date < new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <ContractDocumentUpload
        label="ID Document"
        fieldName="id_document_url"
        onUploadComplete={(url) => form.setValue('id_document_url', url)}
      />

      <ContractDocumentUpload
        label="Driver License Document"
        fieldName="license_document_url"
        onUploadComplete={(url) => form.setValue('license_document_url', url)}
      />
    </div>
  );
};

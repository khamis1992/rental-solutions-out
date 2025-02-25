import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

type AutomationRule = {
  id: string
  name: string
  description?: string
  template_id: string
  trigger_type: 'welcome' | 'contract_confirmation' | 'payment_reminder' | 'late_payment' | 'insurance_renewal' | 'legal_notice'
  conditions: Record<string, any>
  timing_type: 'before' | 'after' | 'on'
  timing_value: number
  is_active: boolean
  email_templates?: {
    id: string
    name: string
  }
}

interface CreateAutomationRuleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editingRule: AutomationRule | null
}

const availableVariables: Record<string, string> = {
  customer_name: 'اسم العميل',
  customer_email: 'بريد العميل الإلكتروني',
  contract_start_date: 'تاريخ بداية العقد',
  contract_end_date: 'تاريخ نهاية العقد',
  property_address: 'عنوان العقار',
  payment_amount: 'مبلغ الدفعة',
  payment_due_date: 'تاريخ استحقاق الدفعة',
  late_fee_amount: 'مبلغ رسوم التأخير',
  days_overdue: 'عدد أيام التأخير',
  insurance_expiry_date: 'تاريخ انتهاء صلاحية التأمين',
  legal_notice_details: 'تفاصيل الإشعار القانوني',
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Rule name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  template_id: z.string().uuid({
    message: "Please select a template.",
  }),
  trigger_type: z.enum(['welcome', 'contract_confirmation', 'payment_reminder', 'late_payment', 'insurance_renewal', 'legal_notice']),
  conditions: z.record(z.any()).optional(),
  timing_type: z.enum(['before', 'after', 'on']),
  timing_value: z.number().min(0, {
    message: "Timing value must be a positive number.",
  }),
  is_active: z.boolean().default(true),
})

export const CustomAutomationRule = ({
  open,
  onOpenChange,
  onSuccess,
  editingRule
}: CreateAutomationRuleProps) => {
  const [triggerType, setTriggerType] = useState(editingRule?.trigger_type || 'welcome')

  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingRule?.name || "",
      description: editingRule?.description || "",
      template_id: editingRule?.template_id || "",
      trigger_type: editingRule?.trigger_type || 'welcome',
      conditions: editingRule?.conditions || {},
      timing_type: editingRule?.timing_type || 'before',
      timing_value: editingRule?.timing_value || 0,
      is_active: editingRule?.is_active || true,
    },
  })

  const { data: templates } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingRule) {
        // Update existing rule
        const { error } = await supabase
          .from('email_automation_rules')
          .update(values)
          .eq('id', editingRule.id)

        if (error) throw error
      } else {
        // Create new rule
        const { error } = await supabase
          .from('email_automation_rules')
          .insert(values)

        if (error) throw error
      }

      toast({
        title: "Success",
        description: "Rule saved successfully!",
      })
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save rule. Please check your configuration.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (editingRule) {
      form.reset({
        name: editingRule.name,
        description: editingRule.description || "",
        template_id: editingRule.template_id,
        trigger_type: editingRule.trigger_type,
        conditions: editingRule.conditions || {},
        timing_type: editingRule.timing_type,
        timing_value: editingRule.timing_value,
        is_active: editingRule.is_active,
      })
      setTriggerType(editingRule.trigger_type)
    } else {
      form.reset()
      setTriggerType('welcome')
    }
  }, [editingRule, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingRule ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Rule Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Rule Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="template_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trigger_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trigger Type</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value)
                    setTriggerType(value)
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a trigger type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="contract_confirmation">Contract Confirmation</SelectItem>
                      <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                      <SelectItem value="late_payment">Late Payment</SelectItem>
                      <SelectItem value="insurance_renewal">Insurance Renewal</SelectItem>
                      <SelectItem value="legal_notice">Legal Notice</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {triggerType && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Available variables for this trigger type:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(availableVariables).map(([key, label]) => (
                    <Badge key={key} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="timing_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timing</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="before">Before</SelectItem>
                        <SelectItem value="after">After</SelectItem>
                        <SelectItem value="on">On</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormField
                      control={form.control}
                      name="timing_value"
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Days"
                            className="w-24"
                            {...field}
                          />
                        </FormControl>
                      )}
                    />
                    <span>Days</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

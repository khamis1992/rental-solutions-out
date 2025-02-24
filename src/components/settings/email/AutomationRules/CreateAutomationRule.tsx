
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
import { useEffect } from "react"

const formSchema = z.object({
  name: z.string().min(1, "الرجاء إدخال اسم القاعدة"),
  description: z.string().optional(),
  trigger_type: z.enum(['welcome', 'contract_confirmation', 'payment_reminder', 'late_payment', 'insurance_renewal', 'legal_notice']),
  template_id: z.string().min(1, "الرجاء اختيار القالب"),
  timing_type: z.enum(['before', 'after', 'on']),
  timing_value: z.number().min(0),
})

type FormValues = z.infer<typeof formSchema>

interface CreateAutomationRuleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editingRule?: {
    id: string
    name: string
    description?: string
    template_id: string
    trigger_type: 'welcome' | 'contract_confirmation' | 'payment_reminder' | 'late_payment' | 'insurance_renewal' | 'legal_notice'
    timing_type: 'before' | 'after' | 'on'
    timing_value: number
  } | null
}

export const CreateAutomationRule = ({
  open,
  onOpenChange,
  onSuccess,
  editingRule
}: CreateAutomationRuleProps) => {
  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timing_value: 0,
    }
  })

  useEffect(() => {
    if (editingRule) {
      form.reset({
        name: editingRule.name,
        description: editingRule.description,
        trigger_type: editingRule.trigger_type,
        template_id: editingRule.template_id,
        timing_type: editingRule.timing_type,
        timing_value: editingRule.timing_value,
      })
    } else {
      form.reset({
        timing_value: 0,
      })
    }
  }, [editingRule, form])

  const { data: templates } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
      
      if (error) throw error
      return data || []
    }
  })

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingRule) {
        const { error } = await supabase
          .from('email_automation_rules')
          .update({
            ...values,
            conditions: {},
          })
          .eq('id', editingRule.id)

        if (error) throw error

        toast({
          title: "تم بنجاح",
          description: "تم تحديث قاعدة البريد التلقائي بنجاح",
        })
      } else {
        const { error } = await supabase
          .from('email_automation_rules')
          .insert({
            ...values,
            conditions: {},
            is_active: true
          })

        if (error) throw error

        toast({
          title: "تم بنجاح",
          description: "تم إنشاء قاعدة البريد التلقائي بنجاح",
        })
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving automation rule:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ القاعدة",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {editingRule ? "تعديل قاعدة البريد التلقائي" : "إضافة قاعدة بريد تلقائي جديدة"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم القاعدة</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trigger_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع القاعدة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع القاعدة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="welcome">رسائل الترحيب</SelectItem>
                      <SelectItem value="contract_confirmation">تأكيد العقد</SelectItem>
                      <SelectItem value="payment_reminder">تذكير بالدفع</SelectItem>
                      <SelectItem value="late_payment">إشعار التأخر في السداد</SelectItem>
                      <SelectItem value="insurance_renewal">تذكير تجديد التأمين</SelectItem>
                      <SelectItem value="legal_notice">إشعار قانوني</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>قالب البريد</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر القالب" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timing_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع التوقيت</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع التوقيت" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="before">قبل</SelectItem>
                      <SelectItem value="after">بعد</SelectItem>
                      <SelectItem value="on">في</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timing_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عدد الأيام</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit">
                {editingRule ? "حفظ التغييرات" : "حفظ"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

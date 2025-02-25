
import { useQuery } from "@tanstack/react-query"
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Plus, Pencil } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { CustomAutomationRule } from "./CustomAutomationRule"

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

// Default automation rules
const DEFAULT_RULES: Partial<AutomationRule>[] = [
  {
    name: "رسالة ترحيب للعملاء الجدد",
    description: "إرسال رسالة ترحيب تلقائية عند إنشاء حساب العميل",
    trigger_type: "welcome",
    conditions: { event: "new_customer" },
    timing_type: "after",
    timing_value: 0,
    is_active: true
  },
  {
    name: "تأكيد العقد",
    description: "إرسال تأكيد تلقائي عند توقيع العقد",
    trigger_type: "contract_confirmation",
    conditions: { event: "contract_signed" },
    timing_type: "after",
    timing_value: 0,
    is_active: true
  },
  {
    name: "تذكير بموعد الدفع",
    description: "تذكير قبل موعد الدفع بثلاثة أيام",
    trigger_type: "payment_reminder",
    conditions: { event: "payment_due" },
    timing_type: "before",
    timing_value: 3,
    is_active: true
  },
  {
    name: "إشعار التأخر في السداد",
    description: "إشعار عند تأخر الدفع",
    trigger_type: "late_payment",
    conditions: { event: "payment_overdue" },
    timing_type: "after",
    timing_value: 1,
    is_active: true
  },
  {
    name: "تذكير تجديد التأمين",
    description: "تذكير قبل انتهاء التأمين بأسبوع",
    trigger_type: "insurance_renewal",
    conditions: { event: "insurance_expiring" },
    timing_type: "before",
    timing_value: 7,
    is_active: true
  },
  {
    name: "إشعار قانوني",
    description: "إرسال إشعار قانوني للمدفوعات المتأخرة",
    trigger_type: "legal_notice",
    conditions: { event: "payment_very_late", days_overdue: 30 },
    timing_type: "after",
    timing_value: 30,
    is_active: true
  }
];

export const AutomationRulesList = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)
  const [showDefaultRules, setShowDefaultRules] = useState(false)

  const { data: rules, refetch } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_automation_rules')
        .select(`
          *,
          email_templates (
            id,
            name
          )
        `)
        .order('created_at')

      if (error) throw error
      return data as AutomationRule[]
    }
  })

  const handleAddDefaultRules = async () => {
    try {
      // Get templates by trigger type
      const { data: templates } = await supabase
        .from('email_templates')
        .select('id, template_type')
      
      const templatesByType = templates?.reduce((acc, template) => {
        if (template.template_type) {
          acc[template.template_type] = template.id;
        }
        return acc;
      }, {} as Record<string, string>);

      // Add default rules with matching templates
      const rulesToAdd = DEFAULT_RULES.map(rule => ({
        ...rule,
        template_id: templatesByType[rule.trigger_type as string] || null
      }));

      const { error } = await supabase
        .from('email_automation_rules')
        .insert(rulesToAdd)

      if (error) throw error

      refetch()
    } catch (error) {
      console.error('Error adding default rules:', error)
    }
  }

  const handleStatusChange = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('email_automation_rules')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) {
      console.error('Error updating rule status:', error)
      return
    }

    refetch()
  }

  const handleEdit = (rule: AutomationRule) => {
    setEditingRule(rule)
    setShowCreateDialog(true)
  }

  const getTriggerTypeLabel = (type: AutomationRule['trigger_type']) => {
    const labels: Record<string, string> = {
      'welcome': 'رسائل الترحيب',
      'contract_confirmation': 'تأكيد العقد',
      'payment_reminder': 'تذكير بالدفع',
      'late_payment': 'إشعار التأخر في السداد',
      'insurance_renewal': 'تذكير تجديد التأمين',
      'legal_notice': 'إشعار قانوني'
    }
    return labels[type] || type
  }

  const getTimingLabel = (type: AutomationRule['timing_type'], value: number) => {
    const timingLabels: Record<string, string> = {
      'before': 'قبل',
      'after': 'بعد',
      'on': 'في'
    }
    return `${timingLabels[type]} ${value} يوم`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>قواعد البريد التلقائي</CardTitle>
        <div className="space-x-2 rtl:space-x-reverse">
          {!rules?.length && (
            <Button 
              onClick={handleAddDefaultRules}
              variant="outline"
            >
              إضافة القواعد الافتراضية
            </Button>
          )}
          <Button 
            onClick={() => {
              setEditingRule(null)
              setShowCreateDialog(true)
            }}
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة قاعدة جديدة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>القالب</TableHead>
              <TableHead>التوقيت</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules?.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.name}</TableCell>
                <TableCell>{getTriggerTypeLabel(rule.trigger_type)}</TableCell>
                <TableCell>{rule.email_templates?.name}</TableCell>
                <TableCell>
                  {getTimingLabel(rule.timing_type, rule.timing_value)}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) => handleStatusChange(rule.id, checked)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(rule)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CustomAutomationRule 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false)
          setEditingRule(null)
          refetch()
        }}
        editingRule={editingRule}
      />
    </Card>
  )
}

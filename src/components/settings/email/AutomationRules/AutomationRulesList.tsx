
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
import { Plus } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { CreateAutomationRule } from "./CreateAutomationRule"

export const AutomationRulesList = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

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
      return data || []
    }
  })

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

  const getTriggerTypeLabel = (type: string) => {
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

  const getTimingLabel = (type: string, value: number) => {
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
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="mr-2"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة قاعدة جديدة
        </Button>
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
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules?.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>{rule.name}</TableCell>
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
                  {/* Add edit/delete actions here */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CreateAutomationRule 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false)
          refetch()
        }}
      />
    </Card>
  )
}

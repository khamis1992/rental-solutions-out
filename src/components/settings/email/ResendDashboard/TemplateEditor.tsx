
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from "@/integrations/supabase/client"
import { cn } from "@/lib/utils"

// Add standard variable groups
const VARIABLE_GROUPS = {
  customer: ['full_name', 'email', 'phone_number', 'address', 'nationality', 'driver_license'],
  agreement: ['agreement_number', 'start_date', 'end_date', 'rent_amount', 'total_amount', 'agreement_duration', 'daily_late_fee'],
  vehicle: ['make', 'model', 'year', 'color', 'license_plate', 'vin']
} as const;

interface TemplateEditorProps {
  templateId?: string;
  onSave?: () => void;
}

export const TemplateEditor = ({ templateId, onSave }: TemplateEditorProps) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [templateType, setTemplateType] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const { data: categories } = useQuery({
    queryKey: ['template-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_template_categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data || []
    }
  })

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm focus:outline-none max-w-none min-h-[200px] p-4',
          'text-right'
        ),
        dir: 'rtl',
      },
    },
  })

  const handleInsertVariable = (group: keyof typeof VARIABLE_GROUPS, variable: string) => {
    if (editor) {
      const variableText = `{{${group}.${variable}}}`
      editor.commands.insertContent(variableText)
    }
  }

  // Load template data if templateId is provided
  useEffect(() => {
    if (templateId) {
      const loadTemplate = async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .select(`
            *,
            email_template_categories(
              id,
              name
            )
          `)
          .eq('id', templateId)
          .single()

        if (error) {
          toast({
            title: "خطأ",
            description: "فشل في تحميل القالب",
            variant: "destructive"
          })
          return
        }

        if (data) {
          setName(data.name)
          setCategory(data.category)
          setTemplateType(data.template_type || '')
          editor?.commands.setContent(data.content)
        }
      }

      loadTemplate()
    }
  }, [templateId, editor, toast])

  const handlePreview = () => {
    if (!editor?.getHTML()) {
      toast({
        title: "خطأ",
        description: "لا يوجد محتوى للمعاينة",
        variant: "destructive"
      })
      return
    }
    setShowPreview(true)
  }

  const handleSave = useCallback(async () => {
    if (!name || !editor?.getHTML()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      })
      return
    }

    if (!category) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الفئة",
        variant: "destructive"
      })
      return
    }

    if (!templateType) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار نوع القالب",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    try {
      // Extract used variables from content
      const content = editor.getHTML()
      const variableRegex = /\{\{([^}]+)\}\}/g
      const usedVariables = Array.from(content.matchAll(variableRegex)).map(match => match[1])

      const template = {
        name,
        category: category,
        subject: name,
        content: editor.getHTML(),
        template_type: templateType,
        variable_mappings: {
          used_variables: usedVariables,
          groups: Object.keys(VARIABLE_GROUPS).filter(group => 
            usedVariables.some(v => v.startsWith(`${group}.`))
          )
        },
        is_active: true
      }

      if (templateId) {
        // Update existing template
        const { error: templateError } = await supabase
          .from('email_templates')
          .update(template)
          .eq('id', templateId)

        if (templateError) throw templateError

        // Create new version
        const { error: versionError } = await supabase
          .from('email_template_versions')
          .insert({
            template_id: templateId,
            content: editor.getHTML(),
            version_number: 1,
          })

        if (versionError) throw versionError
      } else {
        // Create new template
        const { data, error: templateError } = await supabase
          .from('email_templates')
          .insert(template)
          .select()

        if (templateError) throw templateError

        if (data && data[0]) {
          // Create initial version
          const { error: versionError } = await supabase
            .from('email_template_versions')
            .insert({
              template_id: data[0].id,
              content: editor.getHTML(),
              version_number: 1,
            })

          if (versionError) throw versionError
        }
      }

      toast({
        title: "تم بنجاح",
        description: "تم حفظ القالب بنجاح",
      })

      onSave?.()
      
      // Only reset form for new templates, not when editing
      if (!templateId) {
        setName('')
        editor?.commands.setContent('')
        setCategory('')
        setTemplateType('')
      }
      
    } catch (error) {
      console.error('Error saving template:', error)
      toast({
        title: "خطأ",
        description: "فشل في حفظ القالب",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }, [name, category, templateType, editor, templateId, toast, onSave])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {templateId ? 'تعديل القالب' : 'إنشاء قالب جديد'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" dir="rtl">
          <div className="space-y-2">
            <Label htmlFor="name">اسم القالب</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم القالب"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">الفئة</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="text-right">
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateType">نوع القالب</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger id="templateType" className="text-right">
                <SelectValue placeholder="اختر نوع القالب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">رسالة ترحيب</SelectItem>
                <SelectItem value="contract_confirmation">تأكيد العقد</SelectItem>
                <SelectItem value="payment_reminder">تذكير بالدفع</SelectItem>
                <SelectItem value="late_payment">تأخير الدفع</SelectItem>
                <SelectItem value="legal_notice">إشعار قانوني</SelectItem>
                <SelectItem value="insurance_renewal">تجديد التأمين</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>المتغيرات المتاحة</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(VARIABLE_GROUPS).map(([group, variables]) => (
                <div key={group} className="space-y-1">
                  <Label className="text-sm font-medium">{group}</Label>
                  <div className="flex flex-wrap gap-1">
                    {variables.map((variable) => (
                      <Button
                        key={variable}
                        variant="outline"
                        size="sm"
                        onClick={() => handleInsertVariable(group as keyof typeof VARIABLE_GROUPS, variable)}
                      >
                        {variable}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>المحتوى</Label>
            <div className="border rounded-md overflow-hidden">
              <EditorContent editor={editor} />
            </div>
          </div>

          <div className="flex justify-start space-x-2">
            <Button variant="outline" onClick={handlePreview}>معاينة</Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
            >
              {isSaving ? 'جاري الحفظ...' : 'حفظ القالب'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[800px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>معاينة القالب</DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-4 border rounded">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from "@/integrations/supabase/client"
import { cn } from "@/lib/utils"

interface TemplateEditorProps {
  templateId?: string;
  onSave?: () => void;
}

export const TemplateEditor = ({ templateId, onSave }: TemplateEditorProps) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
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
      return data
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

  // Preview handler
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

    setIsSaving(true)

    try {
      const template = {
        name,
        category_id: category,
        content: editor.getHTML(),
        variables: [], // Will be populated based on detected variables
      }

      if (templateId) {
        // Create new version
        const { error: versionError } = await supabase
          .from('email_template_versions')
          .insert({
            template_id: templateId,
            content: editor.getHTML(),
            version_number: 1, // This should be incremented based on existing versions
          })

        if (versionError) throw versionError

        // Update template
        const { error: templateError } = await supabase
          .from('email_templates')
          .update(template)
          .eq('id', templateId)

        if (templateError) throw templateError
      } else {
        // Create new template
        const { data, error: templateError } = await supabase
          .from('email_templates')
          .insert(template)
          .select()

        if (templateError) throw templateError

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

      toast({
        title: "تم بنجاح",
        description: "تم حفظ القالب بنجاح",
      })

      onSave?.()
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
  }, [name, category, editor, templateId, toast, onSave])

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

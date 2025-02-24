
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from "@/integrations/supabase/client"

interface TemplateEditorProps {
  templateId?: string;
  onSave?: () => void;
}

export const TemplateEditor = ({ templateId, onSave }: TemplateEditorProps) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
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
        class: 'prose prose-sm focus:outline-none max-w-none min-h-[200px] p-4',
      },
    },
  })

  const handleSave = useCallback(async () => {
    if (!name || !editor?.getHTML()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

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
        title: "Success",
        description: "Template saved successfully",
      })

      onSave?.()
    } catch (error) {
      console.error('Error saving template:', error)
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      })
    }
  }, [name, category, editor, templateId, toast, onSave])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {templateId ? 'Edit Template' : 'Create New Template'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter template name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
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
          <Label>Content</Label>
          <div className="border rounded-md">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline">Preview</Button>
          <Button onClick={handleSave}>Save Template</Button>
        </div>
      </CardContent>
    </Card>
  )
}

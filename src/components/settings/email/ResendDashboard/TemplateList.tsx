
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomTemplateEditor } from "../CustomTemplates/CustomTemplateEditor";

export const TemplateList = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsEditorOpen(true);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplateId(null);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreateTemplate}>
          Create Template
        </Button>
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplateId ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
          </DialogHeader>
          <CustomTemplateEditor
            templateId={selectedTemplateId}
            onSave={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

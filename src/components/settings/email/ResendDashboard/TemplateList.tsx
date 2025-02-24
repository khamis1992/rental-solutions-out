
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplateEditor } from "./TemplateEditor";

export function TemplateList() {
  return (
    <ScrollArea className="h-[80vh]">
      <div className="p-4">
        <TemplateEditor onSave={() => {}} />
      </div>
    </ScrollArea>
  );
}

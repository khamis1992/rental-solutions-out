
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["Ctrl", "→"], description: "Next step" },
      { keys: ["Ctrl", "←"], description: "Previous step" },
      { keys: ["Space"], description: "Pause/Resume workflow" },
      { keys: ["Esc"], description: "Quick pause" },
    ]
  },
  {
    title: "General",
    shortcuts: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Ctrl", "H"], description: "Show/Hide help" },
      { keys: ["Ctrl", "/"], description: "Focus search" },
    ]
  }
];

export function KeyboardShortcuts() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Boost your productivity with these keyboard shortcuts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h4 className="font-medium text-sm">{group.title}</h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold bg-muted rounded border"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { useHotkeys } from "react-hotkeys-hook";
import { useRef } from "react";

interface ViewToggleProps {
  viewMode: "grid" | "list" | "compact";
  onChange: (mode: "grid" | "list" | "compact") => void;
}

export const ViewToggle = ({
  viewMode,
  onChange
}: ViewToggleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useHotkeys('shift+g', () => {}, { preventDefault: false });
  useHotkeys('shift+l', () => {}, { preventDefault: false });
  useHotkeys('shift+t', () => {}, { preventDefault: false });
  
  useTouchGestures(containerRef, {
    onSwipeLeft: () => {},
    onSwipeRight: () => {}
  });
  
  return null;
};

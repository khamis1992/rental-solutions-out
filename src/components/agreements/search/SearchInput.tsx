
import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  onSearch,
  placeholder = "Search...",
  initialValue = "",
  className = ""
}, ref) => {
  // Empty component - search functionality removed
  return null;
});

SearchInput.displayName = "SearchInput";

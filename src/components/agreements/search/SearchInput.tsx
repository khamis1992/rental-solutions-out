
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export const SearchInput = ({
  onSearch,
  placeholder = "Search...",
  initialValue = "",
  className = ""
}: SearchInputProps) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  // Apply initial value when it changes
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        className="w-full pl-9 pr-4 py-2"
      />
    </div>
  );
};

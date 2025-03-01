
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect, forwardRef } from "react";

/**
 * SearchInput Props Interface
 * 
 * @property onSearch - Callback function triggered when search query changes
 * @property placeholder - Optional custom placeholder text for the search input
 * @property initialValue - Optional initial value for the search input
 * @property className - Optional CSS class names to apply to the component
 */
interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

/**
 * SearchInput Component
 * 
 * A reusable search input field component with a search icon.
 * Used throughout the application for filtering and searching data.
 * 
 * @component
 * @example
 * <SearchInput 
 *   onSearch={handleSearch}
 *   placeholder="Search agreements..."
 *   initialValue=""
 * />
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  onSearch,
  placeholder = "Search...",
  initialValue = "",
  className = ""
}, ref) => {
  // State to track the current search input value
  const [searchTerm, setSearchTerm] = useState(initialValue);
  
  // Update component state when initialValue prop changes
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);
  
  /**
   * Handles input changes and triggers the search callback
   * 
   * @param e - Input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  return (
    <div className={`relative w-full ${className}`}>
      {/* 
        Search Icon (magnifying glass)
        - Located at the left side of the input field
        - Part of the lucide-react icon library
        - Used consistently across the application for search functionality
        - Also found in:
          - Top navigation bar search
          - Customer list search
          - Vehicle list search
          - Agreement filters
       */}
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      
      {/* 
        Search Input Field
        - Uses the base Input component from UI library
        - Customized with left padding to accommodate the search icon
        - Styled with the application's design system variables
        - Connected to the search functionality through the onSearch prop
      */}
      <Input 
        ref={ref} 
        type="text" 
        value={searchTerm} 
        onChange={handleInputChange} 
        placeholder={placeholder} 
        className="pl-9 w-full" 
        style={{ 
          color: 'var(--foreground)',
          fontWeight: '500',
          backgroundColor: 'var(--background)',
          border: '1px solid var(--input)'
        }}
      />
    </div>
  );
});

// Display name for React DevTools
SearchInput.displayName = "SearchInput";

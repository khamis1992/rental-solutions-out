
import { useState, useCallback, useMemo } from "react";
import debounce from "lodash/debounce";

interface UseSearchOptions {
  initialValue?: string;
  debounceMs?: number;
  onChange?: (value: string) => void;
}

/**
 * Hook for search input with debouncing
 */
export function useSearch({
  initialValue = "",
  debounceMs = 300,
  onChange,
}: UseSearchOptions = {}) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  // Create debounced handler for search input changes
  const debouncedSetValue = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedValue(value);
        onChange?.(value);
      }, debounceMs),
    [debounceMs, onChange]
  );

  // Handler for search input changes
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      debouncedSetValue(value);
    },
    [debouncedSetValue]
  );

  // Reset search value and debounced value
  const resetSearch = useCallback(() => {
    setSearchValue("");
    setDebouncedValue("");
    onChange?.("");
  }, [onChange]);

  return {
    searchValue,
    debouncedValue,
    handleSearchChange,
    resetSearch,
    setSearchValue: (value: string) => {
      setSearchValue(value);
      debouncedSetValue(value);
    },
  };
}

interface UseSortOptions<T extends string> {
  initialField?: T;
  initialDirection?: "asc" | "desc";
  onChange?: (field: T, direction: "asc" | "desc") => void;
}

/**
 * Hook for managing sortable tables/lists
 */
export function useSort<T extends string>({
  initialField,
  initialDirection = "asc",
  onChange,
}: UseSortOptions<T> = {}) {
  const [sortField, setSortField] = useState<T | undefined>(initialField);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(initialDirection);

  const handleSort = useCallback(
    (field: T) => {
      let newDirection: "asc" | "desc" = "asc";
      
      if (field === sortField) {
        // Toggle direction if clicking the same field
        newDirection = sortDirection === "asc" ? "desc" : "asc";
        setSortDirection(newDirection);
      } else {
        // Set new field and default to desc for new sort field
        setSortField(field);
        setSortDirection("desc");
        newDirection = "desc";
      }
      
      onChange?.(field, newDirection);
    },
    [sortField, sortDirection, onChange]
  );

  return {
    sortField,
    sortDirection,
    handleSort,
    resetSort: () => {
      setSortField(initialField);
      setSortDirection(initialDirection);
    },
  };
}

export function useSelectableList<T extends { id: string | number }>(
  items: T[] = []
) {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const toggleItem = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds]
  );

  return {
    selectedIds,
    selectedItems,
    isSelected: (id: string | number) => selectedIds.has(id),
    toggleItem,
    selectAll,
    deselectAll,
    selectionCount: selectedIds.size,
    hasSelection: selectedIds.size > 0,
  };
}

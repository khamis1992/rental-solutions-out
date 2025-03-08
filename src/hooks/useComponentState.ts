
import { useState, useCallback, useRef, useEffect } from "react";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseAsyncStateOptions<T> {
  initialData?: T | null;
}

/**
 * Hook for managing async data state (loading, error, data)
 */
export function useAsyncState<T>({
  initialData = null,
}: UseAsyncStateOptions<T> = {}) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data, error: null }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState((prev) => ({ ...prev, error, isLoading: false }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
    });
  }, [initialData]);

  const execute = useCallback(
    async <R>(
      asyncFn: () => Promise<R>,
      options: {
        onSuccess?: (data: R) => void;
        onError?: (error: Error) => void;
        transform?: (data: R) => T;
      } = {}
    ) => {
      setLoading(true);
      try {
        const result = await asyncFn();
        
        if (options.transform) {
          setData(options.transform(result));
        } else {
          setData(result as unknown as T);
        }
        
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setData, setError, setLoading]
  );

  return {
    ...state,
    setData,
    setError,
    setLoading,
    reset,
    execute,
  };
}

/**
 * Hook for managing dialog/modal state
 */
export function useDialog(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [dialogData, setDialogData] = useState<any>(null);

  const open = useCallback((data: any = null) => {
    setDialogData(data);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Don't immediately clear data so dialog can fade out properly
    setTimeout(() => setDialogData(null), 300);
  }, []);

  return {
    isOpen,
    dialogData,
    open,
    close,
    toggle: () => setIsOpen((prev) => !prev),
  };
}

/**
 * Hook for managing pagination state
 */
export function usePagination({
  initialPage = 0,
  initialPageSize = 10,
  totalItems = 0,
  onChange,
}: {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  onChange?: (page: number, pageSize: number) => void;
} = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure page is within bounds when total items changes
  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [totalItems, pageSize, page, totalPages]);

  const changePage = useCallback(
    (newPage: number) => {
      const boundedPage = Math.max(0, Math.min(newPage, totalPages - 1));
      setPage(boundedPage);
      onChange?.(boundedPage, pageSize);
    },
    [totalPages, pageSize, onChange]
  );

  const changePageSize = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      // Adjust current page to preserve position when changing page size
      const newTotalPages = Math.ceil(totalItems / newPageSize);
      const currentItem = page * pageSize;
      const newPage = Math.min(
        Math.floor(currentItem / newPageSize),
        newTotalPages - 1
      );
      setPage(newPage);
      onChange?.(newPage, newPageSize);
    },
    [totalItems, page, pageSize, onChange]
  );

  return {
    page,
    pageSize,
    totalPages,
    hasPreviousPage: page > 0,
    hasNextPage: page < totalPages - 1,
    setPage: changePage,
    setPageSize: changePageSize,
    firstPage: () => changePage(0),
    previousPage: () => changePage(page - 1),
    nextPage: () => changePage(page + 1),
    lastPage: () => changePage(totalPages - 1),
  };
}

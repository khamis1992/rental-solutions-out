
import { useQuery } from "@tanstack/react-query";

export const useSearch = (debouncedSearch: string) => {
  return useQuery({
    queryKey: ["search", debouncedSearch],
    queryFn: async () => {
      // Search functionality removed
      return { vehicles: [], customers: [], agreements: [] };
    },
    enabled: false,
  });
};

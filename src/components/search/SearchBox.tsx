import { useState, useCallback, useEffect } from "react";
import { Search, Keyboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  CommandDialog,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { VehicleDetailsDialog } from "@/components/vehicles/VehicleDetailsDialog";
import { CustomerDetailsDialog } from "@/components/customers/CustomerDetailsDialog";
import { AgreementDetailsDialog } from "@/components/agreements/AgreementDetailsDialog";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearch } from "@/components/search/useSearch";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";

export const SearchBox = () => {
  return null;
};

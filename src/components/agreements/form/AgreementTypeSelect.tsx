
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AgreementTypeSelectProps {
  register: any;
}

export const AgreementTypeSelect = ({ register }: AgreementTypeSelectProps) => {
  // Set default value when component mounts
  useEffect(() => {
    register("agreementType").onChange({
      target: { value: "lease_to_own" },
    });
  }, [register]);

  return (
    <div className="space-y-2">
      <Label htmlFor="agreementType">Agreement Type</Label>
      <Select
        defaultValue="lease_to_own"
        {...register("agreementType")}
        onValueChange={(value) =>
          register("agreementType").onChange({
            target: { value },
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lease_to_own">Lease to Own</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

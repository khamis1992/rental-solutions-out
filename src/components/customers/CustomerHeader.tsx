
import { Users } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

export const CustomerHeader = () => {
  return (
    <CardHeader className="pb-4">
      <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        Customers
      </CardTitle>
    </CardHeader>
  );
};

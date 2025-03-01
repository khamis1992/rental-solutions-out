
import React, { useState } from "react";
import { HeaderlessAgreementList } from "./HeaderlessAgreementList";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const HeaderlessAgreementDemo = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">Agreements</h1>
      
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search agreements..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>
      
      <div className="mt-8">
        <HeaderlessAgreementList searchQuery={searchQuery} />
      </div>
    </div>
  );
};

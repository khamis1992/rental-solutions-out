
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProfileManagementProps {
  customerId: string;
}

export const ProfileManagement = ({ customerId }: ProfileManagementProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    address: ""
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['customer-profile', customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("No customer ID provided");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!customerId
  });

  // Set form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone_number: profile.phone_number || "",
        email: profile.email || "",
        address: profile.address || ""
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone_number: data.phone_number,
          email: data.email,
          address: data.address,
          updated_at: new Date().toISOString()
        })
        .eq("id", customerId);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ['customer-profile', customerId] });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId) return;
    
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Profile not found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Your phone number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="Your email address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="Your address"
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Update Profile"
          )}
        </Button>
      </form>

      <div className="mt-8 border-t pt-6">
        <h3 className="font-medium text-lg mb-4">Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-md p-4 bg-muted/50">
            <h4 className="font-medium mb-2">ID Document</h4>
            <p className="text-sm text-muted-foreground">
              {profile.id_document_url ? "Document uploaded" : "No document uploaded"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Status: {profile.document_verification_status || "Not verified"}
            </p>
          </div>
          
          <div className="border rounded-md p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Driver's License</h4>
            <p className="text-sm text-muted-foreground">
              {profile.license_document_url ? "Document uploaded" : "No document uploaded"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Status: {profile.document_verification_status || "Not verified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

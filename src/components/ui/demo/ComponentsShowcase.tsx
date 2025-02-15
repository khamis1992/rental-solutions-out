
import { Settings, User, Bell } from "lucide-react";
import { NavMenu } from "../navigation/NavMenu";
import { ContentCard } from "../cards/ContentCard";
import { FormField } from "../form/FormField";
import { Input } from "../input";
import { Button } from "../button";
import { LoadingOverlay } from "../loading/LoadingOverlay";
import { Skeleton } from "../loading/Skeleton";

const navigationItems = [
  {
    icon: User,
    label: "Profile",
    href: "/profile",
    description: "View and edit your profile"
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "/notifications",
    description: "Manage your notifications"
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
    description: "Application settings"
  }
];

export function ComponentsShowcase() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Navigation Demo */}
      <ContentCard
        title="Navigation Menu"
        description="Example of the navigation component"
      >
        <NavMenu items={navigationItems} />
      </ContentCard>

      {/* Form Fields Demo */}
      <ContentCard
        title="Form Fields"
        description="Example of form field components"
      >
        <form className="space-y-4">
          <FormField label="Username" required>
            <Input placeholder="Enter your username" />
          </FormField>
          <FormField
            label="Email"
            helper="We'll never share your email"
            error="Please enter a valid email"
          >
            <Input type="email" placeholder="Enter your email" />
          </FormField>
          <Button>Submit</Button>
        </form>
      </ContentCard>

      {/* Loading States Demo */}
      <ContentCard
        title="Loading States"
        description="Example of loading components"
      >
        <div className="space-y-4">
          <div className="relative h-32 border rounded-lg">
            <LoadingOverlay text="Loading content..." />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton variant="rectangular" className="h-32" />
          </div>
        </div>
      </ContentCard>
    </div>
  );
}

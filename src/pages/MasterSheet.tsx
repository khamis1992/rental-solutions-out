
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MasterSheet = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Master Sheet</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Intelligence Master Sheet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Welcome to the Master Sheet. This section will help you manage and analyze your business intelligence data.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MasterSheet;

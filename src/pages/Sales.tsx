
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function Sales() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <ErrorBoundary>
          <div className="px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Sales Dashboard</h1>
            <div className="mt-6">
              {/* Sales content will go here */}
              <p className="text-gray-500">Sales management dashboard coming soon...</p>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}

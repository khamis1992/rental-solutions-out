
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AIAgentChat } from "@/components/ai/AIAgentChat";

const AIHelp = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">AI Assistant</h1>
        <AIAgentChat />
      </div>
    </DashboardLayout>
  );
};

export default AIHelp;

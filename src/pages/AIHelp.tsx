
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AIAgentChat } from "@/components/ai/AIAgentChat";
import { ChevronRight, Bot } from "lucide-react";

const AIHelp = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section with Professional Gradient */}
      <div className="relative bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-b">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
        
        {/* Content Container */}
        <div className="relative w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Enhanced Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-blue-100 hover:bg-blue-50 transition-all duration-300 shadow-sm">
              <Bot className="h-4 w-4 text-blue-500" />
              <span className="font-medium">AI Assistant</span>
            </div>
            <ChevronRight className="h-4 w-4 text-blue-300" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 backdrop-blur-md border border-blue-200 shadow-sm">
              <span className="font-medium text-blue-700">Chat</span>
            </div>
          </nav>

          {/* Title Section */}
          <div className="mb-10">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-transparent bg-clip-text mb-2">
                  AI Assistant
                </h1>
                <p className="text-gray-600 text-lg">
                  Get instant help and answers to your questions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AIAgentChat />
      </div>
    </div>
  );
};

export default AIHelp;

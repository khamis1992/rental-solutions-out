
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Bot, Send, Loader2 } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  message: string;
  agent: string;
  tools: string[];
}

export const AIAgentChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('assistant');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    const userMessage = { role: 'user' as const, content: newMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    try {
      const { data, error } = await supabase.functions.invoke<AIResponse>('ai-agent', {
        body: {
          messages: [...messages, userMessage],
          agentType: selectedAgent,
          context: window.location.pathname
        }
      });

      if (error) throw error;

      if (data) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.message }
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response from AI agent');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">AI Agent Chat</CardTitle>
        <Select
          value={selectedAgent}
          onValueChange={setSelectedAgent}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select agent type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer_service">Customer Service</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
            <SelectItem value="assistant">Assistant</SelectItem>
            <SelectItem value="document_processor">Document Processor</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 h-[400px] overflow-y-auto p-4 bg-muted rounded-lg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-secondary text-secondary-foreground mr-4'
                }`}
              >
                {message.role === 'assistant' && (
                  <Bot className="h-4 w-4 mb-1 inline-block mr-2" />
                )}
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground p-3 rounded-lg mr-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

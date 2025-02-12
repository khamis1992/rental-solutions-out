
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentConfig {
  role: 'customer_service' | 'analytics' | 'assistant' | 'document_processor';
  prompt: string;
  tools: string[];
}

const agentConfigs: Record<string, AgentConfig> = {
  customer_service: {
    role: 'customer_service',
    prompt: `You are a helpful customer service agent for a vehicle rental company. You should:
    1. Be polite and professional
    2. Help users with their inquiries about vehicles and rentals
    3. Provide accurate information about our services
    4. Assist with basic troubleshooting
    5. Route complex issues to human support`,
    tools: ['FAQ_ACCESS', 'USER_HISTORY', 'SUPPORT_ROUTING']
  },
  analytics: {
    role: 'analytics',
    prompt: `You are an analytics expert for a vehicle rental company. You should:
    1. Analyze location tracking data
    2. Generate insights about usage patterns
    3. Create detailed reports
    4. Identify trends and anomalies
    5. Provide data-driven recommendations`,
    tools: ['DATA_ANALYSIS', 'VISUALIZATION', 'REPORTING']
  },
  assistant: {
    role: 'assistant',
    prompt: `You are a helpful assistant for a vehicle rental application. You should:
    1. Help users navigate the application
    2. Explain features and functionality
    3. Guide users through processes
    4. Provide tips and shortcuts
    5. Maintain conversation context`,
    tools: ['NAVIGATION', 'FEATURE_DEMO', 'CONTEXTUAL_HELP']
  },
  document_processor: {
    role: 'document_processor',
    prompt: `You are a document processing specialist for a vehicle rental company. You should:
    1. Analyze uploaded documents
    2. Extract key information
    3. Process forms and agreements
    4. Validate document completeness
    5. Suggest corrections when needed`,
    tools: ['DOCUMENT_ANALYSIS', 'INFORMATION_EXTRACTION', 'VALIDATION']
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentType, context } = await req.json();
    console.log('Processing AI agent request:', { agentType, messageCount: messages.length, hasContext: !!context });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    if (!agentType || !agentConfigs[agentType]) {
      throw new Error('Invalid or missing agent type');
    }

    const agentConfig = agentConfigs[agentType];
    const userMessage = messages[messages.length - 1].content;
    
    // Log interaction for analysis
    const { error: logError } = await supabase
      .from('ai_query_history')
      .insert({
        query: userMessage,
        agent_type: agentType,
        context: context || null,
        success_rate: 1.0
      });

    if (logError) {
      console.error('Error logging query:', logError);
    }

    // Call DeepSeek API with agent-specific configuration
    console.log('Calling DeepSeek API with agent configuration...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: agentConfig.prompt
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error response:', errorText);
      throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API response received');

    if (!data.choices?.[0]?.message) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    return new Response(
      JSON.stringify({ 
        message: data.choices[0].message.content,
        agent: agentType,
        tools: agentConfig.tools
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in AI agent function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred processing your request' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

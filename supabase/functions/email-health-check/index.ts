
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("FROM_EMAIL") || "info@alaraf.online";

const ALERT_THRESHOLD = parseFloat(Deno.env.get('ALERT_THRESHOLD_PERCENT') || '20') / 100;
const ALERT_EMAIL = Deno.env.get('ALERT_EMAIL') || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

interface HealthReport {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  metrics: {
    total_sent: number;
    successful_sent: number; 
    failed_sent: number;
    rate_limited_count: number;
    failure_rate: number;
    pending_queue: number;
  };
  timestamp: string;
}

async function sendAlertEmail(report: HealthReport) {
  if (!ALERT_EMAIL) {
    console.log("No alert email configured, skipping alert");
    return;
  }
  
  try {
    const statusColor = 
      report.status === 'critical' ? '#DC2626' : 
      report.status === 'warning' ? '#F59E0B' : 
      '#10B981';
    
    await resend.emails.send({
      from: fromEmail,
      to: ALERT_EMAIL,
      subject: `[${report.status.toUpperCase()}] Email System Alert`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${statusColor}; text-transform: uppercase;">
            ${report.status} Alert
          </h1>
          <p style="font-size: 16px; margin-bottom: 20px;">${report.message}</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="font-size: 18px; margin-top: 0;">Current Metrics</h2>
            <ul style="padding-left: 20px;">
              <li><strong>Total Sent:</strong> ${report.metrics.total_sent}</li>
              <li><strong>Successful:</strong> ${report.metrics.successful_sent}</li>
              <li><strong>Failed:</strong> ${report.metrics.failed_sent}</li>
              <li><strong>Rate Limited:</strong> ${report.metrics.rate_limited_count}</li>
              <li><strong>Failure Rate:</strong> ${(report.metrics.failure_rate * 100).toFixed(1)}%</li>
              <li><strong>Pending Queue:</strong> ${report.metrics.pending_queue}</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #6c757d;">
            This is an automated alert sent at ${new Date(report.timestamp).toLocaleString()}.
            Please check the email system dashboards for more details.
          </p>
        </div>
      `,
    });
    
    console.log("Alert email sent successfully");
    
  } catch (error) {
    console.error("Failed to send alert email:", error);
  }
}

async function checkSystemHealth(): Promise<HealthReport> {
  // Get email metrics
  const { data: metrics } = await supabase
    .from('email_sending_metrics')
    .select('*')
    .order('date_bucket', { ascending: false })
    .limit(1);
    
  // Get pending queue count
  const { data: queue } = await supabase
    .from('email_notification_queue')
    .select('status, count(*)')
    .eq('status', 'pending')
    .group('status')
    .single();
    
  // Get recent failures
  const { data: failedEmails } = await supabase
    .from('email_notification_logs')
    .select('status, count(*)')
    .eq('status', 'failed')
    .created_at('gte', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .group('status')
    .single();
    
  const currentMetrics = metrics?.[0] || { 
    total_sent: 0, 
    successful_sent: 0, 
    failed_sent: 0, 
    rate_limited_count: 0 
  };
  
  const pendingCount = queue?.count || 0;
  const recentFailures = failedEmails?.count || 0;
  
  const failureRate = currentMetrics.total_sent > 0 ?
    currentMetrics.failed_sent / currentMetrics.total_sent : 0;
    
  const rateLimitRate = currentMetrics.total_sent > 0 ?
    currentMetrics.rate_limited_count / currentMetrics.total_sent : 0;
    
  // Determine system status
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  let message = 'System operating normally';
  
  if (failureRate > ALERT_THRESHOLD) {
    status = 'critical';
    message = `High failure rate detected: ${(failureRate * 100).toFixed(1)}%`;
  } else if (rateLimitRate > 0.1) {
    status = 'warning';
    message = 'Rate limiting issues detected';
  } else if (pendingCount > 100) {
    status = 'warning';
    message = 'Large email backlog detected';
  } else if (recentFailures > 10) {
    status = 'warning';
    message = 'Multiple recent failures detected';
  }
  
  // Create health report
  const report: HealthReport = {
    status,
    message,
    metrics: {
      total_sent: currentMetrics.total_sent,
      successful_sent: currentMetrics.successful_sent,
      failed_sent: currentMetrics.failed_sent,
      rate_limited_count: currentMetrics.rate_limited_count,
      failure_rate: failureRate,
      pending_queue: pendingCount
    },
    timestamp: new Date().toISOString()
  };
  
  // Send alert if system is not healthy
  if (status !== 'healthy') {
    await sendAlertEmail(report);
    
    // Record alert in the database
    await supabase
      .from('email_system_alerts')
      .insert({
        status,
        message,
        metrics: report.metrics,
        resolved: false
      });
  }
  
  return report;
}

async function processEmailQueue() {
  // Find emails that are scheduled to be sent now or in the past
  const { data: queuedEmails, error } = await supabase
    .from('email_notification_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(50); // Process in batches
    
  if (error || !queuedEmails || queuedEmails.length === 0) {
    console.log("No emails to process in queue");
    return;
  }
  
  console.log(`Processing ${queuedEmails.length} queued emails`);
  
  for (const email of queuedEmails) {
    try {
      // Fetch template
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', email.template_id)
        .single();
        
      if (!template) {
        throw new Error('Template not found');
      }
      
      // Send the email
      const { id } = await resend.emails.send({
        from: fromEmail,
        to: email.recipient_email,
        subject: template.subject || 'No Subject',
        html: email.processed_content || template.content,
      });
      
      // Update queue status
      await supabase
        .from('email_notification_queue')
        .update({ 
          status: 'sent',
          processed_at: new Date().toISOString() 
        })
        .eq('id', email.id);
        
      // Log the sent email
      await supabase
        .from('email_notification_logs')
        .insert({
          template_id: email.template_id,
          recipient_email: email.recipient_email,
          status: 'sent',
          message_id: id,
          metadata: email.metadata
        });
        
      // Update metrics
      await supabase.rpc('increment_email_metric', {
        p_metric_type: 'successful_sent',
        p_count: 1
      });
      
    } catch (error) {
      console.error(`Error processing queued email ${email.id}:`, error);
      
      const isRateLimit = error.message?.includes('rate limit');
      const retryCount = (email.retry_count || 0) + 1;
      const maxRetries = 5;
      
      if (retryCount >= maxRetries) {
        // Mark as failed after max retries
        await supabase
          .from('email_notification_queue')
          .update({ 
            status: 'failed',
            error_message: error.message,
            retry_count: retryCount,
            last_retry_at: new Date().toISOString()
          })
          .eq('id', email.id);
      } else {
        // Schedule retry with exponential backoff
        const backoffDelayMs = Math.min(
          200 * Math.pow(2, retryCount),
          30000 // Max 30 seconds
        );
        
        const retryTime = new Date(Date.now() + backoffDelayMs);
        
        await supabase
          .from('email_notification_queue')
          .update({ 
            retry_count: retryCount,
            scheduled_for: retryTime.toISOString(),
            last_retry_at: new Date().toISOString()
          })
          .eq('id', email.id);
      }
      
      // Update metrics
      if (isRateLimit) {
        await supabase.rpc('increment_email_metric', {
          p_metric_type: 'rate_limited_count',
          p_count: 1
        });
      } else {
        await supabase.rpc('increment_email_metric', {
          p_metric_type: 'failed_sent',
          p_count: 1
        });
      }
    }
  }
}

// Main handler for the function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Process health check
    const healthReport = await checkSystemHealth();
    
    // Process email queue
    await processEmailQueue();
    
    // Return health status
    return new Response(
      JSON.stringify({ 
        success: true,
        healthCheck: healthReport
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in email health check:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

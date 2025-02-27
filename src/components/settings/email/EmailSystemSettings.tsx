
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const EmailSystemSettings = () => {
  const [maxRetries, setMaxRetries] = useState(5);
  const [retryDelay, setRetryDelay] = useState(200);
  const [maxRetryDelay, setMaxRetryDelay] = useState(30000);
  const [bounceHandling, setBounceHandling] = useState(true);
  const [autoUnsubscribe, setAutoUnsubscribe] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Fetch current system health
  const { data: healthStatus, isLoading, refetch } = useQuery({
    queryKey: ['email-system-health'],
    queryFn: async () => {
      const { data: metrics } = await supabase
        .from('email_sending_metrics')
        .select('*')
        .order('date_bucket', { ascending: false })
        .limit(1);
        
      const { data: queue } = await supabase
        .from('email_notification_queue')
        .select('status, count(*)')
        .eq('status', 'pending')
        .group('status')
        .single();
        
      const { data: optOuts } = await supabase
        .from('email_opt_outs')
        .select('count(*)', { count: 'exact' });
        
      return {
        metrics: metrics?.[0] || null,
        pendingCount: queue?.count || 0,
        optOutCount: optOuts?.count || 0,
        lastChecked: new Date().toISOString()
      };
    },
    refetchInterval: 60000 // Check every minute
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save settings to database
      await supabase
        .from('email_system_settings')
        .upsert({
          id: '1',
          max_retries: maxRetries,
          retry_delay_ms: retryDelay,
          max_retry_delay_ms: maxRetryDelay,
          auto_handle_bounces: bounceHandling,
          auto_unsubscribe_on_bounce: autoUnsubscribe
        });
        
      toast.success('Email system settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSystem = async () => {
    setIsTesting(true);
    try {
      // Invoke the edge function to test email system
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          templateId: 'test-template',
          recipientEmail: 'test@example.com',
          recipientName: 'Test User',
          variables: {
            customer: {
              full_name: 'Test User',
              email: 'test@example.com'
            }
          }
        }
      });

      if (error) throw error;
      
      toast.success('Email system test completed successfully');
      refetch(); // Refresh health data
    } catch (error) {
      console.error('Error testing email system:', error);
      toast.error('Email system test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const getSystemHealth = () => {
    if (!healthStatus?.metrics) return { status: 'unknown', message: 'No data available' };
    
    const failRate = healthStatus.metrics.failed_sent / (healthStatus.metrics.total_sent || 1);
    const rateLimitRate = healthStatus.metrics.rate_limited_count / (healthStatus.metrics.total_sent || 1);
    
    if (failRate > 0.2) {
      return { status: 'critical', message: 'High failure rate detected' };
    }
    
    if (rateLimitRate > 0.1) {
      return { status: 'warning', message: 'Rate limiting issues detected' };
    }
    
    if (healthStatus.pendingCount > 100) {
      return { status: 'warning', message: 'Large email backlog detected' };
    }
    
    return { status: 'healthy', message: 'System operating normally' };
  };

  const health = getSystemHealth();
  
  return (
    <div className="space-y-6">
      <Card className={`border-l-4 ${
        health.status === 'critical' ? 'border-l-destructive' : 
        health.status === 'warning' ? 'border-l-yellow-500' : 
        health.status === 'healthy' ? 'border-l-green-500' : ''
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Email System Health</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            {health.status === 'critical' && <AlertTriangle className="h-5 w-5 text-destructive" />}
            {health.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
            {health.status === 'healthy' && <CheckCircle className="h-5 w-5 text-green-500" />}
            <span className="font-medium">{health.message}</span>
          </div>
          
          {healthStatus && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Pending emails:</span>
                <div className="font-medium">{healthStatus.pendingCount}</div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Opt-outs:</span>
                <div className="font-medium">{healthStatus.optOutCount}</div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Last checked:</span>
                <div className="font-medium">
                  {new Date(healthStatus.lastChecked).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Retry Settings</CardTitle>
          <CardDescription>
            Configure how the system handles email delivery failures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max-retries">Maximum Retries</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="max-retries"
                value={[maxRetries]}
                onValueChange={(values) => setMaxRetries(values[0])}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-center">{maxRetries}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="retry-delay">Base Retry Delay (ms)</Label>
            <Input
              id="retry-delay"
              type="number"
              value={retryDelay}
              onChange={(e) => setRetryDelay(parseInt(e.target.value))}
              min={100}
              max={5000}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-retry-delay">Maximum Retry Delay (ms)</Label>
            <Input
              id="max-retry-delay"
              type="number"
              value={maxRetryDelay}
              onChange={(e) => setMaxRetryDelay(parseInt(e.target.value))}
              min={1000}
              max={600000}
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="bounce-handling"
              checked={bounceHandling}
              onCheckedChange={setBounceHandling}
            />
            <Label htmlFor="bounce-handling">Automatic bounce handling</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-unsubscribe"
              checked={autoUnsubscribe}
              onCheckedChange={setAutoUnsubscribe}
            />
            <Label htmlFor="auto-unsubscribe">Auto-unsubscribe on hard bounce</Label>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              onClick={handleTestSystem} 
              variant="outline"
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test System'
              )}
            </Button>
            
            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

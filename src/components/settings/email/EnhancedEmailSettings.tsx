
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Loader2, CheckCircle, RefreshCw, Clock, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const EnhancedEmailSettings = () => {
  const [maxRetries, setMaxRetries] = useState(5);
  const [retryDelay, setRetryDelay] = useState(200);
  const [maxRetryDelay, setMaxRetryDelay] = useState(30000);
  const [maxRetryDuration, setMaxRetryDuration] = useState(86400); // 24 hours in seconds
  const [bounceHandling, setBounceHandling] = useState(true);
  const [autoUnsubscribe, setAutoUnsubscribe] = useState(true);
  const [preferredSendTime, setPreferredSendTime] = useState("09:00");
  const [preferredSendTimeEnabled, setPreferredSendTimeEnabled] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(20); // 20% failure rate threshold
  const [alertEmail, setAlertEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  // Fetch current system settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['email-system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_system_settings')
        .select('*')
        .limit(1)
        .single();
        
      if (error) {
        console.error('Error fetching email settings:', error);
        return null;
      }
      
      return data;
    }
  });
  
  // Apply fetched settings when available
  useEffect(() => {
    if (settings) {
      setMaxRetries(settings.max_retries || 5);
      setRetryDelay(settings.retry_delay_ms || 200);
      setMaxRetryDelay(settings.max_retry_delay_ms || 30000);
      setMaxRetryDuration(settings.max_retry_duration_sec || 86400);
      setBounceHandling(settings.auto_handle_bounces || true);
      setAutoUnsubscribe(settings.auto_unsubscribe_on_bounce || true);
      setPreferredSendTime(settings.preferred_send_time || "09:00");
      setPreferredSendTimeEnabled(settings.use_preferred_send_time || false);
      setAlertThreshold(settings.alert_threshold_percent || 20);
      setAlertEmail(settings.alert_email || "");
    }
  }, [settings]);

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
        
      const { data: failedEmails } = await supabase
        .from('email_notification_logs')
        .select('status, count(*)')
        .eq('status', 'failed')
        .created_at('gte', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .group('status')
        .single();
        
      return {
        metrics: metrics?.[0] || null,
        pendingCount: queue?.count || 0,
        optOutCount: optOuts?.count || 0,
        recentFailures: failedEmails?.count || 0,
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
          id: settings?.id || '1',
          max_retries: maxRetries,
          retry_delay_ms: retryDelay,
          max_retry_delay_ms: maxRetryDelay,
          max_retry_duration_sec: maxRetryDuration,
          auto_handle_bounces: bounceHandling,
          auto_unsubscribe_on_bounce: autoUnsubscribe,
          preferred_send_time: preferredSendTime,
          use_preferred_send_time: preferredSendTimeEnabled,
          alert_threshold_percent: alertThreshold,
          alert_email: alertEmail,
          updated_at: new Date().toISOString()
        });
        
      // Update the edge function's config via its env vars
      // Note: This is a conceptual representation; actual implementation may differ
      await supabase.functions.invoke('update-email-settings', {
        body: {
          maxRetries,
          retryDelay,
          maxRetryDelay,
          maxRetryDuration,
          bounceHandling,
          autoUnsubscribe
        }
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
          recipientEmail: alertEmail || 'test@example.com',
          recipientName: 'Test User',
          variables: {
            customer: {
              full_name: 'Test User',
              email: alertEmail || 'test@example.com'
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
    
    if (failRate > (alertThreshold / 100)) {
      return { status: 'critical', message: 'High failure rate detected' };
    }
    
    if (rateLimitRate > 0.1) {
      return { status: 'warning', message: 'Rate limiting issues detected' };
    }
    
    if (healthStatus.pendingCount > 100) {
      return { status: 'warning', message: 'Large email backlog detected' };
    }
    
    if (healthStatus.recentFailures > 10) {
      return { status: 'warning', message: 'Multiple recent failures detected' };
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Pending emails:</span>
                <div className="font-medium">{healthStatus.pendingCount}</div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Opt-outs:</span>
                <div className="font-medium">{healthStatus.optOutCount}</div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Recent failures:</span>
                <div className="font-medium">{healthStatus.recentFailures}</div>
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

      <Tabs defaultValue="delivery">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
          <TabsTrigger value="timing">Timing & Scheduling</TabsTrigger>
          <TabsTrigger value="alerts">Monitoring & Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="delivery" className="space-y-4">
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
                <p className="text-xs text-muted-foreground">Initial delay before first retry attempt</p>
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
                <p className="text-xs text-muted-foreground">Maximum delay between retry attempts</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-retry-duration">Maximum Retry Duration (seconds)</Label>
                <Select 
                  value={maxRetryDuration.toString()} 
                  onValueChange={(value) => setMaxRetryDuration(parseInt(value))}
                >
                  <SelectTrigger id="max-retry-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3600">1 hour</SelectItem>
                    <SelectItem value="21600">6 hours</SelectItem>
                    <SelectItem value="43200">12 hours</SelectItem>
                    <SelectItem value="86400">24 hours</SelectItem>
                    <SelectItem value="172800">48 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Maximum time window for retry attempts</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Bounce Handling</CardTitle>
              <CardDescription>
                Configure how the system responds to email bounces
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="bounce-handling"
                  checked={bounceHandling}
                  onCheckedChange={setBounceHandling}
                />
                <Label htmlFor="bounce-handling">Automatic bounce handling</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                System will automatically track and process bounced emails
              </p>
              
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="auto-unsubscribe"
                  checked={autoUnsubscribe}
                  onCheckedChange={setAutoUnsubscribe}
                  disabled={!bounceHandling}
                />
                <Label htmlFor="auto-unsubscribe" className={!bounceHandling ? "text-muted-foreground" : ""}>
                  Auto-unsubscribe on hard bounce
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                System will automatically opt-out recipients after permanent delivery failures
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Timing</CardTitle>
              <CardDescription>
                Configure when emails should be sent to maximize engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="preferred-time-enabled"
                  checked={preferredSendTimeEnabled}
                  onCheckedChange={setPreferredSendTimeEnabled}
                />
                <Label htmlFor="preferred-time-enabled">Use preferred send time</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When enabled, the system will schedule emails to be sent at the preferred time
              </p>
              
              <div className="space-y-2 pt-2">
                <Label htmlFor="preferred-time" className={!preferredSendTimeEnabled ? "text-muted-foreground" : ""}>
                  Preferred Send Time
                </Label>
                <div className="flex items-center">
                  <Input
                    id="preferred-time"
                    type="time"
                    value={preferredSendTime}
                    onChange={(e) => setPreferredSendTime(e.target.value)}
                    disabled={!preferredSendTimeEnabled}
                    className="max-w-[200px]"
                  />
                  <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Non-urgent emails will be queued and sent at this time (local timezone)
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Timing Presets</CardTitle>
              <CardDescription>
                Configure default timing for common automation triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="payment-reminder">Payment Reminder</Label>
                  <Select defaultValue="3">
                    <SelectTrigger id="payment-reminder">
                      <SelectValue placeholder="Days before due" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day before</SelectItem>
                      <SelectItem value="2">2 days before</SelectItem>
                      <SelectItem value="3">3 days before</SelectItem>
                      <SelectItem value="5">5 days before</SelectItem>
                      <SelectItem value="7">7 days before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="insurance-renewal">Insurance Renewal</Label>
                  <Select defaultValue="14">
                    <SelectTrigger id="insurance-renewal">
                      <SelectValue placeholder="Days before expiry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days before</SelectItem>
                      <SelectItem value="14">14 days before</SelectItem>
                      <SelectItem value="21">21 days before</SelectItem>
                      <SelectItem value="30">30 days before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="welcome-delay">Welcome Email</Label>
                  <Select defaultValue="0">
                    <SelectTrigger id="welcome-delay">
                      <SelectValue placeholder="Delay after signup" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Immediate</SelectItem>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Configure alert thresholds and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alert-threshold">Failure Rate Alert Threshold (%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="alert-threshold"
                    value={[alertThreshold]}
                    onValueChange={(values) => setAlertThreshold(values[0])}
                    min={5}
                    max={50}
                    step={5}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{alertThreshold}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Send alerts when failure rate exceeds this percentage
                </p>
              </div>
              
              <div className="space-y-2 pt-2">
                <Label htmlFor="alert-email">Alert Recipient Email</Label>
                <Input
                  id="alert-email"
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Email address to receive system alerts
                </p>
              </div>
              
              <div className="flex items-center space-x-2 pt-4">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Alert types:</span>
              </div>
              
              <div className="space-y-2 pl-6">
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked id="high-failure-alert" />
                  <Label htmlFor="high-failure-alert">High failure rate</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked id="rate-limit-alert" />
                  <Label htmlFor="rate-limit-alert">Rate limiting detected</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked id="queue-backlog-alert" />
                  <Label htmlFor="queue-backlog-alert">Queue backlog</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked id="critical-template-alert" />
                  <Label htmlFor="critical-template-alert">Critical template failures</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        
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
    </div>
  );
};

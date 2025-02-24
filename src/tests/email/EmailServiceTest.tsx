
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TestCase {
  name: string;
  config: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  };
  expectedResult: 'success' | 'error';
}

export const EmailServiceTest = () => {
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const testCases: TestCase[] = [
    {
      name: "Basic Email Test",
      config: {
        to: testEmail,
        subject: "Basic Test Email",
        html: "<h1>Test Email</h1><p>This is a basic test email.</p>"
      },
      expectedResult: 'success'
    },
    {
      name: "Custom From Address",
      config: {
        to: testEmail,
        subject: "Custom From Test",
        html: "<p>Testing custom from address</p>",
        from: "custom@yourdomain.com"
      },
      expectedResult: 'success'
    },
    {
      name: "Invalid Email Test",
      config: {
        to: "invalid-email",
        subject: "Error Test",
        html: "<p>Testing error handling</p>"
      },
      expectedResult: 'error'
    },
    {
      name: "Special Characters Test",
      config: {
        to: testEmail,
        subject: "Special Characters Test 🚀",
        html: "<p>Testing special characters: áéíóú &lt;script&gt;alert('test')&lt;/script&gt;</p>"
      },
      expectedResult: 'success'
    },
    {
      name: "Empty Subject Test",
      config: {
        to: testEmail,
        subject: "",
        html: "<p>Testing empty subject</p>"
      },
      expectedResult: 'error'
    }
  ];

  const runTest = async (testCase: TestCase) => {
    try {
      setLoading(true);
      console.log(`Running test: ${testCase.name}`);
      
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: testCase.config
      });
      const endTime = performance.now();
      
      console.log(`Test "${testCase.name}" completed in ${(endTime - startTime).toFixed(2)}ms`);
      
      if (error) {
        console.error(`Test "${testCase.name}" failed:`, error);
        if (testCase.expectedResult === 'error') {
          toast.success(`Test "${testCase.name}" passed - Expected error received`);
        } else {
          toast.error(`Test "${testCase.name}" failed - Unexpected error`);
        }
        return;
      }
      
      if (testCase.expectedResult === 'success') {
        toast.success(`Test "${testCase.name}" passed`);
        console.log(`Test "${testCase.name}" result:`, data);
      } else {
        toast.error(`Test "${testCase.name}" failed - Expected error but got success`);
      }
      
    } catch (error) {
      console.error(`Test "${testCase.name}" error:`, error);
      toast.error(`Test "${testCase.name}" failed with exception`);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }
    
    setLoading(true);
    console.log("Starting all tests...");
    
    for (const testCase of testCases) {
      await runTest(testCase);
    }
    
    setLoading(false);
    console.log("All tests completed");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Email Service Test Suite</CardTitle>
        <CardDescription>
          Test the email service functionality with various test cases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="testEmail">Test Email Address</Label>
          <Input
            id="testEmail"
            type="email"
            placeholder="Enter test email address"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={runAllTests}
            disabled={loading || !testEmail}
            className="w-full"
          >
            {loading ? "Running Tests..." : "Run All Tests"}
          </Button>
          
          <div className="space-y-2 mt-4">
            {testCases.map((testCase) => (
              <Button
                key={testCase.name}
                onClick={() => runTest(testCase)}
                disabled={loading || !testEmail}
                variant="outline"
                className="w-full"
              >
                Run Test: {testCase.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

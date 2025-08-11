'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, InfoIcon } from 'lucide-react'
import ConnectionDiagnostic from '@/components/connection-diagnostic'
import logger from '@/lib/logger'

interface TestResult {
  success?: boolean;
  status?: number;
  data?: any;
  error?: string;
  message?: string;
  apiUrl?: string;
}

export default function ConnectionTest() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [directTestResult, setDirectTestResult] = useState<TestResult | null>(null);
  const [directLoading, setDirectLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setResult(data);
      logger.info('Connection test result', data);
    } catch (error) {
      logger.error('Error testing connection', error);
      setResult({ 
        success: false, 
        error: 'Request failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirectConnection = async () => {
    setDirectLoading(true);
    setDirectTestResult(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!apiUrl) {
        throw new Error('API URL is not configured (NEXT_PUBLIC_API_URL is not set)');
      }
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ username: 'test', password: 'test' }),
      });
      
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = await response.text();
      }
      
      setDirectTestResult({
        success: response.ok,
        status: response.status,
        data: responseData,
        apiUrl,
      });
      
      logger.info('Direct connection test result', {
        status: response.status,
        ok: response.ok,
        data: responseData
      });
    } catch (error) {
      logger.error('Error testing direct connection', error);
      setDirectTestResult({ 
        success: false, 
        error: 'Direct request failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setDirectLoading(false);
    }
  };

  useEffect(() => {
    // Test connection on component mount
    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Backend API Connection Test</CardTitle>
            <CardDescription>
              Tests connection to the backend API through a Next.js API route
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button onClick={testConnection} disabled={loading}>
                {loading ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
            
            {result && (
              <div className="mt-4 p-4 rounded border">
                <h3 className="font-semibold mb-2">
                  Result: {result.success ? '✅ Success' : '❌ Failed'}
                </h3>
                <div className="text-sm">
                  <p><strong>API URL:</strong> {result.apiUrl || 'Not available'}</p>
                  {result.status && <p><strong>Status:</strong> {result.status}</p>}
                  {result.error && <p><strong>Error:</strong> {result.error}</p>}
                  {result.message && <p><strong>Message:</strong> {result.message}</p>}
                  
                  {result.data && (
                    <div className="mt-2">
                      <p className="font-semibold">Response data:</p>
                      <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Direct Browser Request Test</CardTitle>
            <CardDescription>
              Tests browser's ability to directly connect to the API (CORS test)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button onClick={testDirectConnection} disabled={directLoading}>
                {directLoading ? 'Testing...' : 'Test Direct Connection'}
              </Button>
            </div>
            
            {directTestResult && (
              <div className="mt-4 p-4 rounded border">
                <h3 className="font-semibold mb-2">
                  Result: {directTestResult.success ? '✅ Success' : '❌ Failed'}
                </h3>
                <div className="text-sm">
                  <p><strong>API URL:</strong> {directTestResult.apiUrl || 'Not available'}</p>
                  {directTestResult.status && <p><strong>Status:</strong> {directTestResult.status}</p>}
                  {directTestResult.error && <p><strong>Error:</strong> {directTestResult.error}</p>}
                  {directTestResult.message && <p><strong>Message:</strong> {directTestResult.message}</p>}
                  
                  {directTestResult.data && (
                    <div className="mt-2">
                      <p className="font-semibold">Response data:</p>
                      <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto max-h-40">
                        {typeof directTestResult.data === 'string' 
                          ? directTestResult.data 
                          : JSON.stringify(directTestResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <ConnectionDiagnostic />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
          <CardDescription>
            Information about the current environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
            <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'Not set'}</p>
            <p><strong>Window Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</p>
          </div>
        </CardContent>
      </Card>
      
      <Alert className="mt-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Unable to connect to the backend?</AlertTitle>
        <AlertDescription>
          <div className="space-y-2">
            <p>If you're seeing "Network error: Unable to connect to server", here are some steps to fix it:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Check if your backend is running at: <code className="bg-gray-100 px-1 rounded">{process.env.NEXT_PUBLIC_API_URL}</code></li>
              <li>Verify the URL in the Render.com environment variables for your service</li>
              <li>Make sure the backend has CORS configured to accept requests from: <code className="bg-gray-100 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : 'this origin'}</code></li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

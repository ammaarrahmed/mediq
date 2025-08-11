'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Check, Clock } from 'lucide-react'
import logger from '@/lib/logger'

export default function ConnectionDiagnostic() {
  const [apiUrl, setApiUrl] = useState('')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorDetail, setErrorDetail] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const checkBackendConnection = async () => {
      setStatus('loading')
      
      try {
        const url = process.env.NEXT_PUBLIC_API_URL
        setApiUrl(url || 'Not configured')
        
        if (!url) {
          setStatus('error')
          setErrorDetail('API_URL environment variable is not set')
          return
        }
        
        logger.info(`Testing connection to backend: ${url}`)
        
        try {
          const response = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            // Sending invalid credentials just to test if the endpoint exists
            // Using longer password to meet minimum length requirement
            body: JSON.stringify({ username: '_connection_test_', password: 'test_password_123' }),
          })
          
          // Even a 401 error means the endpoint exists
          if (response.status === 401 || response.status === 400 || response.ok) {
            setStatus('success')
            logger.info('Backend connection successful')
          } else {
            setStatus('error')
            setErrorDetail(`Unexpected status code: ${response.status}`)
            logger.error(`Backend connection error: ${response.status}`)
          }
        } catch (error) {
          setStatus('error')
          setErrorDetail(error instanceof Error ? error.message : 'Unknown error')
          logger.error('Backend connection error:', error)
        }
      } catch (error) {
        setStatus('error')
        setErrorDetail(error instanceof Error ? error.message : 'Unknown error')
        logger.error('Backend connection check failed:', error)
      }
    }
    
    checkBackendConnection()
  }, [retryCount])
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Backend Connection Status</CardTitle>
        <CardDescription>
          Checking connection to the backend API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p>API URL:</p>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">{apiUrl || 'Not configured'}</code>
          </div>
          
          <div className="flex items-center justify-between">
            <p>Connection Status:</p>
            <div className="flex items-center gap-2">
              {status === 'loading' && (
                <Clock className="h-5 w-5 text-orange-500 animate-pulse" />
              )}
              {status === 'success' && (
                <Check className="h-5 w-5 text-green-500" />
              )}
              {status === 'error' && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <span className={
                status === 'loading' ? 'text-orange-500' :
                status === 'success' ? 'text-green-500' :
                'text-red-500'
              }>
                {status === 'loading' ? 'Checking...' :
                 status === 'success' ? 'Connected' :
                 'Connection Failed'}
              </span>
            </div>
          </div>
          
          {status === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                {errorDetail}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleRetry}
            disabled={status === 'loading'}
            variant="outline"
            className="w-full mt-4"
          >
            Retry Connection Check
          </Button>
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium">Troubleshooting Tips:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Verify that the backend server is running</li>
              <li>Check that the API URL is correct in environment variables</li>
              <li>Ensure there are no network restrictions blocking access</li>
              <li>Verify that CORS is properly configured on the backend</li>
              <li>Try accessing the backend URL directly in a browser tab</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

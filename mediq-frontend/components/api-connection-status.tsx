'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, Link as LinkIcon, Loader2 } from 'lucide-react'
import Link from "next/link"
import { checkApiHealth, isApiReachable } from "@/lib/api-utils"

export default function ApiConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [isMounted, setIsMounted] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
  // Handle SSR
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return;
    
    const checkConnection = async () => {
      if (!apiUrl) {
        setConnectionStatus('error')
        return
      }

      try {
        // First try health endpoints
        const isHealthy = await checkApiHealth(apiUrl);
        
        if (isHealthy) {
          setConnectionStatus('connected');
          return;
        }
        
        // If no health endpoint found, check if API is at least reachable
        const isReachable = await isApiReachable(apiUrl);
        
        if (isReachable) {
          // If we can reach the API but no health endpoint, consider it connected
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
        }
      } catch (error) {
        console.error('API connection check failed:', error);
        setConnectionStatus('error');
      }
    }

    checkConnection()
    
    // Set up periodic checks
    const intervalId = setInterval(checkConnection, 30000) // Check every 30 seconds
    
    return () => clearInterval(intervalId)
  }, [apiUrl, isMounted])

  // Don't render anything on server-side
  if (!isMounted) return null;
  
  if (connectionStatus === 'loading') {
    return (
      <Alert className="mx-auto max-w-3xl mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div>
            <AlertTitle className="text-left">Checking Backend Connection</AlertTitle>
            <AlertDescription className="text-left">
              Verifying connection to the MedIQ backend services...
            </AlertDescription>
          </div>
        </div>
      </Alert>
    )
  }

  if (connectionStatus === 'connected') {
    return (
      <Alert className="mx-auto max-w-3xl mb-4 flex items-center justify-between bg-green-50 border-green-200">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <AlertTitle className="text-left text-green-800">Backend Connected</AlertTitle>
            <AlertDescription className="text-left text-green-600">
              Successfully connected to the MedIQ backend services.
            </AlertDescription>
          </div>
        </div>
        <Link href="/connection-test">
          <Button variant="outline" size="sm" className="whitespace-nowrap border-green-200 text-green-700 hover:text-green-800 hover:bg-green-50 hover:border-green-300">
            <LinkIcon className="mr-2 h-4 w-4" />
            Check Details
          </Button>
        </Link>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive" className="mx-auto max-w-3xl mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <div>
          <AlertTitle className="text-left">Backend Connection Error</AlertTitle>
          <AlertDescription className="text-left">
            There may be issues connecting to the backend. Click the link to diagnose.
          </AlertDescription>
        </div>
      </div>
      <Link href="/connection-test">
        <Button variant="outline" size="sm" className="whitespace-nowrap">
          <LinkIcon className="mr-2 h-4 w-4" />
          Check Connection
        </Button>
      </Link>
    </Alert>
  )
}

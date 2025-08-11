'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import logger from '@/lib/logger'

export default function ApiConnectionAlert() {
  const [connectionError, setConnectionError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiUrl, setApiUrl] = useState('')

  useEffect(() => {
    async function checkConnection() {
      try {
        // Get the API URL from environment
        const url = process.env.NEXT_PUBLIC_API_URL
        setApiUrl(url || 'Not configured')
        
        if (!url) {
          setConnectionError(true)
          logger.error('API URL not configured')
          return
        }
        
        // Try a simple request to the API
        logger.info(`Checking connection to ${url}`)
        
        // Add a /health endpoint or use a known endpoint
        const testUrl = `${url}/health`
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
          cache: 'no-store',
        }).catch(err => {
          logger.error('Fetch error:', err)
          throw err
        })
        
        if (!response.ok) {
          logger.error(`API returned status ${response.status}`)
          setConnectionError(true)
        } else {
          setConnectionError(false)
        }
      } catch (error) {
        logger.error('API connection check failed:', error)
        setConnectionError(true)
      } finally {
        setLoading(false)
      }
    }
    
    checkConnection()
  }, [])

  if (loading || !connectionError) return null

  return (
    <Alert variant="destructive" className="mx-auto max-w-3xl mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Backend Connection Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          Unable to connect to the backend API ({apiUrl}). Some features may not work correctly.
        </p>
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          <Link href="/connection-test" className="underline">
            View Connection Diagnostics
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  )
}

'use client'

import { useState, useEffect } from 'react'
import logger from '@/lib/logger'
import { checkApiHealth, isApiReachable } from "@/lib/api-utils"

export default function ApiStatusIndicator() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [isMounted, setIsMounted] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // Handle SSR
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return;
    
    const checkApi = async () => {
      try {
        if (!apiUrl) {
          setStatus('error')
          return
        }
        
        // First try health endpoints
        const isHealthy = await checkApiHealth(apiUrl)
        
        if (isHealthy) {
          setStatus('connected')
          return
        }
        
        // If no health endpoint found, check if API is at least reachable
        const isReachable = await isApiReachable(apiUrl)
        
        if (isReachable) {
          // If we can reach the API but no health endpoint, consider it connected
          setStatus('connected')
        } else {
          setStatus('error')
        }
      } catch (error) {
        logger.error('API status check failed:', error)
        setStatus('error')
      }
    }
    
    checkApi()
    
    // Periodically check API status
    const interval = setInterval(checkApi, 60000) // Every minute
    
    return () => clearInterval(interval)
  }, [apiUrl, isMounted])

  // Only render on client-side
  if (!isMounted) return null;
  
  return (
    <div className="text-xs flex items-center">
      <span className="mr-1.5">API:</span>
      <span 
        className={`inline-block w-2 h-2 rounded-full ${
          status === 'checking' ? 'bg-yellow-400 animate-pulse' : 
          status === 'connected' ? 'bg-green-500' : 
          'bg-red-500'
        }`} 
      />
      <span className="ml-1 opacity-75">
        {status === 'checking' ? 'Checking...' : 
         status === 'connected' ? 'Connected' : 
         'Disconnected'}
      </span>
    </div>
  )
}

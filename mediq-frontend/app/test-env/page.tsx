'use client'

import { useEffect } from 'react'
import logger from '@/lib/logger'

export default function TestEnv() {
  useEffect(() => {
    // Log environment variables to help with debugging
    logger.info("Environment variables check", {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "Not set",
      NODE_ENV: process.env.NODE_ENV || "Not set"
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Environment Test</h1>
      <div className="bg-gray-100 p-4 rounded-md">
        <h2 className="font-semibold mb-2">Public Environment Variables:</h2>
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "Not set"}</p>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || "Not set"}</p>
        <p className="mt-4 text-sm text-gray-500">Check the browser console for more detailed logs.</p>
      </div>
    </div>
  )
}

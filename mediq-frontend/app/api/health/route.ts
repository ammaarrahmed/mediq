// app/api/health/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for the frontend
 * Also checks if the backend API is reachable
 */
export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  let backendStatus = "unknown";
  let backendMessage = "";

  if (apiUrl) {
    try {
      // Try to fetch the backend health endpoint
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      
      backendStatus = response.ok ? "healthy" : "unhealthy";
      backendMessage = response.ok ? "Backend API is reachable" : `Backend returned ${response.status}`;
    } catch (error) {
      backendStatus = "unreachable";
      backendMessage = error instanceof Error ? error.message : "Unknown error";
    }
  } else {
    backendStatus = "not_configured";
    backendMessage = "API_URL environment variable is not set";
  }

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    backend: {
      url: apiUrl,
      status: backendStatus,
      message: backendMessage,
    },
  });
}

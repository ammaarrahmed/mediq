// app/api/test-connection/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Test connection to the backend API
 */
export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      return NextResponse.json(
        { error: 'API URL not configured', message: 'NEXT_PUBLIC_API_URL environment variable is not set' },
        { status: 500 }
      );
    }
    
    // Try to connect to the API
    const testUrl = `${apiUrl}/health`;
    console.log(`Testing connection to: ${testUrl}`);
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      
      const status = response.status;
      let data;
      
      try {
        data = await response.json();
      } catch (e) {
        data = { text: await response.text() };
      }
      
      return NextResponse.json({
        success: response.ok,
        status,
        data,
        apiUrl,
      });
      
    } catch (fetchError: any) {
      return NextResponse.json(
        { 
          error: 'Failed to connect to API',
          message: fetchError.message,
          apiUrl
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}

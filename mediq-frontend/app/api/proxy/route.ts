// app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * This is a simple CORS proxy to help with development when the backend doesn't have proper CORS headers.
 * It forwards requests to the backend API and adds CORS headers to the response.
 */
export async function POST(request: NextRequest) {
  try {
    // Extract the target URL and request details from the incoming request
    const requestData = await request.json();
    const { url, method = 'POST', body, headers = {} } = requestData;

    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL parameter' },
        { status: 400 }
      );
    }

    // Log the proxy request
    console.log(`Proxying request to: ${url}`);
    
    // Forward the request to the target URL
    const apiResponse = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Get the response data
    let responseData;
    const contentType = apiResponse.headers.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      responseData = await apiResponse.json();
    } else {
      responseData = await apiResponse.text();
    }

    // Return the response with CORS headers
    return NextResponse.json(responseData, {
      status: apiResponse.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

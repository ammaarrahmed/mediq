/**
 * API utilities for handling CORS and other common issues
 */

/**
 * Creates a fetch request that can work around CORS issues by using a proxy
 * if direct requests fail due to CORS errors
 */
export async function fetchWithCORSHandling(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // First try a direct request
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Accept': 'application/json',
      },
    });
    
    return response;
  } catch (error) {
    console.warn('Direct API request failed, trying through proxy:', error);
    
    // If direct request fails, try using our proxy
    const proxyUrl = '/api/proxy';
    
    // Extract headers and body for the proxy request
    const { headers = {}, body, method = 'GET' } = options;
    
    // Prepare the proxy payload
    const proxyPayload = {
      url,
      method,
      headers,
      body: body ? JSON.parse(body.toString()) : undefined,
    };
    
    // Make the request through our proxy
    const proxyResponse = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proxyPayload),
    });
    
    return proxyResponse;
  }
}

/**
 * Helper function to check if an error is due to CORS
 */
export function isCORSError(error: any): boolean {
  return (
    error.message?.includes('CORS') ||
    error.message?.includes('cross-origin') ||
    error.name === 'TypeError'
  );
}

/**
 * Attempts to find a suitable health endpoint on the API
 * Tries common health endpoint paths in order
 */
export async function checkApiHealth(baseUrl: string): Promise<boolean> {
  if (!baseUrl) return false;
  
  // Ensure the URL doesn't end with a slash
  const apiUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Common health endpoint paths to try
  const healthEndpoints = [
    '/health',
    '/api/health',
    '/healthcheck',
    '/status',
    '/api/status',
    '/' // Last resort - try the root path
  ];
  
  for (const endpoint of healthEndpoints) {
    try {
      // Try each endpoint with a short timeout
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      
      if (response.ok) {
        console.log(`API health check succeeded on ${endpoint}`);
        return true;
      }
    } catch (error) {
      console.log(`API health check failed on ${endpoint}:`, error);
      // Continue to the next endpoint
    }
  }
  
  return false; // All health check attempts failed
}

/**
 * Checks if the API is reachable by attempting a minimal OPTIONS request
 * This can work even if there's no specific health endpoint
 */
export async function isApiReachable(baseUrl: string): Promise<boolean> {
  if (!baseUrl) return false;
  
  try {
    // Try an OPTIONS request to check if the API is reachable
    const response = await fetch(baseUrl, {
      method: 'OPTIONS',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    
    // Any response means the server is reachable
    return true;
  } catch (error) {
    console.log('API reachability check failed:', error);
    return false;
  }
}

/**
 * Utility functions for handling common error cases when dealing with the API
 */

import { useToast } from "@/hooks/use-toast";

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

/**
 * API Error class with additional details
 */
export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Retry a function with exponential backoff
 */
export const withRetry = async <T>(
  fn: () => Promise<T>, 
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    // Wait for the specified delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry with exponential backoff
    return withRetry(fn, retries - 1, delay * 2);
  }
};

/**
 * Wrap an API call with error handling
 */
export const handleApiCall = async <T>(
  apiCall: () => Promise<T>,
  errorMessage = "An error occurred",
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await withRetry(apiCall, retries);
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    
    // Format the error nicely
    if (error instanceof ApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new ApiError(error.message);
    } else {
      throw new ApiError(errorMessage);
    }
  }
};

/**
 * Parse API response with error handling
 */
export const parseApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    let errorData;
    
    try {
      errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // If we can't parse JSON, use the status text
    }
    
    throw new ApiError(errorMessage, response.status, errorData);
  }
  
  try {
    return await response.json();
  } catch (error) {
    // If the response is not JSON, return null
    return null;
  }
};

/**
 * Hook for handling API errors with toast notifications
 */
export const useApiErrorHandler = () => {
  const { toast } = useToast();
  
  return (error: unknown, title = "Error") => {
    console.error(error);
    
    let description = "An unexpected error occurred. Please try again.";
    
    if (error instanceof ApiError) {
      description = error.message;
    } else if (error instanceof Error) {
      description = error.message;
    }
    
    toast({
      title,
      description,
      variant: "destructive",
    });
  };
};

/**
 * Generate a unique client-side ID for optimistic updates
 */
export const generateClientId = () => {
  return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a fallback function that tries multiple endpoints
 */
export const withEndpointFallback = async <T>(
  endpoints: string[],
  fetchFn: (endpoint: string) => Promise<T>
): Promise<T> => {
  let lastError;
  
  for (const endpoint of endpoints) {
    try {
      return await fetchFn(endpoint);
    } catch (error) {
      lastError = error;
      console.warn(`Failed to fetch from ${endpoint}:`, error);
      // Continue to the next endpoint
    }
  }
  
  throw lastError || new Error('All endpoints failed');
};

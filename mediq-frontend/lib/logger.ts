/**
 * A simple logger utility for the MedIQ frontend application
 * Helps with debugging in both development and production environments
 */

const DEBUG_MODE = process.env.NODE_ENV !== 'production';

/**
 * Log information to the console in a structured format
 */
export const logInfo = (message: string, data?: any): void => {
  const logObj = {
    level: 'INFO',
    timestamp: new Date().toISOString(),
    message,
    ...(data && { data }),
    environment: process.env.NODE_ENV,
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'Not Set'
  };
  
  console.log(`[INFO] ${message}`, data ? data : '');
  
  // This line would be useful if we had a backend logging service
  // sendToLoggingService(logObj);
};

/**
 * Log errors to the console in a structured format
 */
export const logError = (message: string, error?: any): void => {
  const errorObj = {
    level: 'ERROR',
    timestamp: new Date().toISOString(),
    message,
    error: error instanceof Error ? 
      { 
        name: error.name, 
        message: error.message, 
        stack: error.stack 
      } : error,
    environment: process.env.NODE_ENV,
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'Not Set'
  };
  
  console.error(`[ERROR] ${message}`, error ? error : '');
  
  // This line would be useful if we had a backend logging service
  // sendToLoggingService(errorObj);
};

/**
 * Log warnings to the console in a structured format
 */
export const logWarn = (message: string, data?: any): void => {
  const warnObj = {
    level: 'WARN',
    timestamp: new Date().toISOString(),
    message,
    ...(data && { data }),
    environment: process.env.NODE_ENV,
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'Not Set'
  };
  
  console.warn(`[WARN] ${message}`, data ? data : '');
  
  // This line would be useful if we had a backend logging service
  // sendToLoggingService(warnObj);
};

/**
 * Debug logs that only appear in development mode
 */
export const logDebug = (message: string, data?: any): void => {
  if (!DEBUG_MODE) return;
  
  console.debug(`[DEBUG] ${message}`, data ? data : '');
};

export default {
  info: logInfo,
  error: logError,
  warn: logWarn,
  debug: logDebug
};

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

// API base URL - can be overridden by environment variables
const API_BASE_URL = 
  (isBrowser && process.env.NEXT_PUBLIC_API_BASE_URL) || 
  'http://localhost:8000';

// Get auth headers including token if available
function getAuthHeaders(skipContentType = false) {
  const headers: Record<string, string> = {};
  
  if (!skipContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Add auth token if available
  if (isBrowser) {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}
import { handleApiCall, parseApiResponse } from './api-errors';

// Types
export interface DocumentMetadata {
  id: string;
  name: string;
  file_path?: string;
  file_type?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Document extends DocumentMetadata {
  text: string;
}

// Fetch user's documents (metadata only)
export async function fetchDocuments(): Promise<DocumentMetadata[]> {
  return await handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await parseApiResponse(response);
    return data.documents || [];
  });
}

// Fetch a specific document with its content
export async function fetchDocument(documentId: string): Promise<Document> {
  return await handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await parseApiResponse(response);
    return data.document;
  });
}

// Upload a new document
export async function uploadDocument(file: File, name?: string): Promise<DocumentMetadata> {
  return await handleApiCall(async () => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (name) {
      formData.append('name', name);
    }

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: getAuthHeaders(true), // Skip content-type for form data
      body: formData,
    });

    const data = await parseApiResponse(response);
    return data.document;
  });
}

// Delete a document
export async function deleteDocument(documentId: string): Promise<void> {
  return await handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    await parseApiResponse(response);
  });
}

import { getAuthHeaders } from "@/lib/auth";
import { handleApiCall, parseApiResponse, withEndpointFallback } from "./api-errors";

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

// API base URL - can be overridden by environment variables
const API_BASE_URL = 
  (isBrowser && process.env.NEXT_PUBLIC_API_BASE_URL) || 
  'http://localhost:8000';

// ----- API SCHEMAS -----

// Base chat request for sending messages
export interface ChatRequest {
  session_id?: string;          // Optional: UUID of existing session
  document_text?: string;       // Optional: Text content of a medical document
  user_message: string;         // Required: User's message/question
  document_id?: string;         // Optional: ID of a previously uploaded document
  include_document_context?: boolean; // Optional: Include document context in prompt
}

// Response from chat endpoint
export interface ChatResponse {
  session_id: string;           // UUID of the chat session
  response: string;             // AI assistant's response text
  user_message_id: string;      // UUID of the stored user message
  assistant_message_id: string; // UUID of the stored assistant message
  is_new_session: boolean;      // Whether this message created a new session
}

// Chat session model
export interface ChatSession {
  id: string;                   // UUID of the session
  user_id: string;              // Username of the session owner
  title?: string;               // Optional: Title of the conversation
  started_at: string;           // ISO timestamp when session started
  ended_at?: string;            // Optional: ISO timestamp when session ended
  document_id?: string;         // Optional: Associated document ID
  last_message?: string;        // Optional: Preview of the last message
}

// Chat message model
export interface ChatMessage {
  id: string;                   // UUID of the message
  session_id: string;           // UUID of the parent session
  role: "user" | "assistant";   // Message sender role
  content: string;              // Message content
  created_at: string;           // ISO timestamp when message was created
}

// Request to create a new chat session
export interface CreateSessionRequest {
  title?: string;               // Optional: Title for the session
  document_id?: string;         // Optional: Associated document ID
}

// Response after creating a session
export interface CreateSessionResponse {
  session_id: string;           // UUID of the new session
  session: ChatSession;         // Session details
}

// Request to update a chat session
export interface UpdateSessionRequest {
  title?: string;               // Optional: New title for the session
  ended_at?: boolean;           // Optional: Set to true to mark session as ended
}

// Base response for update/delete operations
export interface BaseResponse {
  success: boolean;             // Whether operation succeeded
  message: string;              // Description of result
}

/**
 * Chat with AI about a medical document
 * 
 * This function directly matches the backend implementation:
 * POST /chat/chat
 */
export async function chatWithAI(request: ChatRequest): Promise<ChatResponse> {
  return handleApiCall(async () => {
    if (!API_BASE_URL) {
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_BASE_URL}/chat/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request)
    });

    return parseApiResponse(response);
  }, "Chat with AI failed");
}

/**
 * Gets authentication headers for API requests
 */
const getHeaders = () => {
  const token = localStorage.getItem('mediq_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Fetch all chat sessions for the current user
 * 
 * GET /chat/sessions
 */
export async function fetchChatSessions(): Promise<ChatSession[]> {
  return handleApiCall(async () => {
    if (!API_BASE_URL) {
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return parseApiResponse(response);
  }, "Failed to fetch chat sessions");
}

/**
 * Fetch messages for a specific chat session
 * 
 * GET /chat/sessions/{session_id}/history
 */
export async function fetchChatMessages(sessionId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
  return handleApiCall(async () => {
    if (!API_BASE_URL) {
      throw new Error("API URL is not configured");
    }

    const url = `${API_BASE_URL}/chat/sessions/${sessionId}/history?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    return parseApiResponse(response);
  }, "Failed to fetch chat messages");
}

/**
 * Create a new chat session
 * 
 * POST /chat/sessions
 */
export async function createChatSession(
  title: string = "New conversation", 
  documentId?: string
): Promise<CreateSessionResponse> {
  return handleApiCall(async () => {
    if (!API_BASE_URL) {
      throw new Error("API URL is not configured");
    }

    const request: CreateSessionRequest = {
      title,
      document_id: documentId
    };

    const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });

    return parseApiResponse(response);
  }, "Failed to create chat session");
}

/**
 * Send a message in a chat session using the unified chat endpoint
 * 
 * POST /chat/chat
 * 
 * This replaces the previous direct message sending approach and uses
 * the new unified chat API endpoint
 */
export async function sendChatMessage(
  content: string, 
  sessionId?: string, 
  documentText?: string, 
  documentId?: string,
  includeDocumentContext: boolean = true
): Promise<ChatResponse> {
  return handleApiCall(async () => {
    if (!API_BASE_URL) {
      throw new Error("API URL is not configured");
    }

    const request: ChatRequest = {
      user_message: content,
      session_id: sessionId,
      document_text: documentText,
      document_id: documentId,
      include_document_context: includeDocumentContext
    };

    // Use the unified chat endpoint
    const response = await fetch(`${API_BASE_URL}/chat/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });

    const data = await parseApiResponse(response) as ChatResponse;
    
    return data;
  }, "Failed to send message");
}

/**
 * Delete a chat session
 * 
 * DELETE /chat/sessions/{session_id}
 */
export async function deleteChatSession(sessionId: string): Promise<BaseResponse> {
  return handleApiCall(async () => {
    if (!API_BASE_URL) {
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    return parseApiResponse(response);
  }, "Failed to delete chat session");
}

/**
 * Update a chat session (title or end the session)
 * 
 * PUT /chat/sessions/{session_id}
 */
export async function updateChatSession(
  sessionId: string, 
  updateData: UpdateSessionRequest
): Promise<BaseResponse> {
  return handleApiCall(async () => {
    if (!API_BASE_URL) {
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData)
    });

    return parseApiResponse(response);
  }, "Failed to update chat session");
}

/**
 * Get details for a specific chat session
 * 
 * GET /chat/sessions/{session_id}
 */
export async function getChatSession(sessionId: string): Promise<ChatSession> {
  return handleApiCall(async () => {
    if (!API_BASE_URL) {
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return parseApiResponse(response);
  }, "Failed to get chat session details");
}

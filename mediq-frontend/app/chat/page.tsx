'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, Heart, ArrowLeft, Bot, User, FileText, Plus, Loader2, Trash2, Edit } from 'lucide-react'
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { 
  fetchChatSessions as apiFetchChatSessions, 
  fetchChatMessages as apiFetchChatMessages, 
  createChatSession as apiCreateChatSession, 
  sendChatMessage as apiSendChatMessage, 
  deleteChatSession as apiDeleteChatSession,
  getChatSession,
  updateChatSession,
  chatWithAI
} from "@/lib/chat"
import { DocumentSelector, Document as DocumentType } from '@/components/document-selector'
import { useApiErrorHandler } from "@/lib/api-errors"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"

// Use the imported interfaces from lib/chat.ts
import {
  ChatMessage as BackendChatMessage,
  ChatSession as BackendChatSession,
  ChatResponse
} from '@/lib/chat';

// UI-specific message format that extends the backend format
interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: string
  references?: Array<string | {name: string, id?: string}>
  session_id?: string
  document_text?: string // Added for document context
}

// UI-specific session format that extends the backend format
interface ChatSession {
  id: string
  title: string
  created_at: string  // Maps to started_at from backend
  message_count: number
  user_id?: string
  document_id?: string
  last_message?: string
}

// Helper function to convert backend message to frontend format
const convertBackendMessage = (msg: BackendChatMessage): Message => ({
  id: msg.id,
  content: msg.content,
  sender: msg.role === 'user' ? 'user' : 'assistant',
  timestamp: msg.created_at,
  session_id: msg.session_id
});

// Helper function to convert backend session to frontend format
const convertBackendSession = (session: BackendChatSession): ChatSession => ({
  id: session.id,
  title: session.title || 'Untitled Chat',
  created_at: session.started_at,
  message_count: 0, // Will need to be updated separately
  user_id: session.user_id,
  document_id: session.document_id,
  last_message: session.last_message
});

// Use the imported DocumentType instead of redefining

export default function ChatPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const handleApiError = useApiErrorHandler()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Document-related state
  const [documents, setDocuments] = useState<DocumentType[]>([]) // Mock or loaded documents
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null)
  const [showDocumentSelector, setShowDocumentSelector] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    fetchChatSessions()
  }, [user, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchChatSessions = async () => {
    try {
      const chatSessions = await apiFetchChatSessions();
      // Convert backend sessions to frontend format
      const formattedSessions: ChatSession[] = (Array.isArray(chatSessions) ? chatSessions : [])
        .map(convertBackendSession);
      
      setSessions(formattedSessions);
      
      if (formattedSessions.length > 0) {
        setCurrentSession(formattedSessions[0].id);
        loadChatMessages(formattedSessions[0].id);
      }
    } catch (error) {
      handleApiError(error, "Failed to load chat sessions");
      
      // Create a fallback mode with mock data if real API fails
      const mockSessions = [
        {
          id: 'mock-1',
          title: 'Demo conversation',
          created_at: new Date().toISOString(),
          message_count: 2
        }
      ];
      
      setSessions(mockSessions);
      setCurrentSession(mockSessions[0].id);
      
      // Use mock messages for this session
      setMessages([
        {
          id: 'mock-msg-1',
          content: 'Welcome to MedIQ chat! This is a demo conversation since we couldn\'t connect to the backend API.',
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          session_id: 'mock-1'
        }
      ]);
    } finally {
      setLoadingSessions(false);
    }
  }

  const loadChatMessages = async (sessionId: string) => {
    // Skip API calls for mock sessions
    if (sessionId.startsWith('mock-')) {
      return;
    }
    
    try {
      const chatMessages = await apiFetchChatMessages(sessionId);
      
      // Convert backend message format to UI message format
      const formattedMessages: Message[] = chatMessages.map(convertBackendMessage);
      
      setMessages(formattedMessages);
      
      // Scroll to bottom after messages load
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      handleApiError(error, "Failed to load messages");
      
      // If session doesn't start with 'mock-', it's a real session that failed to load
      // Provide demo messages as fallback
      if (!sessionId.startsWith('mock-')) {
        setMessages([
          {
            id: `${sessionId}-fallback-1`,
            content: 'It seems we couldn\'t load the messages for this conversation. You can try sending a new message.',
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            session_id: sessionId
          }
        ]);
      }
    }
  }

  const createNewSession = async () => {
    try {
      setLoadingSessions(true);
      const response = await apiCreateChatSession("New conversation");
      
      // Format the session to match our UI format
      const newSession: ChatSession = {
        ...convertBackendSession(response.session),
        message_count: 0 // Ensure message count starts at 0 for new session
      };
      
      // Add the new session to the list and set it as current
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession.id);
      setMessages([]);
      
      toast({
        title: "New chat session created",
        description: "You can now start a new conversation.",
      });
    } catch (error) {
      handleApiError(error, "Failed to create session");
      
      // Create a mock session as fallback
      const mockSession = {
        id: `mock-${Date.now()}`,
        title: "New conversation",
        created_at: new Date().toISOString(),
        message_count: 0
      };
      
      // Add the mock session to the list and set it as current
      setSessions(prev => [mockSession, ...prev]);
      setCurrentSession(mockSession.id);
      setMessages([
        {
          id: `mock-welcome-${Date.now()}`,
          content: "Welcome to your new conversation! This is running in demo mode since we couldn't connect to the backend API.",
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          session_id: mockSession.id
        }
      ]);
      
      toast({
        title: "Demo conversation created",
        description: "You can try the chat functionality in demo mode.",
        variant: "default",
      });
    } finally {
      setLoadingSessions(false);
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading || !currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      session_id: currentSession,
      document_text: selectedDocument?.text // Include document text if available
    };

    // Optimistically update UI
    setMessages(prev => [...prev, userMessage]);
    const messageSent = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // For mock sessions, create a simulated AI response
    if (currentSession.startsWith('mock-')) {
      setTimeout(() => {
        const mockResponses = [
          "I understand you're trying to test the chat functionality. This is running in demo mode since we couldn't connect to the backend API.",
          "This is a simulated response in demo mode. In a real deployment, your message would be processed by our AI assistant.",
          "Thanks for your message. Since we're in demo mode, I'm providing this scripted response. The actual MedIQ assistant would analyze your health questions in detail."
        ];
        
        const aiResponse: Message = {
          id: `mock-response-${Date.now()}`,
          content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          session_id: currentSession
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
      }, 1500);
      
      return;
    }

    try {
      // Use the unified chat endpoint for all message types
      const response = await apiSendChatMessage(
        messageSent,                // User message content
        currentSession || undefined, // Session ID (undefined if null)
        selectedDocument?.text,      // Document text if available
        selectedDocument?.id         // Document ID if available
      );
        
      // Format the response for UI
      if (response && response.response) {
        // Update the user message with the new ID if provided
        if (response.user_message_id) {
          setMessages(prev => 
            prev.map(m => m.id === userMessage.id 
              ? { ...m, id: response.user_message_id } 
              : m
            )
          );
        }
        
        // Create the AI response message
        const aiResponse: Message = {
          id: response.assistant_message_id || `ai-${Date.now()}`,
          content: response.response,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          session_id: response.session_id,
          references: selectedDocument ? [{name: selectedDocument.name, id: selectedDocument.id}] : undefined
        };
        
        // Add the AI response to the messages
        setMessages(prev => [...prev, aiResponse]);
        
        // If the API returned a different session ID than what we have (or we have none)
        if (response.session_id && (!currentSession || response.session_id !== currentSession)) {
          setCurrentSession(response.session_id);
          
          // Update the session in the list or add it if it's new
          const sessionExists = sessions.some(s => s.id === response.session_id);
          
          if (!sessionExists) {
            // If this is a new session, fetch its details or create a placeholder
            try {
              const sessionDetails = await getChatSession(response.session_id);
              setSessions(prev => [
                {
                  ...convertBackendSession(sessionDetails),
                  message_count: 2, // User message + AI response
                },
                ...prev
              ]);
            } catch (error) {
              // If we can't get session details, create a placeholder
              setSessions(prev => [
                {
                  id: response.session_id,
                  title: selectedDocument 
                    ? `Chat about ${selectedDocument.name}` 
                    : `New Chat ${new Date().toLocaleDateString()}`,
                  created_at: new Date().toISOString(),
                  message_count: 2 // User message + AI response
                },
                ...prev
              ]);
            }
          } else {
            // Update existing session message count
            setSessions(prev => 
              prev.map(s => s.id === response.session_id
                ? { ...s, message_count: (s.message_count || 0) + 2, last_message: messageSent }
                : s
              )
            );
          }
        }
      } else if (currentSession) {
          // Update the current session message count
          setSessions(prev => 
            prev.map(s => s.id === currentSession 
              ? { ...s, message_count: (s.message_count || 0) + 2, last_message: messageSent }
              : s
            )
          );
        }
      
    } catch (error) {
      handleApiError(error, "Failed to send message");
      
      // Fallback: create a simulated response
      setTimeout(() => {
        const aiResponse: Message = {
          id: `fallback-${Date.now()}`,
          content: "I've received your message, but I'm having trouble processing it right now. Our team has been notified of this issue. In the meantime, could you try again or rephrase your question?",
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          session_id: currentSession
        };
        
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    } finally {
      setLoading(false);
      // Clear selected document after use
      if (selectedDocument) {
        setSelectedDocument(null);
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    // For mock sessions, just remove from the UI without API call
    if (sessionId.startsWith('mock-')) {
      // Remove the session from the list
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If we deleted the current session, select another one or show empty state
      if (sessionId === currentSession) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSession(remainingSessions[0].id);
          loadChatMessages(remainingSessions[0].id);
        } else {
          setCurrentSession(null);
          setMessages([]);
        }
      }
      
      toast({
        title: "Chat session deleted",
        description: "The demo conversation has been removed.",
      });
      
      return;
    }
    
    try {
      await apiDeleteChatSession(sessionId);
      
      // Remove the session from the list
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If we deleted the current session, select another one or show empty state
      if (sessionId === currentSession) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSession(remainingSessions[0].id);
          loadChatMessages(remainingSessions[0].id);
        } else {
          setCurrentSession(null);
          setMessages([]);
        }
      }
      
      toast({
        title: "Chat session deleted",
        description: "The conversation has been removed.",
      });
    } catch (error) {
      handleApiError(error, "Failed to delete session");
      
      // Since deletion failed, we'll handle it gracefully by
      // removing the session from the UI anyway to maintain a good UX
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (sessionId === currentSession) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSession(remainingSessions[0].id);
          loadChatMessages(remainingSessions[0].id);
        } else {
          setCurrentSession(null);
          setMessages([]);
        }
      }
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MedIQ</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Chat Sessions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Chat Sessions</CardTitle>
                  <Button size="sm" onClick={createNewSession}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {loadingSessions ? (
                    <div className="p-4 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Loading sessions...</p>
                    </div>
                  ) : sessions.length > 0 ? (
                    <div className="space-y-2 p-4">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors flex items-start ${
                            currentSession === session.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div 
                            className="flex-1 min-w-0 pr-2"
                            onClick={() => {
                              setCurrentSession(session.id)
                              loadChatMessages(session.id)
                            }}
                          >
                            <h3 className="font-medium text-sm truncate">{session.title}</h3>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-500">
                                {session.message_count} messages
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(session.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 rounded-full opacity-50 hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete chat session</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this chat session? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSession(session.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No chat sessions yet</p>
                      <Button size="sm" className="mt-2" onClick={createNewSession}>
                        Start your first chat
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>AI Health Assistant</span>
                  </CardTitle>
                  
                  {currentSession?.startsWith('mock-') && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Demo Mode
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Start a conversation
                        </h3>
                        <p className="text-gray-600">
                          Ask me anything about your health, medical documents, or symptoms.
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex space-x-3 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className="flex-shrink-0">
                              {message.sender === 'user' ? (
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                  <Bot className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div className={`rounded-lg p-3 ${
                              message.sender === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              {message.references && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {message.references.map((ref, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      <FileText className="h-3 w-3 mr-1" />
                                      {typeof ref === 'string' ? ref : ref.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <div className="flex flex-col gap-1 mt-1">
                                {/* Document reference display */}
                                {message.references && message.references.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-3 h-3 opacity-70" />
                                    <span className={`text-xs ${
                                      message.sender === 'user' ? 'opacity-70' : 'text-blue-600'
                                    }`}>
                                      {message.references.map(ref => 
                                        typeof ref === 'string' ? ref : ref.name
                                      ).join(', ')}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Document text display for user messages */}
                                {message.sender === 'user' && message.document_text && (
                                  <div className="mt-1 p-2 bg-blue-700/30 rounded text-xs text-white/90 max-h-20 overflow-y-auto">
                                    <p className="font-semibold mb-1">Context from document:</p>
                                    <p className="line-clamp-3">{message.document_text.substring(0, 200)}...</p>
                                  </div>
                                )}
                                
                                <p className="text-xs opacity-70">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {loading && (
                      <div className="flex justify-start">
                        <div className="flex space-x-3 max-w-3xl">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-gray-600">AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2 items-center">
                      <DocumentSelector 
                        onDocumentSelect={setSelectedDocument}
                        selectedDocument={selectedDocument}
                      />
                      
                      {selectedDocument && (
                        <Badge variant="outline" className="flex gap-1 items-center">
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{selectedDocument.name}</span>
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Ask about your health, symptoms, or medical documents..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        className="flex-1"
                      />
                      <Button 
                        onClick={sendMessage} 
                        disabled={loading || !inputMessage.trim()}
                        size="sm"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

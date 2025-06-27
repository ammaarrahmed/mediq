'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'

export default function ChatSessionPage() {
  const { session_id } = useParams()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [doc, setDoc] = useState<any>(null)

  useEffect(() => {
    if (!session_id) return
    fetchMessages()
  }, [session_id])

  const fetchMessages = async () => {
    const res = await fetch(`http://localhost:8000/chat/history/${session_id}`)
    const data = await res.json()
    setMessages(data)

    // Also get doc content from Supabase (assuming chat_sessions has doc_id)
    const { data: sessionData } = await supabase
      .from('chat_sessions')
      .select('document_id')
      .eq('id', session_id)
      .single()

    let docData = null
    if (sessionData && sessionData.document_id) {
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('id', sessionData.document_id)
        .single()
      docData = data
    }

    setDoc(docData)
  }

  const handleAsk = async () => {
    if (!input || !doc) return

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id,
    document_text: doc.text,
    user_message: input
  })
})


    const data = await res.json()
    setMessages(prev => [
      ...prev,
      { role: 'user', content: input },
      { role: 'assistant', content: data.response }
    ])
    setInput('')
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Chat Session: {session_id}</h1>

      <div className="bg-gray-100 rounded p-4 mb-4 max-h-[400px] overflow-y-auto">
        {messages.map((msg, i) => (
  <div key={i} className={`mb-2 max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 self-end ml-auto' : 'bg-green-100 self-start mr-auto'}`}>
    <strong className="block text-sm capitalize mb-1">{msg.role}</strong>
    <div className="prose prose-sm">
      <ReactMarkdown>{msg.content}</ReactMarkdown>
    </div>
  </div>
))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border p-2 w-full"
          placeholder="Ask something..."
        />
        <button onClick={handleAsk} className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  )
}

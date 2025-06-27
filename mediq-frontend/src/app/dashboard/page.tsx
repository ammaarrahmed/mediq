'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
export default function Dashboard() {
  const [docs, setDocs] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchDocs = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)

      setDocs(data || [])
    }

    fetchDocs()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Your Documents</h1>
      {docs.map(doc => (
        <div key={doc.id} className="border p-4 mb-2 rounded shadow">
          <p><strong>Summary:</strong> {doc.summary}</p>
          <p><strong>Symptoms:</strong> {doc.symptoms_detected?.join(', ')}</p>
        </div>
      ))}
    </div>
  )
}

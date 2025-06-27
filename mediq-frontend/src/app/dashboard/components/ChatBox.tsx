'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function UploadBox({ onUploaded }: { onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!file) return alert('Please select a file.')
    setUploading(true)

    // Step 1: Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()
    if (userError || !user) return alert('Login required')

    const filename = `${user.id}/${Date.now()}_${file.name}`

    // Step 2: Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filename, file)

    if (uploadError) return alert('Upload failed.')

    // Step 3: Get Public URL
    const { data } = supabase.storage.from('documents').getPublicUrl(filename)
    const publicUrl = data.publicUrl

    // Step 4: Call FastAPI endpoint
    const res = await fetch('http://localhost:8000/process-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_url: publicUrl,
        user_id: user.id
      })
    })

    if (!res.ok) {
      alert('Failed to send to backend')
    } else {
      alert('Uploaded and processing!')
      onUploaded()
    }

    setUploading(false)
    setFile(null)
  }

  return (
    <div className="border p-4 rounded mb-4 shadow flex flex-col items-center gap-2">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload and Process'}
      </button>
    </div>
  )
}

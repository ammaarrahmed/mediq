'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (!error) router.push('/dashboard')
    else alert(error.message)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} className="border p-2 mb-2" />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} className="border p-2 mb-2" />
      <button onClick={handleSignup} className="bg-blue-600 text-white px-4 py-2 rounded">Sign Up</button>
    </div>
  )
}
